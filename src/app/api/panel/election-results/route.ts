import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, collection, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { ElectionResultCreateSchema, ElectionResultQuerySchema } from '@/lib/validation/public';

export async function GET(req: Request) {
  const auth = await requirePanelAction('election:manage');
  if (auth.response) return auth.response;

  const url = new URL(req.url);
  const parsed = ElectionResultQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid election result filters.', parsed.error.flatten());

  const { page, pageSize, electionId, postId, outcome, q } = parsed.data;
  const where: Prisma.ElectionResultWhereInput = {
    ...(electionId ? { electionId } : {}),
    ...(postId ? { postId } : {}),
    ...(outcome ? { outcome } : {}),
    ...(q ? { OR: [{ candidate: { applicantName: { contains: q, mode: 'insensitive' } } }, { post: { name: { contains: q, mode: 'insensitive' } } }] } : {}),
  };

  try {
    const [items, total] = await Promise.all([
      prisma.electionResult.findMany({
        where,
        include: { election: true, post: true, candidate: true },
        orderBy: { declaredAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.electionResult.count({ where }),
    ]);

    return collection(items, { page, pageSize, total });
  } catch {
    return unexpectedError();
  }
}

export async function POST(req: Request) {
  const auth = await requirePanelAction('election:manage');
  if (auth.response) return auth.response;

  const body = await readJsonBody(req);
  const parsed = ElectionResultCreateSchema.safeParse(body);
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid election result payload.', parsed.error.flatten());

  try {
    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.electionResult.create({ data: parsed.data });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'ELECTION_RESULT_CREATED',
          targetType: 'ElectionResult',
          targetId: created.id,
        },
      });
      return created;
    });

    return ok(result, { status: 201 });
  } catch {
    return unexpectedError();
  }
}

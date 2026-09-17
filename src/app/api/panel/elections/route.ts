import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, collection, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { ElectionCreateSchema, ElectionQuerySchema } from '@/lib/validation/public';

export async function GET(req: Request) {
  const auth = await requirePanelAction('election:manage');
  if (auth.response) return auth.response;

  const url = new URL(req.url);
  const parsed = ElectionQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid election filters.', parsed.error.flatten());

  const { page, pageSize, committeeId, status, q } = parsed.data;
  const where: Prisma.ElectionWhereInput = {
    ...(committeeId ? { committeeId } : {}),
    ...(status ? { status } : {}),
    ...(q ? { OR: [{ id: { contains: q, mode: 'insensitive' } }, { resultDeclarationUrl: { contains: q, mode: 'insensitive' } }] } : {}),
  };

  try {
    const [items, total] = await Promise.all([
      prisma.election.findMany({
        where,
        include: { committee: true, candidates: true, results: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.election.count({ where }),
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
  const parsed = ElectionCreateSchema.safeParse(body);
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid election payload.', parsed.error.flatten());

  try {
    const election = await prisma.$transaction(async (tx) => {
      const created = await tx.election.create({ data: parsed.data });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'ELECTION_CREATED',
          targetType: 'Election',
          targetId: created.id,
        },
      });
      return created;
    });

    return ok(election, { status: 201 });
  } catch {
    return unexpectedError();
  }
}

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, collection, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { CandidateCreateSchema, CandidateQuerySchema } from '@/lib/validation/public';

export async function GET(req: Request) {
  const auth = await requirePanelAction('election:manage');
  if (auth.response) return auth.response;

  const url = new URL(req.url);
  const parsed = CandidateQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid candidate filters.', parsed.error.flatten());

  const { page, pageSize, electionId, status, q } = parsed.data;
  const where: Prisma.CandidateWhereInput = {
    ...(electionId ? { electionId } : {}),
    ...(status ? { status } : {}),
    ...(q ? { OR: [{ applicantName: { contains: q, mode: 'insensitive' } }, { studentId: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] } : {}),
  };

  try {
    const [items, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        include: {
          post: true,
          symbol: true,
          verifiedBy: { select: { id: true, name: true } },
          payment: true,
          electionResult: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.candidate.count({ where }),
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
  const parsed = CandidateCreateSchema.safeParse(body);
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid candidate payload.', parsed.error.flatten());

  try {
    const candidate = await prisma.$transaction(async (tx) => {
      const created = await tx.candidate.create({ data: parsed.data });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'CANDIDATE_CREATED',
          targetType: 'Candidate',
          targetId: created.id,
        },
      });
      return created;
    });

    return ok(candidate, { status: 201 });
  } catch {
    return unexpectedError();
  }
}

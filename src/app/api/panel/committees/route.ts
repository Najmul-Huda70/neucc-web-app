import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, collection, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { CommitteeCreateSchema, CommitteeQuerySchema } from '@/lib/validation/public';

export async function GET(req: Request) {
  const auth = await requirePanelAction('election:manage');
  if (auth.response) return auth.response;

  const url = new URL(req.url);
  const parsed = CommitteeQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid committee filters.', parsed.error.flatten());

  const { page, pageSize, type, status, q } = parsed.data;
  const where: Prisma.CommitteeWhereInput = {
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
    ...(q ? { id: { contains: q, mode: 'insensitive' } } : {}),
  };

  try {
    const [items, total] = await Promise.all([
      prisma.committee.findMany({
        where,
        include: { members: true, elections: true },
        orderBy: { startDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.committee.count({ where }),
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
  const parsed = CommitteeCreateSchema.safeParse(body);
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid committee payload.', parsed.error.flatten());

  try {
    const committee = await prisma.$transaction(async (tx) => {
      const created = await tx.committee.create({ data: parsed.data });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'COMMITTEE_CREATED',
          targetType: 'Committee',
          targetId: created.id,
        },
      });
      return created;
    });

    return ok(committee, { status: 201 });
  } catch {
    return unexpectedError();
  }
}

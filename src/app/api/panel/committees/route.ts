import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, collection, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { requireUser } from '@/lib/auth/session';
import { can } from '@/lib/auth/permissions';
import { CommitteeCreateSchema, CommitteeQuerySchema } from '@/lib/validation/public';

export async function GET(req: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  if (!can(auth.user, 'election:manage') && !can(auth.user, 'committee:create_election')) {
    return apiError(403, 'FORBIDDEN', 'You do not have permission to perform this action.');
  }

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
        include: {
          members: { select: { id: true, name: true, post: { select: { name: true } } } },
          elections: true,
        },
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
  const body = await readJsonBody(req);
  const parsed = CommitteeCreateSchema.safeParse(body);
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid committee payload.', parsed.error.flatten());

  // The Election Committee is formed by the outgoing President (SRS §5.3) —
  // NOT by an existing Election Committee member, so this cannot be gated by
  // "election:manage" (that permission only exists once an Election
  // Committee is already active, which would make forming the first one
  // impossible). The Executive Committee, in turn, is never created through
  // this manual endpoint — it's produced automatically by the election
  // result-declaration handover (SRS §5.3), or by prisma/onboard-admin.ts
  // for the very first one-time setup.
  if (parsed.data.type === 'EXECUTIVE') {
    return apiError(
      400,
      'MANUAL_EXECUTIVE_COMMITTEE_NOT_ALLOWED',
      'The Executive Committee cannot be created manually. It is produced automatically when election results are declared, or via the one-time prisma/onboard-admin.ts script.'
    );
  }

  const auth = await requirePanelAction('committee:create_election');
  if (auth.response) return auth.response;

  const existingActive = await prisma.committee.findFirst({
    where: { type: 'ELECTION', status: 'ACTIVE' },
    select: { id: true },
  });
  if (existingActive) {
    return apiError(409, 'ELECTION_COMMITTEE_ALREADY_ACTIVE', 'An active Election Committee already exists.');
  }

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

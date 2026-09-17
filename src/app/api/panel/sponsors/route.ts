import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, collection, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { SponsorCreateSchema, ContentPaginationSchema } from '@/lib/validation/public';

export async function GET(req: Request) {
  const auth = await requirePanelAction('content:view');
  if (auth.response) return auth.response;

  const url = new URL(req.url);
  const parsed = ContentPaginationSchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid sponsor filters.', parsed.error.flatten());

  const { page, pageSize, q } = parsed.data;
  const where: Prisma.SponsorWhereInput = q ? {
    OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ],
  } : {};

  try {
    const [items, total] = await Promise.all([
      prisma.sponsor.findMany({ where, orderBy: [{ tier: 'asc' }, { name: 'asc' }], skip: (page - 1) * pageSize, take: pageSize }),
      prisma.sponsor.count({ where }),
    ]);

    return collection(items, { page, pageSize, total });
  } catch {
    return unexpectedError();
  }
}

export async function POST(req: Request) {
  const auth = await requirePanelAction('content:manage');
  if (auth.response) return auth.response;

  const body = await readJsonBody(req);
  const parsed = SponsorCreateSchema.safeParse(body);
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid sponsor data.', parsed.error.flatten());

  try {
    const item = await prisma.$transaction(async (tx) => {
      const created = await tx.sponsor.create({ data: parsed.data });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'SPONSOR_CREATED',
          targetType: 'Sponsor',
          targetId: created.id,
        },
      });
      return created;
    });

    return ok(item, { status: 201 });
  } catch {
    return unexpectedError();
  }
}

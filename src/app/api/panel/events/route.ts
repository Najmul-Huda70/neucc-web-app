import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, collection, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { EventCreateSchema, PanelEventsQuerySchema } from '@/lib/validation/public';

export async function GET(req: Request) {
  const auth = await requirePanelAction('event:view');
  if (auth.response) return auth.response;

  const url = new URL(req.url);
  const parsed = PanelEventsQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid event filters.', parsed.error.flatten());

  const { page, pageSize, status, category, q } = parsed.data;
  const where: Prisma.EventWhereInput = {
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
    ...(q ? { OR: [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ] } : {}),
  };

  try {
    const [events, total] = await Promise.all([
      prisma.event.findMany({ where, orderBy: { date: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.event.count({ where }),
    ]);
    return collection(events, { page, pageSize, total });
  } catch {
    return unexpectedError();
  }
}

export async function POST(req: Request) {
  const auth = await requirePanelAction('event:manage');
  if (auth.response) return auth.response;

  const body = await readJsonBody(req);
  const parsed = EventCreateSchema.safeParse(body);
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid event data.', parsed.error.flatten());

  try {
    const event = await prisma.$transaction(async (tx) => {
      const created = await tx.event.create({ data: { ...parsed.data, createdById: auth.user.id } });
      await tx.auditLog.create({ data: { actorId: auth.user.id, action: 'EVENT_CREATED', targetType: 'Event', targetId: created.id } });
      return created;
    });
    return ok(event, { status: 201 });
  } catch {
    return unexpectedError();
  }
}

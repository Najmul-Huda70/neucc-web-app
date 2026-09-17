import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { EventUpdateSchema } from '@/lib/validation/public';

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Context) {
  const auth = await requirePanelAction('event:view');
  if (auth.response) return auth.response;
  const { id } = await params;

  try {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return apiError(404, 'NOT_FOUND', 'Event not found.');
    return ok(event);
  } catch {
    return unexpectedError();
  }
}

export async function PATCH(req: Request, { params }: Context) {
  const auth = await requirePanelAction('event:manage');
  if (auth.response) return auth.response;
  const { id } = await params;
  const parsed = EventUpdateSchema.safeParse(await readJsonBody(req));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid event data.', parsed.error.flatten());

  try {
    const event = await prisma.$transaction(async (tx) => {
      const existing = await tx.event.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return null;
      const updated = await tx.event.update({ where: { id }, data: parsed.data });
      await tx.auditLog.create({ data: { actorId: auth.user.id, action: 'EVENT_UPDATED', targetType: 'Event', targetId: id } });
      return updated;
    });
    if (!event) return apiError(404, 'NOT_FOUND', 'Event not found.');
    return ok(event);
  } catch {
    return unexpectedError();
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  const auth = await requirePanelAction('event:manage');
  if (auth.response) return auth.response;
  const { id } = await params;

  try {
    const deleted = await prisma.$transaction(async (tx) => {
      const existing = await tx.event.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return false;
      await tx.event.delete({ where: { id } });
      await tx.auditLog.create({ data: { actorId: auth.user.id, action: 'EVENT_DELETED', targetType: 'Event', targetId: id } });
      return true;
    });
    if (!deleted) return apiError(404, 'NOT_FOUND', 'Event not found.');
    return ok({ id });
  } catch {
    return unexpectedError();
  }
}

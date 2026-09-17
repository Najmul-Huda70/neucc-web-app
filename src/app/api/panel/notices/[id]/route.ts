import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { noticePublishAction } from '@/lib/auth/notice-actions';
import { NoticeUpdateSchema } from '@/lib/validation/public';

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Context) {
  const auth = await requirePanelAction('notice:view:general');
  if (auth.response) return auth.response;
  const { id } = await params;

  try {
    const notice = await prisma.notice.findUnique({ where: { id } });
    if (!notice) return apiError(404, 'NOT_FOUND', 'Notice not found.');
    const view = await requirePanelAction(notice.scope === 'GENERAL' ? 'notice:view:general' : notice.scope === 'INTERNAL' ? 'notice:view:internal' : 'notice:view:election');
    if (view.response) return view.response;
    return ok(notice);
  } catch {
    return unexpectedError();
  }
}

export async function PATCH(req: Request, { params }: Context) {
  const { id } = await params;
  const parsed = NoticeUpdateSchema.safeParse(await readJsonBody(req));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid notice data.', parsed.error.flatten());

  try {
    const existing = await prisma.notice.findUnique({ where: { id }, select: { scope: true } });
    if (!existing) return apiError(404, 'NOT_FOUND', 'Notice not found.');
    const auth = await requirePanelAction(noticePublishAction(parsed.data.scope ?? existing.scope));
    if (auth.response) return auth.response;

    const notice = await prisma.$transaction(async (tx) => {
      const updated = await tx.notice.update({ where: { id }, data: parsed.data });
      await tx.auditLog.create({ data: { actorId: auth.user.id, action: 'NOTICE_UPDATED', targetType: 'Notice', targetId: id } });
      return updated;
    });
    return ok(notice);
  } catch {
    return unexpectedError();
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  const { id } = await params;

  try {
    const existing = await prisma.notice.findUnique({ where: { id }, select: { scope: true } });
    if (!existing) return apiError(404, 'NOT_FOUND', 'Notice not found.');
    const auth = await requirePanelAction(noticePublishAction(existing.scope));
    if (auth.response) return auth.response;

    await prisma.$transaction(async (tx) => {
      await tx.notice.delete({ where: { id } });
      await tx.auditLog.create({ data: { actorId: auth.user.id, action: 'NOTICE_DELETED', targetType: 'Notice', targetId: id } });
    });
    return ok({ id });
  } catch {
    return unexpectedError();
  }
}

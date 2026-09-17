import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { AchievementUpdateSchema } from '@/lib/validation/public';

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Context) {
  const auth = await requirePanelAction('content:view');
  if (auth.response) return auth.response;
  const { id } = await params;

  try {
    const item = await prisma.achievement.findUnique({ where: { id } });
    if (!item) return apiError(404, 'NOT_FOUND', 'Achievement not found.');
    return ok(item);
  } catch {
    return unexpectedError();
  }
}

export async function PATCH(req: Request, { params }: Context) {
  const auth = await requirePanelAction('content:manage');
  if (auth.response) return auth.response;
  const { id } = await params;
  const parsed = AchievementUpdateSchema.safeParse(await readJsonBody(req));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid achievement data.', parsed.error.flatten());

  try {
    const item = await prisma.$transaction(async (tx) => {
      const existing = await tx.achievement.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return null;
      const updated = await tx.achievement.update({ where: { id }, data: parsed.data });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'ACHIEVEMENT_UPDATED',
          targetType: 'Achievement',
          targetId: id,
        },
      });
      return updated;
    });

    if (!item) return apiError(404, 'NOT_FOUND', 'Achievement not found.');
    return ok(item);
  } catch {
    return unexpectedError();
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  const auth = await requirePanelAction('content:manage');
  if (auth.response) return auth.response;
  const { id } = await params;

  try {
    const deleted = await prisma.$transaction(async (tx) => {
      const existing = await tx.achievement.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return false;
      await tx.achievement.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'ACHIEVEMENT_DELETED',
          targetType: 'Achievement',
          targetId: id,
        },
      });
      return true;
    });

    if (!deleted) return apiError(404, 'NOT_FOUND', 'Achievement not found.');
    return ok({ id });
  } catch {
    return unexpectedError();
  }
}

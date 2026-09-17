import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { ElectionUpdateSchema } from '@/lib/validation/public';

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Context) {
  const auth = await requirePanelAction('election:manage');
  if (auth.response) return auth.response;
  const { id } = await params;

  try {
    const item = await prisma.election.findUnique({ where: { id }, include: { committee: true, candidates: true, results: true } });
    if (!item) return apiError(404, 'NOT_FOUND', 'Election not found.');
    return ok(item);
  } catch {
    return unexpectedError();
  }
}

export async function PATCH(req: Request, { params }: Context) {
  const auth = await requirePanelAction('election:manage');
  if (auth.response) return auth.response;
  const { id } = await params;
  const parsed = ElectionUpdateSchema.safeParse(await readJsonBody(req));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid election data.', parsed.error.flatten());

  try {
    const item = await prisma.$transaction(async (tx) => {
      const existing = await tx.election.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return null;
      const updated = await tx.election.update({ where: { id }, data: parsed.data });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'ELECTION_UPDATED',
          targetType: 'Election',
          targetId: id,
        },
      });
      return updated;
    });

    if (!item) return apiError(404, 'NOT_FOUND', 'Election not found.');
    return ok(item);
  } catch {
    return unexpectedError();
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  const auth = await requirePanelAction('election:manage');
  if (auth.response) return auth.response;
  const { id } = await params;

  try {
    const deleted = await prisma.$transaction(async (tx) => {
      const existing = await tx.election.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return false;
      await tx.election.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'ELECTION_DELETED',
          targetType: 'Election',
          targetId: id,
        },
      });
      return true;
    });

    if (!deleted) return apiError(404, 'NOT_FOUND', 'Election not found.');
    return ok({ id });
  } catch {
    return unexpectedError();
  }
}

import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { PaymentUpdateSchema } from '@/lib/validation/public';

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Context) {
  const auth = await requirePanelAction('election:manage');
  if (auth.response) return auth.response;
  const { id } = await params;

  try {
    const item = await prisma.payment.findUnique({ where: { id }, include: { candidate: true, verifiedBy: true } });
    if (!item) return apiError(404, 'NOT_FOUND', 'Payment not found.');
    return ok(item);
  } catch {
    return unexpectedError();
  }
}

export async function PATCH(req: Request, { params }: Context) {
  const auth = await requirePanelAction('election:manage');
  if (auth.response) return auth.response;
  const { id } = await params;
  const parsed = PaymentUpdateSchema.safeParse(await readJsonBody(req));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid payment data.', parsed.error.flatten());

  try {
    const item = await prisma.$transaction(async (tx) => {
      const existing = await tx.payment.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return null;
      const updated = await tx.payment.update({ where: { id }, data: parsed.data });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'PAYMENT_UPDATED',
          targetType: 'Payment',
          targetId: id,
        },
      });
      return updated;
    });

    if (!item) return apiError(404, 'NOT_FOUND', 'Payment not found.');
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
      const existing = await tx.payment.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return false;
      await tx.payment.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'PAYMENT_DELETED',
          targetType: 'Payment',
          targetId: id,
        },
      });
      return true;
    });

    if (!deleted) return apiError(404, 'NOT_FOUND', 'Payment not found.');
    return ok({ id });
  } catch {
    return unexpectedError();
  }
}

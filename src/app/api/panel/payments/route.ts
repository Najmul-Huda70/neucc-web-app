import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, collection, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { PaymentCreateSchema, PaymentQuerySchema } from '@/lib/validation/public';

export async function GET(req: Request) {
  const auth = await requirePanelAction('election:manage');
  if (auth.response) return auth.response;

  const url = new URL(req.url);
  const parsed = PaymentQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid payment filters.', parsed.error.flatten());

  const { page, pageSize, candidateId, method, q } = parsed.data;
  const where: Prisma.PaymentWhereInput = {
    ...(candidateId ? { candidateId } : {}),
    ...(method ? { method } : {}),
    ...(q ? { OR: [{ transactionRef: { contains: q, mode: 'insensitive' } }, { paidToMember: { contains: q, mode: 'insensitive' } }] } : {}),
  };

  try {
    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: { candidate: true, verifiedBy: { select: { id: true, name: true } } },
        orderBy: { paidAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.payment.count({ where }),
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
  const parsed = PaymentCreateSchema.safeParse(body);
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid payment payload.', parsed.error.flatten());

  try {
    const payment = await prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({ data: parsed.data });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'PAYMENT_CREATED',
          targetType: 'Payment',
          targetId: created.id,
        },
      });
      return created;
    });

    return ok(payment, { status: 201 });
  } catch {
    return unexpectedError();
  }
}

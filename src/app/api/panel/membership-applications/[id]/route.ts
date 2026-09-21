import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { MembershipStatusUpdateSchema } from '@/lib/validation/public';

type Context = { params: Promise<{ id: string }> };

// PATCH /api/panel/membership-applications/:id — { "status": "APPROVED" | "REJECTED" }
export async function PATCH(req: Request, { params }: Context) {
  const auth = await requirePanelAction('membership:manage');
  if (auth.response) return auth.response;
  const { id } = await params;

  const parsed = MembershipStatusUpdateSchema.safeParse(await readJsonBody(req));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid status.', parsed.error.flatten());

  const existing = await prisma.membershipApplication.findUnique({ where: { id } });
  if (!existing) return apiError(404, 'NOT_FOUND', 'Application not found.');
  if (existing.status !== 'PENDING') {
    return apiError(409, 'ALREADY_DECIDED', `This application was already marked ${existing.status}.`);
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const application = await tx.membershipApplication.update({
        where: { id },
        data: { status: parsed.data.status },
      });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: parsed.data.status === 'APPROVED' ? 'MEMBERSHIP_APPLICATION_APPROVED' : 'MEMBERSHIP_APPLICATION_REJECTED',
          targetType: 'MembershipApplication',
          targetId: application.id,
        },
      });
      return application;
    });
    return ok(updated);
  } catch {
    return unexpectedError();
  }
}

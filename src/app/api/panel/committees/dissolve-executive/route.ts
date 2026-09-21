import { prisma } from '@/lib/prisma';
import { apiError, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';

// POST /api/panel/committees/dissolve-executive — Chief Election
// Commissioner-only, and only once the President has granted access
// (`election:dissolve_executive`, Step 3). This is the step that starts the
// annual handover cycle (SRS §5.3):
//   Executive Committee → dissolved here → election runs → publish-results
//   (Step 6, not yet built) creates the next Executive Committee.
//
// Deliberately its own endpoint rather than the generic
// `PATCH /api/panel/committees/:id` — that route is still gated by
// `election:manage`, which is the wrong (looser) permission for an action
// this consequential, and it requires knowing the committee's id up front.
// There is always at most one ACTIVE Executive Committee, so this endpoint
// looks it up itself.
export async function POST() {
  const auth = await requirePanelAction('election:dissolve_executive');
  if (auth.response) return auth.response;

  const activeExecutive = await prisma.committee.findFirst({
    where: { type: 'EXECUTIVE', status: 'ACTIVE' },
  });
  if (!activeExecutive) {
    return apiError(400, 'NO_ACTIVE_EXECUTIVE_COMMITTEE', 'There is no active Executive Committee to dissolve.');
  }

  try {
    const dissolved = await prisma.$transaction(async (tx) => {
      const committee = await tx.committee.update({
        where: { id: activeExecutive.id },
        data: { status: 'DISSOLVED', dissolvedAt: new Date() },
        include: { members: { select: { id: true, name: true, post: { select: { name: true } } } } },
      });

      // No separate step needed to revoke each member's access: session.ts's
      // getCurrentUser() already re-checks committee.status on every request
      // and rejects DISSOLVED committees, so access is cut the moment this
      // transaction commits.
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'EXECUTIVE_COMMITTEE_DISSOLVED',
          targetType: 'Committee',
          targetId: committee.id,
          metadata: { memberCount: committee.members.length },
        },
      });

      return committee;
    });

    return ok(dissolved);
  } catch {
    return unexpectedError();
  }
}

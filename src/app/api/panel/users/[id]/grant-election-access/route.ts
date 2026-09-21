import { prisma } from '@/lib/prisma';
import { apiError, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { sendMail } from '@/lib/email/mailer';
import { electionAccessGrantedEmail } from '@/lib/email/templates';

type Context = { params: Promise<{ id: string }> };

const SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  electionAccessGranted: true,
  post: { select: { id: true, name: true } },
  committee: { select: { id: true, type: true, status: true } },
} as const;

async function loadEligibleCandidate(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      electionAccessGranted: true,
      post: { select: { name: true } },
      committee: { select: { status: true } },
    },
  });
}

// POST /api/panel/users/[id]/grant-election-access — President-only
// (`election:grant_access`). Flips `electionAccessGranted` to true for the
// target user, which is the only thing that unlocks
// `election:dissolve_executive` for them in permissions.ts (Step 4).
//
// This is deliberately its own endpoint rather than a field on the generic
// `PATCH /api/panel/users/:id` (Step 2) — granting election access is a
// distinct, one-time governance action with its own audit trail, not a
// routine profile edit.
export async function POST(_req: Request, { params }: Context) {
  const auth = await requirePanelAction('election:grant_access');
  if (auth.response) return auth.response;
  const { id } = await params;

  const target = await loadEligibleCandidate(id);
  if (!target) return apiError(404, 'NOT_FOUND', 'User not found.');
  if (target.role !== 'ELECTION_COMMITTEE' || target.committee?.status !== 'ACTIVE') {
    return apiError(400, 'NOT_ACTIVE_ELECTION_COMMITTEE', 'Election access can only be granted to an active Election Committee member.');
  }
  if (target.post?.name !== 'Chief Election Commissioner') {
    return apiError(400, 'WRONG_POST', 'Election access can only be granted to the Chief Election Commissioner.');
  }
  if (target.electionAccessGranted) {
    return apiError(409, 'ALREADY_GRANTED', 'This user already has election module access.');
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: { electionAccessGranted: true },
        select: SAFE_SELECT,
      });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'ELECTION_MODULE_ACCESS_GRANTED',
          targetType: 'User',
          targetId: id,
        },
      });
      return updated;
    });

    // Best-effort, outside the transaction, same reasoning as Step 6's
    // credential emails — a failed/unconfigured SMTP server must not block
    // an already-committed governance action.
    const { subject, text, html } = electionAccessGrantedEmail({ name: user.name });
    await sendMail({ to: user.email, subject, text, html });

    return ok(user);
  } catch {
    return unexpectedError();
  }
}

// DELETE /api/panel/users/[id]/grant-election-access — President-only.
// Not in the original SRS wording, but a President who granted access by
// mistake (or an election cycle that gets called off) needs a way to undo
// it — without this, the only fix would be a direct database edit.
export async function DELETE(_req: Request, { params }: Context) {
  const auth = await requirePanelAction('election:grant_access');
  if (auth.response) return auth.response;
  const { id } = await params;

  const target = await loadEligibleCandidate(id);
  if (!target) return apiError(404, 'NOT_FOUND', 'User not found.');
  if (!target.electionAccessGranted) {
    return apiError(409, 'NOT_GRANTED', 'This user does not currently have election module access.');
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: { electionAccessGranted: false },
        select: SAFE_SELECT,
      });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'ELECTION_MODULE_ACCESS_REVOKED',
          targetType: 'User',
          targetId: id,
        },
      });
      return updated;
    });

    return ok(user);
  } catch {
    return unexpectedError();
  }
}

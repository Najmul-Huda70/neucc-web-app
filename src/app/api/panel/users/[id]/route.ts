import { Prisma, type Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { hashPassword } from '@/lib/auth/passwords';
import { UserUpdateSchema } from '@/lib/validation/public';

type Context = { params: Promise<{ id: string }> };

const SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  studentId: true,
  batch: true,
  electionAccessGranted: true,
  post: { select: { id: true, name: true } },
  committee: { select: { id: true, type: true, status: true } },
  createdAt: true,
  updatedAt: true,
} as const;

// GET /api/panel/users/[id]
export async function GET(_req: Request, { params }: Context) {
  const auth = await requirePanelAction('user:manage');
  if (auth.response) return auth.response;
  const { id } = await params;

  try {
    const item = await prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
    if (!item) return apiError(404, 'NOT_FOUND', 'User not found.');
    return ok(item);
  } catch {
    return unexpectedError();
  }
}

// PATCH /api/panel/users/[id] — rename, move committee/post, reset password,
// or set status to ACTIVE/REVOKED. Moving `committeeId` re-derives `role`
// from the new committee's type, same as create, so a moved user can never
// end up with a role that doesn't match their committee.
//
// Deliberately does NOT accept `electionAccessGranted` — that only changes
// through the dedicated grant-access endpoint (Step 3).
export async function PATCH(req: Request, { params }: Context) {
  const auth = await requirePanelAction('user:manage');
  if (auth.response) return auth.response;
  const { id } = await params;

  const body = await readJsonBody(req);
  const parsed = UserUpdateSchema.safeParse(body);
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid user payload.', parsed.error.flatten());

  const existing = await prisma.user.findUnique({ where: { id }, select: { id: true, committeeId: true } });
  if (!existing) return apiError(404, 'NOT_FOUND', 'User not found.');

  const { postId, committeeId, password, ...rest } = parsed.data;

  if (postId) {
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
    if (!post) return apiError(404, 'NOT_FOUND', 'Post not found.');
  }

  let role: Role | undefined;
  if (committeeId !== undefined) {
    if (committeeId === null) {
      return apiError(400, 'COMMITTEE_REQUIRED', 'A user must belong to a committee; use status=REVOKED to remove access instead of unsetting the committee.');
    }
    const committee = await prisma.committee.findUnique({ where: { id: committeeId }, select: { type: true, status: true } });
    if (!committee) return apiError(404, 'NOT_FOUND', 'Committee not found.');
    if (committee.status !== 'ACTIVE') {
      return apiError(400, 'COMMITTEE_NOT_ACTIVE', 'Cannot move a member into a dissolved committee.');
    }
    role = committee.type === 'ELECTION' ? 'ELECTION_COMMITTEE' : 'EXECUTIVE_COMMITTEE';
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: {
          ...rest,
          ...(postId ? { postId } : {}),
          ...(committeeId ? { committeeId, role } : {}),
          ...(password ? { passwordHash: await hashPassword(password) } : {}),
        },
        select: SAFE_SELECT,
      });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'USER_UPDATED',
          targetType: 'User',
          targetId: id,
          metadata: {
            fields: Object.keys(parsed.data),
            ...(committeeId ? { movedToCommitteeId: committeeId, newRole: role } : {}),
            ...(rest.status ? { statusChangedTo: rest.status } : {}),
          },
        },
      });
      return updated;
    });

    return ok(user);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return apiError(409, 'EMAIL_TAKEN', 'A user with this email already exists.');
    }
    return unexpectedError();
  }
}

// No DELETE here, deliberately: a User row is referenced by AuditLog,
// verified candidates/payments, published notices, logged transactions, and
// more — hard-deleting it would either fail on the foreign keys or silently
// orphan the historical record. Use PATCH { "status": "REVOKED" } instead,
// which is what actually blocks login (see getCurrentUser in session.ts).

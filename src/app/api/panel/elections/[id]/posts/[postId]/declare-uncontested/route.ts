import { prisma } from '@/lib/prisma';
import { apiError, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';

type Context = { params: Promise<{ id: string; postId: string }> };

// POST /api/panel/elections/:id/posts/:postId/declare-uncontested
//
// Use when exactly one Verified (or already Symbol-Allotted) candidate
// applied for a post — no vote is needed for that post; they win by default
// (SRS §6.1.3). Resolves the sole candidate itself rather than taking a
// candidateId, so the committee can't accidentally declare the wrong person
// uncontested for a post that actually has more than one applicant.
//
// Sets both `status: "UNOPPOSED"` (so the verification-workflow status field
// reflects reality) and `isUnopposed: true` (an explicit, queryable flag
// independent of status) — the schema carries both, so this keeps them in
// sync rather than picking one.
export async function POST(_req: Request, { params }: Context) {
  const auth = await requirePanelAction('election:manage');
  if (auth.response) return auth.response;
  const { id, postId } = await params;

  const [election, post] = await Promise.all([
    prisma.election.findUnique({ where: { id }, select: { id: true } }),
    prisma.post.findUnique({ where: { id: postId }, select: { id: true, name: true } }),
  ]);
  if (!election) return apiError(404, 'NOT_FOUND', 'Election not found.');
  if (!post) return apiError(404, 'NOT_FOUND', 'Post not found.');

  const eligible = await prisma.candidate.findMany({
    where: { electionId: id, postId, status: { in: ['VERIFIED', 'SYMBOL_ALLOTTED'] } },
    select: { id: true, applicantName: true },
  });

  if (eligible.length !== 1) {
    return apiError(
      400,
      'NOT_EXACTLY_ONE_CANDIDATE',
      `Expected exactly 1 verified candidate for ${post.name}, found ${eligible.length}.`
    );
  }
  const [winner] = eligible;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const candidate = await tx.candidate.update({
        where: { id: winner.id },
        data: { status: 'UNOPPOSED', isUnopposed: true },
      });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'POST_DECLARED_UNCONTESTED',
          targetType: 'Candidate',
          targetId: candidate.id,
          metadata: { electionId: id, postId, applicantName: winner.applicantName },
        },
      });
      return candidate;
    });

    return ok(updated);
  } catch {
    return unexpectedError();
  }
}

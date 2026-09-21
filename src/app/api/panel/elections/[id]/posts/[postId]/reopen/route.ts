import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { z } from 'zod';

type Context = { params: Promise<{ id: string; postId: string }> };

const ReopenBodySchema = z.object({
  newDeadline: z.coerce.date().optional(),
});

// POST /api/panel/elections/:id/posts/:postId/reopen
//
// Use when a post has zero (non-rejected) applications as the deadline
// approaches or passes: opens the post to every member regardless of
// Post.eligibleYear, and optionally pushes the application deadline out to
// give them time to apply (SRS §6.1.3).
//
// This only records the fact that the post was reopened
// (`Election.reopenedPostIds`). It does not itself relax any check on
// candidate creation, because `POST /api/panel/candidates` doesn't enforce
// `Post.eligibleYear` at all today — candidates are recorded by the
// committee, not self-submitted. Enforcing eligibility (waived or not) is a
// separate gap, not in this step's scope; `Candidate.eligibilityWaived`
// remains a plain field the committee sets by hand when they record a
// candidate who applied under a reopened post.
export async function POST(req: Request, { params }: Context) {
  const auth = await requirePanelAction('election:manage');
  if (auth.response) return auth.response;
  const { id, postId } = await params;

  const parsed = ReopenBodySchema.safeParse(await readJsonBody(req));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid request body.', parsed.error.flatten());

  const [election, post] = await Promise.all([
    prisma.election.findUnique({ where: { id }, select: { id: true, reopenedPostIds: true } }),
    prisma.post.findUnique({ where: { id: postId }, select: { id: true, name: true } }),
  ]);
  if (!election) return apiError(404, 'NOT_FOUND', 'Election not found.');
  if (!post) return apiError(404, 'NOT_FOUND', 'Post not found.');

  if (election.reopenedPostIds.includes(postId)) {
    return apiError(409, 'ALREADY_REOPENED', `${post.name} has already been reopened to all members for this election.`);
  }

  const existingApplicants = await prisma.candidate.count({
    where: { electionId: id, postId, status: { not: 'REJECTED' } },
  });
  if (existingApplicants > 0) {
    return apiError(
      400,
      'POST_HAS_APPLICANTS',
      `${post.name} already has ${existingApplicants} application(s) — reopening is only for posts with zero applicants.`
    );
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const election2 = await tx.election.update({
        where: { id },
        data: {
          reopenedPostIds: { push: postId },
          ...(parsed.data.newDeadline ? { applicationDeadline: parsed.data.newDeadline } : {}),
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'POST_REOPENED_TO_ALL_MEMBERS',
          targetType: 'Post',
          targetId: postId,
          metadata: { electionId: id, newDeadline: parsed.data.newDeadline ?? null },
        },
      });
      return election2;
    });

    return ok(updated);
  } catch {
    return unexpectedError();
  }
}

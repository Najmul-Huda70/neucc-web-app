import { prisma } from '@/lib/prisma';
import { apiError, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { hashPassword, generateTempPassword } from '@/lib/auth/passwords';
import { sendMail } from '@/lib/email/mailer';
import { newAccountEmail } from '@/lib/email/templates';
import type { Role } from '@prisma/client';

export const runtime = 'nodejs';
export const maxDuration = 30; // headroom for up to ~20 user creations + as many emails, after the DB transaction

type Context = { params: Promise<{ id: string }> };

type PostDecision =
  | { postId: string; postName: string; outcome: 'ELECTED' | 'UNOPPOSED'; candidateId: string; applicantName: string; email: string; studentId: string; batch: number }
  | { postId: string; postName: string; outcome: 'NO_CANDIDATE'; candidateId: null };

// POST /api/panel/elections/:id/publish-results
//
// This is the single most important business rule in the whole system
// (SRS §5.3): declaring election results must, atomically —
//   1. record one ElectionResult row per post,
//   2. create the new Executive Committee,
//   3. create a login account for every winner, in that new committee,
//   4. dissolve the Election Committee that ran the election,
//   5. mark the Election RESULTS_PUBLISHED.
//
// Before this step, `POST /api/panel/election-results` was a bare CRUD
// endpoint — declaring a result did none of the above. This endpoint
// replaces that gap; the CRUD endpoint still exists for reading/correcting
// individual result rows afterward.
export async function POST(_req: Request, { params }: Context) {
  const auth = await requirePanelAction('election:manage');
  if (auth.response) return auth.response;
  const { id } = await params;

  const election = await prisma.election.findUnique({ where: { id } });
  if (!election) return apiError(404, 'NOT_FOUND', 'Election not found.');
  if (election.status === 'RESULTS_PUBLISHED') {
    return apiError(409, 'ALREADY_PUBLISHED', 'Results have already been published for this election.');
  }
  if (election.status !== 'CLOSED') {
    return apiError(
      400,
      'ELECTION_NOT_CLOSED',
      'The election must be CLOSED (voting finished) before results can be published. PATCH its status first.'
    );
  }

  // Sequencing guard: Step 4's dedicated dissolve-executive endpoint is
  // meant to run BEFORE the election, so the Election Committee operates
  // independently of the outgoing Executive Committee. If that step was
  // skipped, refuse here rather than silently creating a second "active"
  // Executive Committee.
  const stillActiveExecutive = await prisma.committee.findFirst({
    where: { type: 'EXECUTIVE', status: 'ACTIVE' },
    select: { id: true },
  });
  if (stillActiveExecutive) {
    return apiError(
      400,
      'OUTGOING_EXECUTIVE_STILL_ACTIVE',
      'An active Executive Committee still exists. Dissolve it first via POST /api/panel/committees/dissolve-executive.'
    );
  }

  const [posts, candidates] = await Promise.all([
    prisma.post.findMany({ select: { id: true, name: true } }),
    prisma.candidate.findMany({
      where: { electionId: id, status: { not: 'REJECTED' } },
      select: {
        id: true,
        postId: true,
        applicantName: true,
        email: true,
        studentId: true,
        batch: true,
        isUnopposed: true,
        isWinner: true,
      },
    }),
  ]);

  const candidatesByPost = new Map<string, typeof candidates>();
  for (const c of candidates) {
    if (!candidatesByPost.has(c.postId)) candidatesByPost.set(c.postId, []);
    candidatesByPost.get(c.postId)!.push(c);
  }

  // Resolve a decision for every post. Any post that's contested (2+ live
  // candidates) with no declared winner, or with more than one, blocks the
  // ENTIRE publish — better to force the committee to finish reviewing than
  // to guess or partially publish.
  const decisions: PostDecision[] = [];
  const blockingErrors: string[] = [];

  for (const post of posts) {
    const postCandidates = candidatesByPost.get(post.id) ?? [];

    const unopposed = postCandidates.filter((c) => c.isUnopposed);
    const declaredWinners = postCandidates.filter((c) => c.isWinner);

    if (unopposed.length > 1) {
      blockingErrors.push(`${post.name}: more than one candidate is marked isUnopposed.`);
      continue;
    }
    if (unopposed.length === 1) {
      const c = unopposed[0];
      decisions.push({
        postId: post.id, postName: post.name, outcome: 'UNOPPOSED', candidateId: c.id,
        applicantName: c.applicantName, email: c.email, studentId: c.studentId, batch: c.batch,
      });
      continue;
    }

    if (postCandidates.length === 0) {
      decisions.push({ postId: post.id, postName: post.name, outcome: 'NO_CANDIDATE', candidateId: null });
      continue;
    }

    if (declaredWinners.length === 0) {
      blockingErrors.push(`${post.name}: ${postCandidates.length} candidate(s) but none marked isWinner yet.`);
      continue;
    }
    if (declaredWinners.length > 1) {
      blockingErrors.push(`${post.name}: more than one candidate is marked isWinner.`);
      continue;
    }
    const winner = declaredWinners[0];
    decisions.push({
      postId: post.id, postName: post.name, outcome: 'ELECTED', candidateId: winner.id,
      applicantName: winner.applicantName, email: winner.email, studentId: winner.studentId, batch: winner.batch,
    });
  }

  if (blockingErrors.length > 0) {
    return apiError(400, 'UNRESOLVED_POSTS', 'Some posts are not ready to publish.', { posts: blockingErrors });
  }

  try {
    const outcome = await prisma.$transaction(
      async (tx) => {
        const newCommittee = await tx.committee.create({
          data: { type: 'EXECUTIVE', status: 'ACTIVE', startDate: new Date() },
        });

        const createdAccounts: { post: string; name: string; email: string; tempPassword: string }[] = [];

        for (const decision of decisions) {
          await tx.electionResult.upsert({
            where: { electionId_postId: { electionId: id, postId: decision.postId } },
            create: { electionId: id, postId: decision.postId, candidateId: decision.candidateId, outcome: decision.outcome },
            update: { candidateId: decision.candidateId, outcome: decision.outcome },
          });

          if (decision.outcome === 'NO_CANDIDATE') continue;

          const role: Role = 'EXECUTIVE_COMMITTEE';
          const tempPassword = generateTempPassword();
          const passwordHash = await hashPassword(tempPassword);

          const existing = await tx.user.findUnique({ where: { email: decision.email }, select: { id: true } });
          if (existing) {
            throw new Error(
              `EMAIL_CONFLICT: ${decision.postName} winner's email (${decision.email}) is already used by an existing account. Resolve manually and retry.`
            );
          }

          await tx.user.create({
            data: {
              name: decision.applicantName,
              email: decision.email,
              passwordHash,
              role,
              postId: decision.postId,
              committeeId: newCommittee.id,
              studentId: decision.studentId,
              batch: decision.batch,
            },
          });
          createdAccounts.push({ post: decision.postName, name: decision.applicantName, email: decision.email, tempPassword });
        }

        const dissolvedElectionCommittee = await tx.committee.update({
          where: { id: election.committeeId },
          data: { status: 'DISSOLVED', dissolvedAt: new Date() },
        });

        const updatedElection = await tx.election.update({
          where: { id },
          data: { status: 'RESULTS_PUBLISHED', resultPublishedAt: new Date() },
        });

        await tx.auditLog.create({
          data: {
            actorId: auth.user.id,
            action: 'ELECTION_RESULTS_PUBLISHED',
            targetType: 'Election',
            targetId: id,
            metadata: { newCommitteeId: newCommittee.id, winnerCount: createdAccounts.length },
          },
        });
        await tx.auditLog.create({
          data: {
            actorId: auth.user.id,
            action: 'EXECUTIVE_COMMITTEE_CREATED',
            targetType: 'Committee',
            targetId: newCommittee.id,
            metadata: { electionId: id },
          },
        });
        await tx.auditLog.create({
          data: {
            actorId: auth.user.id,
            action: 'ELECTION_COMMITTEE_DISSOLVED',
            targetType: 'Committee',
            targetId: dissolvedElectionCommittee.id,
            metadata: { electionId: id },
          },
        });

        return { election: updatedElection, newCommittee, createdAccounts };
      },
      { maxWait: 10_000, timeout: 20_000 }
    );

    // Deliberately OUTSIDE the transaction: sending email is slow, external
    // I/O with no place inside a DB transaction — if SMTP hangs, it must not
    // hold a database transaction open. The handover itself (accounts,
    // committees, election status) is already durably committed by this
    // point; email is a best-effort *notification* on top of it, exactly
    // like the plaintext-password-in-the-response fallback already is.
    const createdAccountsWithEmailStatus = await Promise.all(
      outcome.createdAccounts.map(async (acc) => {
        const { subject, text, html } = newAccountEmail({
          name: acc.name,
          post: acc.post,
          email: acc.email,
          tempPassword: acc.tempPassword,
        });
        const result = await sendMail({ to: acc.email, subject, text, html });
        return { ...acc, emailSent: result.sent };
      })
    );

    return ok({ ...outcome, createdAccounts: createdAccountsWithEmailStatus }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('EMAIL_CONFLICT:')) {
      return apiError(409, 'EMAIL_CONFLICT', err.message.replace('EMAIL_CONFLICT: ', ''));
    }
    return unexpectedError();
  }
}

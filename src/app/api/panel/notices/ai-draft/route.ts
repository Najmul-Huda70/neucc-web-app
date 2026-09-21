import { prisma } from '@/lib/prisma';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { apiError, ok, unexpectedError } from '@/lib/http/api-response';
import { NoticeAiDraftSchema } from '@/lib/validation/public';
import { draftNotice } from '@/lib/ai/notice-drafter';

export const runtime = 'nodejs';
export const maxDuration = 30;

// POST /api/panel/notices/ai-draft
//
// Notice & Publication Team only (`notice:ai_generate`). Drafts a notice in
// Bengali from a short instruction, in the club's real tone — pulling the
// scope's 5 most recent notices as style/memo-numbering context (a small,
// direct form of "context retrieval", not a full RAG pipeline: there's no
// vector search here, just the most recent rows for this scope).
//
// Supports a clarifying-question loop: if the model is missing information
// it needs (names, a date, a decision) rather than guessing, it asks ONE
// question back instead of inventing facts. The caller is expected to
// resubmit with that question+answer appended to `conversation` and the
// same `instruction` field carrying the latest reply — see
// docs/STEP_8_CHANGELOG.md for the exact turn-taking contract.
export async function POST(req: Request) {
  const auth = await requirePanelAction('notice:ai_generate');
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = NoticeAiDraftSchema.safeParse(body);
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid request.', parsed.error.flatten());

  const recentNotices = await prisma.notice.findMany({
    where: { scope: parsed.data.scope },
    orderBy: { date: 'desc' },
    take: 5,
    select: { subject: true, memoNo: true, date: true },
  });

  try {
    const result = await draftNotice({
      scope: parsed.data.scope,
      instruction: parsed.data.instruction,
      conversation: parsed.data.conversation ?? [],
      recentNotices,
    });
    return ok(result);
  } catch (err) {
    if (err instanceof Error && err.message.includes('ANTHROPIC_API_KEY')) {
      return apiError(503, 'AI_NOT_CONFIGURED', 'The AI drafting service is not configured on this deployment.');
    }
    if (err instanceof Error && err.message.includes('parsed as JSON')) {
      return apiError(502, 'AI_BAD_RESPONSE', err.message);
    }
    return unexpectedError();
  }
}

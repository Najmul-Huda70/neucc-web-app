import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured.');
    client = new Anthropic({ apiKey });
  }
  return client;
}

export interface DraftTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface NoticeDraftResult {
  needsClarification: boolean;
  clarifyingQuestion: string | null;
  draft: { subject: string; body: string; memoNoSuggestion: string } | null;
}

const SYSTEM_PROMPT = `You are the drafting assistant for the Notice & Publication Team of NEUCC (Netrokona University Computer Club). You help draft official club notices in Bengali (বাংলা), matching the formal register used in the club's real notices — see the reference examples below for tone and structure.

Rules:
- Notices are formal, third-person, and end with a clear action/request line.
- Always write the "subject" and "body" fields in Bengali unless the user's instruction is in English and explicitly asks for an English notice.
- The "body" should be plain text with blank lines between paragraphs (no markdown, no HTML) — it will be inserted into a fixed letterhead template, not displayed as-is.
- If the user's instruction is missing information you genuinely need to draft a correct notice (e.g. a committee-formation notice with no names, an event notice with no date), ask ONE specific clarifying question instead of guessing or inventing facts. Never invent names, dates, memo numbers, or figures.
- memoNoSuggestion should follow the club's pattern seen in recent notices (a short code like "NeU.CSE.CC/EC/2026/02") when recent examples are provided; otherwise suggest a reasonable placeholder and say so is a placeholder inside the body is not required — just give your best guess in memoNoSuggestion.
- Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:
{"needsClarification": boolean, "clarifyingQuestion": string | null, "draft": {"subject": string, "body": string, "memoNoSuggestion": string} | null}
Exactly one of "clarifyingQuestion" or "draft" should be non-null.`;

function buildContextBlock(recentNotices: { subject: string; memoNo: string; date: Date }[]): string {
  if (recentNotices.length === 0) return 'No recent notices in this scope to reference for style/memo numbering.';
  return (
    'Recent notices in this scope (for tone and memo-number pattern reference, newest first):\n' +
    recentNotices
      .map((n) => `- [${n.memoNo}] ${n.date.toISOString().slice(0, 10)} — ${n.subject}`)
      .join('\n')
  );
}

export async function draftNotice(params: {
  scope: 'GENERAL' | 'INTERNAL' | 'ELECTION';
  instruction: string;
  conversation: DraftTurn[];
  recentNotices: { subject: string; memoNo: string; date: Date }[];
}): Promise<NoticeDraftResult> {
  const anthropic = getClient();

  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `Scope: ${params.scope}\n\n${buildContextBlock(params.recentNotices)}`,
    },
    { role: 'assistant', content: 'Understood. What would you like the notice to say?' },
    ...params.conversation.map((turn) => ({ role: turn.role, content: turn.content })),
    { role: 'user', content: params.instruction },
  ];

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  const raw = textBlock && 'text' in textBlock ? textBlock.text : '';

  let parsed: NoticeDraftResult;
  try {
    // Defensive: strip markdown fences if the model adds them despite instructions.
    const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('The AI response could not be parsed as JSON. Please try rephrasing your instruction.');
  }

  return parsed;
}

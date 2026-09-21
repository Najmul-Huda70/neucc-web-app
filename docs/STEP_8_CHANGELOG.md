# Step 8 — Agentic AI Content Generator (Backend + Frontend)

## Backend

### New files
```
src/lib/ai/notice-drafter.ts               — Anthropic SDK wrapper, draftNotice()
src/app/api/panel/notices/ai-draft/route.ts — POST endpoint
```

### How it works
`draftNotice({ scope, instruction, conversation, recentNotices })`:

1. Fetches the 5 most recent `Notice` rows in the requested `scope`
   (subject, memoNo, date) as context — a small, direct form of "context
   retrieval" as the original roadmap described it. This is **not** a full
   RAG pipeline (no embeddings, no vector search) — just the most recent
   rows, which is enough to keep memo-number style and tone consistent
   without over-engineering a search layer for a handful of documents.
2. Sends a system prompt (drafting rules: formal Bengali register, no
   invented facts, ask-don't-guess) plus that context plus the running
   `conversation` plus the latest `instruction` to `claude-sonnet-5`.
3. Requires and parses a single JSON object response:
   `{ needsClarification, clarifyingQuestion, draft }`, with exactly one of
   `clarifyingQuestion`/`draft` non-null. Strips markdown code fences
   defensively in case the model adds them despite instructions.

### The clarifying-question contract
The frontend maintains a `conversation: {role, content}[]` array of
completed turns (not including whatever's about to be sent). Each call
sends `{ scope, instruction, conversation }`; the route appends
`instruction` as the final `user` turn after the existing conversation, so
turns must already alternate correctly by the time they're passed in — the
frontend appends both the user's message and the model's reply to its local
array after each round-trip. See `ElectionCandidates.tsx`-style patterns
from earlier steps for the general shape; this one lives in
`dashboard/notices/page.tsx` instead.

### Model choice
`claude-sonnet-5` — matches this deployment's current generation of Claude
models. If Anthropic's available model IDs change later, this is the one
line to update.

### ⚠️ Not live-tested against the real API
Unlike Step 7 (where I actually launched Chromium and rendered real PDFs in
this sandbox), **there was no `ANTHROPIC_API_KEY` available in this
environment**, so `draftNotice()` was verified by:
- Confirming the SDK's `MessageParam`/`TextBlock` types match this code's
  usage (read directly from the installed package's `.d.ts` files).
- Bundling the module with esbuild to catch syntax/import errors.
- Manual review of the prompt and JSON-parsing logic.

It was **not** run against a live model to confirm the JSON contract holds
up in practice (models occasionally wrap JSON in prose despite
instructions, use different quoting, etc.). **First thing to check once you
have an API key configured**: call the endpoint a few times with vague and
complete instructions, confirm `needsClarification` triggers appropriately,
and watch server logs for any `AI_BAD_RESPONSE` (JSON parse failures) —
if those show up, the fix is almost always tightening the system prompt's
"respond with ONLY a JSON object" instruction or adding a stricter
regex-based extraction before `JSON.parse`.

## Frontend

Extended `/dashboard/notices` (`src/app/dashboard/notices/page.tsx`) —
this was already a real, API-connected page (unlike `DashboardShell.tsx`),
so the AI panel was added directly into its existing create/edit form
rather than building a new page.

New in this step:
- **"✨ Draft with AI" panel**, collapsible, inside the notice form. Shows
  the running conversation transcript, an input, and a Send button.
- Set the **Scope** field before drafting — the AI panel reads `draft.scope`
  so it drafts in the tone and memo-numbering pattern of that scope's own
  recent notices.
- On a clarifying question, it's appended to the transcript and the
  committee replies in the same input.
- On a finished draft, `subject` and `body` are written directly into the
  form fields (not just displayed) — the committee still reviews and edits
  before hitting Publish, same as if they'd typed it themselves. `memoNo`
  is only filled if the field was empty, so it never overwrites a
  manually-entered value.
- **"Generate PDF"** button added to each existing notice card, wired to
  Step 7's `generate-pad` endpoint — downloads the letterhead PDF via a
  blob URL.

## Not done in this step (flagging, not fixing)
- No streaming — the AI panel waits for the full response rather than
  showing tokens as they arrive. Fine for a short notice draft; would
  matter more for longer content.
- No "regenerate" / multiple-draft-options button — one instruction in, one
  draft out; the committee edits by hand or sends a follow-up instruction
  in the same conversation instead.
- Resolution drafting, election result declaration drafting, and nomination
  form drafting could all reuse this same pattern (a scope/type-aware
  system prompt + the same JSON contract) but weren't built — this step
  covers Notices only, per the original roadmap wording.

## How to verify manually
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run dev
```
Set `ANTHROPIC_API_KEY` in `.env` first. As a Notice & Publication Team
member:
```bash
curl -X POST http://localhost:3000/api/panel/notices/ai-draft \
  -H "Content-Type: application/json" -H "Cookie: access_token=<token>" \
  -d '{"scope":"GENERAL","instruction":"আগামী শনিবার একটা প্রোগ্রামিং ওয়ার্কশপের নোটিশ লিখো, সময় বিকাল ৪টা, স্থান CSE ল্যাব ২"}'
```
Should return either a `draft` (if it decides it has enough) or a
`clarifyingQuestion` (e.g. asking who's conducting the workshop, or the
exact date). Try a deliberately vague instruction
(`"একটা নোটিশ লিখো ওয়ার্কশপ নিয়ে"`) to confirm the clarifying-question path
triggers rather than the model inventing details.

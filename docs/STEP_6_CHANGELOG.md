# Step 6 — Election Result Declaration + Automated Handover (Backend + Frontend)

This closes the biggest gap found in the original audit: declaring election
results used to be a bare `POST /api/panel/election-results` CRUD call with
zero side effects. Winners were never turned into accounts, the outgoing
Election Committee was never dissolved, and no new Executive Committee was
ever created — the governance cycle was structurally impossible to complete
end to end.

## Backend

### New route
```
POST /api/panel/elections/:id/publish-results
```
(`src/app/api/panel/elections/[id]/publish-results/route.ts`)

The old `POST /api/panel/election-results` CRUD endpoint (from before this
project reached me) still exists, for reading or hand-correcting individual
result rows — it is not removed, just no longer how a real declaration
should happen.

### How a winner gets decided, per post
For each of the 20 posts, using only fields that already existed on
`Candidate` (`isUnopposed`, `isWinner`) plus the new Step 5 tooling:

1. **Exactly one `isUnopposed` candidate** → outcome `UNOPPOSED`.
2. **Zero live (non-`REJECTED`) candidates** → outcome `NO_CANDIDATE`
   (vacant post — no account created).
3. **One or more live candidates, none `isUnopposed`** → requires exactly
   one marked `isWinner: true` (via the existing generic
   `PATCH /api/panel/candidates/:id`) → outcome `ELECTED`.
4. Anything ambiguous (a contested post with zero or 2+ candidates marked
   `isWinner`, or 2+ marked `isUnopposed`) **blocks the entire publish**
   with `400 UNRESOLVED_POSTS` and a plain-English reason per post. Nothing
   is auto-resolved by guessing — a human has to finish marking winners
   first.

This step intentionally did **not** add a dedicated "mark winner" endpoint —
`PATCH /api/panel/candidates/:id { "isWinner": true }` already existed and
does the job; adding a second way to do the same thing would just be
surface area for the two to drift.

### The transaction itself
All of this happens in one `prisma.$transaction` (`maxWait: 10s`,
`timeout: 20s` — generous headroom for up to ~20 user-creation queries):

1. Create the new Executive Committee (`ACTIVE`).
2. For each post's decision: `upsert` an `ElectionResult` row
   (`electionId_postId` is the existing compound unique key).
3. For each `ELECTED`/`UNOPPOSED` decision: create a `User`
   (`role: EXECUTIVE_COMMITTEE`, the winning post, the new committee, a
   `generateTempPassword()` result hashed via the existing
   `hashPassword()`). If that email is already taken by an existing
   account, the **whole transaction throws and rolls back** — a partial
   handover (some accounts created, others not) is worse than making the
   caller resolve the conflict and retry.
4. Dissolve the Election Committee that ran the election
   (`election.committeeId`) — its job is done.
5. Set `Election.status = "RESULTS_PUBLISHED"`, `resultPublishedAt: now()`.
6. Three `AuditLog` rows: `ELECTION_RESULTS_PUBLISHED`,
   `EXECUTIVE_COMMITTEE_CREATED`, `ELECTION_COMMITTEE_DISSOLVED`.

### Preconditions checked before the transaction even starts
- `election.status === 'CLOSED'` — the committee must explicitly close
  voting first (`PATCH /api/panel/elections/:id { "status": "CLOSED" }`,
  already existed) before results can be published. Stops an accidental
  early declaration mid-voting.
- Not already `RESULTS_PUBLISHED` (`409`) — idempotency guard.
- **No currently `ACTIVE` Executive Committee** (`400
  OUTGOING_EXECUTIVE_STILL_ACTIVE`). This is the explicit link to Step 4:
  the design decision there was that dissolving the outgoing Executive
  Committee happens *before* the election runs (so the Election Committee
  operates independently), not automatically here. If that step was
  skipped, this refuses rather than silently creating a second
  simultaneously-plausible "active" committee.

### Why temp passwords come back in the API response
There is no email service yet (that's a separate, later step). Returning
`{ post, email, tempPassword }` once, in the response, is the only way the
caller can currently retrieve and relay them at all. They are never stored
anywhere except as their bcrypt hash — same guarantee as every other
password in this codebase.

## Frontend

Extended `/dashboard/elections` (`ElectionCandidates.tsx`, Step 5's page)
rather than creating a third dashboard page — declaring winners and
publishing results are the natural next actions on the exact same
post/candidate view Step 5 already built, not a separate workflow.

New in this step:
- **"Mark as winner"** button per candidate — shown only on a contested
  post's `VERIFIED`/`SYMBOL_ALLOTTED` candidates, before any winner is
  declared for that post. Calls the existing
  `PATCH /api/panel/candidates/:id`.
- A **winner/uncontested badge** on any candidate who has one.
- An **unresolved-posts checklist** — mirrors the backend's own validation
  client-side, so the committee sees exactly which posts still need
  attention instead of discovering it from a failed publish call.
- **"Publish Election Results"** section, gated on `election.status`,
  disabled while posts are unresolved, with a confirmation modal (same
  irreversible-action pattern as Step 4's dissolve button — not the
  no-modal treatment Step 5's reopen/uncontested actions got, because this
  one really can't be undone from the panel).
- On success, a **credentials panel** listing every new account's post,
  email, and one-time temporary password, with an explicit note that
  there's no email delivery yet and this is the only time the password is
  shown.

## Not done in this step (flagging, not fixing)
- No email delivery of the new credentials — deliberately deferred to a
  dedicated notifications step.
- No PDF "result declaration" document — same, deferred to the PDF
  generation step.
- `WALKOVER` (a `ResultOutcome` enum value distinct from `UNOPPOSED`) is
  never produced automatically; the schema keeps it as an option a
  committee could set by hand later via the plain `election-results` CRUD
  route, but nothing in this step's logic distinguishes it from
  `UNOPPOSED`.

## How to verify manually
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run dev
```
1. Run Steps 1–5's flow: create an Election Committee, a Chief Election
   Commissioner with granted access, dissolve the outgoing Executive
   Committee, create an election, add/verify candidates for a few posts,
   reopen a zero-applicant post, declare one post uncontested.
2. For a contested post, `PATCH` one candidate's `isWinner: true` (or use
   the new "Mark as winner" button).
3. Repeat until every post is resolved (or left with zero applicants).
4. `PATCH` the election to `status: "CLOSED"`.
5. Visit `/dashboard/elections`, confirm the unresolved-posts list is
   empty, click **Publish Election Results**, confirm in the modal.
6. Check the credentials panel appears; check
   `GET /api/panel/committees?type=EXECUTIVE&status=ACTIVE` shows the new
   committee with the right members; check the election's `status` is now
   `RESULTS_PUBLISHED`; check the old Election Committee is `DISSOLVED`.
7. Try publishing again — should `409`.

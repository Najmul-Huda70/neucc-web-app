# Step 5 — Uncontested Post & Eligibility Fallback (Backend + Frontend)

## Backend

### New routes
```
GET  /api/panel/posts
POST /api/panel/elections/:id/posts/:postId/reopen
POST /api/panel/elections/:id/posts/:postId/declare-uncontested
```

- **`GET /api/panel/posts`** — didn't exist before. Needed because the
  reopen workflow has to show posts with **zero** candidates, and those
  never show up in a `candidates` list response at all (there's no row).
  `election:manage`, no pagination (fixed set of 20).
- **`reopen`** — validates the post currently has zero non-`REJECTED`
  applications (`400` otherwise), then pushes `postId` onto
  `Election.reopenedPostIds` (the array field added in Step 1) and
  optionally extends the deadline. `409` if already reopened.
- **`declare-uncontested`** — takes no `candidateId` in the body; it finds
  the post's sole `VERIFIED`/`SYMBOL_ALLOTTED` candidate itself and errors
  (`400`) unless there's exactly one. Sets **both**
  `status: "UNOPPOSED"` and `isUnopposed: true`, because the schema already
  had both (an enum value and a boolean flag) — using only one would leave
  the other silently stale for any code that checks it later.

### Scope note: eligibility is still not enforced either way
`POST /api/panel/candidates` doesn't check `Post.eligibleYear` against the
candidate's `batch` at all, reopened or not — `eligibilityWaived` remains a
plain field the committee sets by hand. Actually enforcing eligibility
(and rejecting/flagging applications that don't meet it) wasn't part of
this step's ask ("reopen + declare-uncontested endpoints") and is a
reasonable candidate for its own step later.

### Security sweep (same bug class as Step 4)
Found and fixed the identical `passwordHash`-leak pattern from Step 4 in
two more places while working in this area:
- `src/app/api/panel/candidates/route.ts` and `.../[id]/route.ts` —
  `verifiedBy: true` → `verifiedBy: { select: { id, name } }`
- `src/app/api/panel/payments/route.ts` and `.../[id]/route.ts` — same fix
  for their `verifiedBy` relation.

Swept the rest of the codebase for every other `User`-typed relation name
(`createdBy`, `publishedBy`, `uploadedBy`, `actor`) — no further instances
found.

## Frontend

### New page
`/dashboard/elections` → `src/components/dashboard/ElectionCandidates.tsx`
(new, real API-connected component, same reasoning as Step 4's
`CommitteeGovernance.tsx` — not added into the mock `DashboardShell.tsx`.)

- Loads `/api/panel/me` (gates the whole page on `capabilities.canManageElection`),
  `/api/panel/posts`, the election list, and that election's candidates.
- An election picker (there can be more than one over time), defaulting to
  the current `OPEN` one if there is one.
- One card per post (all 20, not just posts with applicants), each showing
  its candidates with status badges, and:
  - **"Reopen to all members"** button — shown only when the post has zero
    non-rejected applications and hasn't already been reopened.
  - **"Declare uncontested"** button — shown only when the post has
    exactly one verified/symbol-allotted candidate.
- Both buttons call their endpoint directly (no confirmation modal here,
  unlike Step 4's dissolve action — these are reversible-in-spirit,
  correctable data-entry actions, not an irreversible power handover) and
  reload the election + candidate lists on success.

Added an `Elections` link to `DashboardShell`'s nav array.

## How to verify manually
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run dev
```
As an Election Committee member (`election:manage`):
1. Create an election (`POST /api/panel/elections`) and visit
   `/dashboard/elections` — every post should appear with 0 applications
   and a "Reopen to all members" button.
2. Click it on one post; the button should disappear and "reopened to all
   members" should show next to the count.
3. `POST /api/panel/candidates` twice for a different post (two
   applicants), then `PATCH` both to `status: "VERIFIED"` — no
   "Declare uncontested" button should appear (2 verified candidates).
4. Do the same for a post with exactly one candidate verified — the
   "Declare uncontested" button should appear; clicking it should flip
   that candidate to `UNOPPOSED` and remove the button.

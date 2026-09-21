# Step 4 — Dissolve Executive Committee (Backend + Frontend)

## Backend

### New route
```
POST /api/panel/committees/dissolve-executive
```
(`src/app/api/panel/committees/dissolve-executive/route.ts`)

- Gated by `election:dissolve_executive` (already existed in
  `permissions.ts` since the original codebase — Chief Election
  Commissioner, only once the President granted access in Step 3).
- Looks up the current `ACTIVE` Executive Committee itself — no `:id` in
  the URL. There is always at most one active committee per type, so
  nothing is gained by making the caller pass an id, and it removes a
  chance to pass the wrong one.
- Sets `status: DISSOLVED`, `dissolvedAt: now()`, in a transaction with an
  `AuditLog` row (`EXECUTIVE_COMMITTEE_DISSOLVED`).
- **No separate "revoke access" step for members** — `getCurrentUser()` in
  `session.ts` already checks `committee.status !== 'DISSOLVED'` on every
  request, so access disappears the instant this transaction commits.

### Why not the generic `PATCH /api/panel/committees/:id`?
That route is still gated by `election:manage`, which any active Election
Committee member has — far looser than this action deserves. Dissolving
the sitting Executive Committee is one of the two most consequential
actions in the whole system (SRS §5.3); it gets its own endpoint with its
own tighter permission, matching the pattern set by
`grant-election-access` in Step 3.

### Security fix found and fixed along the way
While wiring the frontend to `GET /api/panel/committees`, found that both
the list and detail routes did `include: { members: true }` — returning
**the full `User` row for every committee member, including
`passwordHash`**, to any caller with `election:manage` or
`committee:create_election`. Narrowed both to
`select: { id, name, post: { name } }`. This wasn't introduced by this
step, but it's directly in the response the new page depends on, so it
was fixed now rather than shipped forward.
(`src/app/api/panel/committees/route.ts`, `.../[id]/route.ts`)

## Frontend

### New page
`/dashboard/committees` → `src/components/dashboard/CommitteeGovernance.tsx`

This is a **new, standalone, real API-connected component** — it is
deliberately **not** added into `DashboardShell.tsx`. That file's entire
"Election Committee" section (and every other role section in it) is
client-side mock state seeded with hardcoded arrays; nothing in it calls
the actual backend. Wiring a real, irreversible governance action into
that mock scaffolding would have made it look connected when it isn't.
This page instead:

- Fetches `GET /api/panel/me` for the caller's role/post and the
  `capabilities.canDissolveExecutive` flag.
- Fetches `GET /api/panel/committees?type=EXECUTIVE&status=ACTIVE` and
  lists the current members.
- Shows the "Dissolve Executive Committee" button **only if**
  `canDissolveExecutive` is true; otherwise shows why not, so a President
  or ordinary member sees an explanation instead of a dead button.
- Clicking it opens a confirmation modal (member count, "cannot be undone"
  warning, Cancel / "Yes, dissolve it") before calling
  `POST /api/panel/committees/dissolve-executive`.
- On success, shows a confirmation banner and reloads the committee state
  (the panel now shows "no active Executive Committee").
- On failure (e.g. a second click after it's already dissolved), shows the
  server's error message inside the modal without closing it.

Added a `Committees` link to `DashboardShell`'s nav array so the page is
reachable — the smallest possible touch to that file.

## Not done in this step (flagging, not fixing)
`DashboardShell.tsx` and `EventManagement.tsx` are, in their entirety,
mock/local-state demo UI with no real `fetch` calls anywhere — the
"Overview", "Events", and every role-specific action in them just push into
`useState` arrays that reset on refresh. This step didn't touch that,
beyond the one nav-array line, because rewiring those to real data is a
larger, separate effort than "add a dissolve button" — worth its own step
once the core governance flow (through Step 6) is done.

## How to verify manually
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run dev
```
1. Log in as the President, `POST /api/panel/committees` with
   `type: "ELECTION"` (Step 1), then `POST /api/panel/users` to create a
   Chief Election Commissioner in that committee (Step 2), then
   `POST /api/panel/users/:cecId/grant-election-access` (Step 3).
2. Log in as that Chief Election Commissioner, visit `/dashboard/committees`
   — the Dissolve button should be visible.
3. Click it, confirm in the modal, and check `GET /api/panel/committees`
   afterward — the Executive Committee should show `status: "DISSOLVED"`.
4. Try logging in as a former Executive Committee member — login should now
   fail (or an existing session's next panel request should 403), since
   `getCurrentUser()` rejects a dissolved committee.

# Demo Data Removed + Users Management UI Added

## Demo data removal (as requested — no demo data anywhere, in code or DB)

`prisma/seed.ts` previously created, beyond structural data:
- A full **demo Executive Committee** — 20 fake accounts, one per post,
  every single one with the same publicly-known password
  (`NEUCC-demo-2026`) and predictable emails (`demo.president@neucc.test`,
  etc.)
- 10 fake **Events**, 4 fake **Contests**, 20 fake **Gallery** items

All of that is now deleted from `seed.ts`. It seeds exactly two things now:
- The 20 constitutional **Posts** — required lookup data every `User`,
  `Candidate`, and `ElectionResult` points at; the system cannot function
  without these rows existing, so this stays and is not "demo data."
- The standard **FundHead** income/expense categories — same reasoning;
  Treasurer needs at least one category to record a first transaction
  against (more can be added later via Step 9's `POST
  /api/panel/finance/fund-heads`).

Also removed `docs/DEMO_CREDENTIALS.md` entirely — it documented the demo
password above plus the `123456` login backdoor from the earlier security
fix, both of which no longer exist.

**The only account that will ever exist is the one created by
`npm run prisma:onboard-admin`** (the President) — everyone else is created
by that President through the new Users page below, never by a script.

`docs/DEPLOYMENT_GUIDE.md` updated to match — the old "Option A (demo) /
Option B (real)" framing is gone; there is only one path now.

## New: `/dashboard/users` — the Users management UI

This closes the gap flagged honestly earlier: Step 2 built the backend
(`POST /api/panel/users`, etc.) but there was no UI for it, meaning the
President had to use `curl`/Postman to create the Chief Election
Commissioner's account. Now:

- **Create account** — name, email, password (with a "Generate" button for
  convenience, though the server independently enforces its own 12-char
  minimum), post, committee (dropdown of currently-`ACTIVE` committees
  only), optional student ID/batch.
- **List** — every account with status, post, committee, and an
  "Election Access" badge when `electionAccessGranted` is set.
- **Revoke / Reactivate** — one click, calls the existing
  `PATCH /api/panel/users/:id { status }`.
- **Move** — change a member's post and/or committee inline, reusing the
  same endpoint's committee-move logic (role is re-derived server-side,
  never trusted from the client — unchanged from Step 2).

Gated on a **new capability flag**, `canManageUsers` (`user:manage`) —
this existed as a permission since Step 2 but, like `committee:create_election`
before it, was never exposed in `/api/panel/me`'s capabilities map, so no
page could gate on it without duplicating the permission logic client-side.
Added `canCreateElectionCommittee` at the same time for consistency, even
though no page uses it yet (Step 4's Committees page still checks
`election:manage`/`committee:create_election` inline rather than through a
capability flag — worth aligning later, not blocking this fix).

Added a `Members Access` link to `DashboardShell`'s nav (named to avoid
confusion with the pre-existing `Members` link, which goes to Join Us
application review, Step 10 — a different thing entirely).

## How to verify manually
```bash
npm install && npx prisma generate && npx prisma migrate deploy
npm run prisma:seed              # posts + fund heads only — confirm no users/events created
ADMIN_NAME="..." ADMIN_EMAIL="..." ADMIN_PASSWORD="..." npm run prisma:onboard-admin
npm run dev
```
1. Check the database directly (`npx prisma studio`) — `User` table should
   have exactly one row (the President), `Event`/`Contest`/`GalleryItem`
   should be empty.
2. Log in as the President, form the Election Committee
   (`/dashboard/committees`), then visit `/dashboard/users` and create the
   Chief Election Commissioner's account through the UI — no `curl` needed
   anymore.
3. Try "Revoke" on an account, confirm that account can no longer log in;
   "Reactivate" should restore access.

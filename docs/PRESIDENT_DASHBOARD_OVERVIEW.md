# Real Dashboard Overview (replaces the mock DashboardShell at `/dashboard`)

## What changed
- **New**: `src/components/dashboard/DashboardOverview.tsx`
- **`src/app/dashboard/page.tsx`** now renders it instead of `DashboardShell`

## Why
Every step's changelog since Step 4 flagged `DashboardShell.tsx` as mock —
it read `role`/`post` from URL search params (which the recent auth-bypass
fix stopped populating entirely) and never called a real API. The root
`/dashboard` route was the last major page still showing that fake content.
This replaces it with a real one, following the exact pattern every other
page in this project already uses.

## How it works
- Fetches `/api/panel/me` for the caller's actual name/post/role/committee
  status/capabilities — nothing is guessed or read from the URL.
- Shows a card grid, **filtered to only the sections this account's
  capabilities allow** — a Treasurer sees Finance but not Elections; the
  President sees everything (`user:manage`, `committee:create_election`,
  `election:manage`, `finance:manage`, etc. all resolve true for that
  account). This is the "role-based dashboard content" the original
  roadmap called for and never got built.
- If the account can review membership applications
  (`canManageMembership`), fetches the pending count and shows it as a
  banner linking straight to `/dashboard/members`.
- If the account's committee is `DISSOLVED`, shows a clear warning banner
  (most actions will 403 from here on, per every route's own
  `getCurrentUser()` check — this just explains why up front instead of
  the person discovering it one 403 at a time).

## On "club-admin" / "club-moderator" terminology
The request used these informal names. Mapped to what already exists in
the schema rather than introducing new post names:
- "club-admin" → **President** — already has every top-level capability
  (`user:manage`, `committee:create_election`, `election:grant_access`).
- "club-treasurer" → **Treasurer** — already exists, unchanged.
- "President can create any other member" → already true, via
  `/dashboard/users` (built in an earlier step).
- **"club-moderator" is not a post in this system** — the 20 constitutional
  posts don't include one. Nothing was added for it since it's unclear
  whether this means an existing post (e.g. Information Secretary) or a
  genuinely new one; flagging rather than guessing. If a real "Moderator"
  post is wanted, that's a one-line addition to `prisma/seed.ts`'s `POSTS`
  array plus a migration — small, but a real schema change, so confirming
  first rather than inventing a post that isn't in the Constitution.

## Not touched
`DashboardShell.tsx` and `EventManagement.tsx` still exist, still mock,
still unused now that `/dashboard` no longer imports the former. Not
deleted — no harm in leaving them, and deleting isn't necessary for this
fix. `/dashboard/events` still renders `EventManagement.tsx` (mock) since
rebuilding that wasn't in scope of "the President's dashboard."

## How to verify
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run dev
```
Log in as the President (or `onboard-admin`-created account) — `/dashboard`
should show the personalized header and every card (President has every
capability). Log in as a narrower post (e.g. only `finance:manage`) — only
the Finance card should appear.

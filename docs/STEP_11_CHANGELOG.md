# Step 11 — President's Missing Actions + Shared Dashboard Nav + Website Content UI

Picked up from `docs/PRESIDENT_DASHBOARD_OVERVIEW.md`, which had already
flagged (but not fixed) several gaps in the President's workflow. This step
closes the ones with real backend support and no frontend at all. No mock
data, no demo accounts — every new screen reads/writes through the existing
`/api/panel/*` routes and Postgres via Prisma, same as every other page in
this project.

## 1. `src/lib/auth/capabilities.ts` (new)

Pulled the capability map out of `/api/panel/me/route.ts` into its own
function, `getCapabilities(user)`, so it can be reused by a server component
(the new dashboard layout) without hitting the API route from the server —
and so the two never drift apart. Also added `canManageContent` /
`canViewContent` (the `content:manage` / `content:view` permissions already
existed in `permissions.ts` and gated five API resources, but were never
exposed to the frontend at all).

## 2. `src/app/dashboard/layout.tsx` + `src/components/dashboard/DashboardNav.tsx` (new)

Every `/dashboard/*` page was previously an island: no shared nav, no way to
move between sections without typing URLs, and no logout button anywhere in
the UI (the `/api/auth/logout` route existed and was simply never called).
Unauthenticated visits to `/dashboard/*` also weren't redirected to
`/login` — `proxy.ts` only protects `/api/panel/*` by design (see its
comment), so each page's own client fetch would just 401.

This adds a real Next.js layout for the whole `/dashboard` tree:
- Server-side auth guard — calls `getCurrentUser()` directly and
  `redirect()`s to `/login?next=/dashboard` if there's no session, instead
  of leaving that to each page's client-side error state.
- A persistent sidebar (desktop) / top bar + collapsible menu (mobile),
  capability-filtered the same way `DashboardOverview`'s card grid already
  was, so a given account only ever sees links it can actually use.
- A working **Log out** button, wired to the existing endpoint.

## 3. `CommitteeGovernance.tsx` (`/dashboard/committees`) — the two missing President actions

The President's dashboard card for this page said *"Form the Election
Committee, dissolve the Executive Committee"* — but the component only ever
implemented the second half. Both `committee:create_election` and
`election:grant_access` had complete API routes (`POST /api/panel/committees`,
`POST`/`DELETE /api/panel/users/:id/grant-election-access`) and zero UI. The
Users page even told the President to *"form the Election Committee first
on `/dashboard/committees`"* — a page that couldn't do that.

Added:
- **Form Election Committee** — shown to the President when no Election
  Committee is currently active; a start-date field and a submit button
  that calls `POST /api/panel/committees { type: 'ELECTION', status:
  'ACTIVE', startDate }`.
- **Active Election Committee** section, mirroring the existing Executive
  Committee display (member list, active-since date).
- **Election Module Access** — for the President only. Lists any account
  with the post "Chief Election Commissioner" in the active Election
  Committee (fetched via `GET /api/panel/users?committeeId=...`, which
  only the President can call) with a Grant/Revoke button hitting the
  existing `POST`/`DELETE /api/panel/users/:id/grant-election-access`.

## 4. `ContentManagement.tsx` (new) — `/dashboard/content`

Five API resources — `site-content`, `sponsors`, `gallery`, `achievements`,
`contests` — had full CRUD routes gated on `content:manage`/`content:view`
(which the President has, per `permissions.ts`), but no dashboard page
existed for any of them. The only way to update the About page's mission
statement or add a sponsor was a direct database edit or `curl`.

New tabbed page:
- **Home & About Text** — edits the known `SiteContent` keys the public
  site actually reads (`home.chairpersonMessage`, `home.moderatorMessage`,
  `home.aboutSnapshot`, `about.mission`, `about.vision`, `about.history`,
  `about.facultyAdvisors`), each saved independently via the existing
  upsert endpoint.
- **Sponsors / Gallery / Achievements / Contests** — list, create, edit
  (except Gallery, which the API only supports create/delete for), delete.

Since there's no file-upload endpoint anywhere in this project yet (every
`*Url`/`logoUrl`/`photoUrl` field expects an already-hosted link — see
`DocumentCreateSchema` for the same pattern), these forms take a URL, with
a hint that the image needs to be hosted elsewhere first. Building real
upload wasn't in scope here; flagging it rather than quietly working around
it.

Gated read-only (`canViewContent`) vs. editable (`canManageContent`) so a
non-President content-team post (Information Secretary, Editor Secretary,
etc., per `permissions.ts`'s `content:manage` check) gets the same page
with full edit rights, while anyone with only view rights sees the same
data with the forms/buttons hidden.

Added the `canManageContent`/`canViewContent`-gated card to
`DashboardOverview.tsx`'s grid and the nav link in `DashboardNav.tsx`.

## Not touched

- `EventManagement.tsx` (`/dashboard/events`) — still the pre-existing mock
  component. Left alone because the President doesn't have `event:manage`
  (only the Event Management Secretary posts do, per the permission
  matrix), so this wasn't blocking any President action. Worth a follow-up
  step for whoever holds that post.
- `DashboardShell.tsx` — still dead code, still unused, still not deleted
  (same reasoning as `PRESIDENT_DASHBOARD_OVERVIEW.md`: no harm leaving it,
  not required for this fix).

## How to verify

```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run dev
```

1. Log in as the President. The sidebar should now show every section,
   including the new **Website Content** link, and a working **Log out**
   button at the bottom.
2. Visit `/dashboard/committees` with no Election Committee active — a
   "Form Election Committee" form should appear (only for the President).
   Submit it, then create a "Chief Election Commissioner" account from
   Members Access, then come back here — a **Grant access** button should
   appear for that account.
3. Visit `/dashboard/content` — edit the Mission field under "Home & About
   Text", save, then check `/about` on the public site to confirm it
   updated. Add a sponsor and confirm it appears on `/sponsors`.
4. Visit `/dashboard` while logged out (clear cookies) — should redirect to
   `/login?next=/dashboard` instead of showing a raw error.

## Known environment limitation while verifying this patch

This patch was written and type-checked in a sandboxed environment that
cannot reach `binaries.prisma.sh`, so `prisma generate` there produced a
client with incomplete generated types (missing `Prisma.XWhereInput`
namespaces, `Role`, etc. — pre-existing across the whole codebase, not
introduced by this step). `npx tsc --noEmit` confirmed zero errors in every
file this step added or touched; the remaining errors are all in
pre-existing files and disappear once `prisma generate` can reach the real
engine binaries on a normal machine/CI.

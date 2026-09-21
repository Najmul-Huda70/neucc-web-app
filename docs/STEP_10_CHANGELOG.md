# Step 10 — Remaining Dashboard Pages + Public Frontend Gaps (Backend + Frontend)

The wrap-up step. Closes the last backend gaps from the original audit and
fills in the dashboard pages that had working APIs but no UI.

## Backend

### New permissions: `membership:manage`, `contact:view`
Neither was named in the original SRS permission matrix — Join Us
application review and Contact message viewing aren't assigned to a
specific post anywhere in the requirement doc. Scope decision: gated to
**President or General Secretary** (`src/lib/auth/permissions.ts`), the
same reasoning already used for `user:manage` in Step 2 — these are
top-of-committee administrative actions, not specialist-post actions like
notices or finance. Easy to widen later if the club wants a dedicated
"Membership Secretary" post instead.

### New routes
```
GET   /api/panel/membership-applications?status=&q=&page=&pageSize=
PATCH /api/panel/membership-applications/:id    { "status": "APPROVED" | "REJECTED" }
GET   /api/panel/contact-messages?q=&page=&pageSize=
```

Closes a real gap: the public Join Us and Contact forms have always saved
to `MembershipApplication`/`ContactMessage`, but nothing in the panel could
ever read them back. Every submission was going nowhere — sitting in the
database with no route to view or act on it.

**Important design note**: approving a membership application only flips
its `status` to `APPROVED`. It does **not** create a `User` account. This
is intentional, not a shortcut — per SRS §5.1, Club Members are explicitly
not a login role in this system; only Election Committee and Executive
Committee members ever get accounts. "Approving" a membership application
is a record-keeping decision, not an account-provisioning one.

`contact-messages` is read-only (`GET` only) — there's no status/workflow
field on that model to update, so there's nothing to `PATCH`.

### Capability flags added to `/api/panel/me`
`canManageResolution`, `canManageDocument`, `canManageMembership`,
`canViewContactMessages` — the underlying permissions (`resolution:manage`,
`document:manage`) already existed since the original codebase, but were
never exposed in the `/me` capabilities map, so no frontend could ever
gate a page on them without duplicating the permission logic client-side.

## Frontend

Five new pages, all real and API-connected (following the pattern set in
Steps 4-9 — `DashboardShell.tsx`/`EventManagement.tsx` remain untouched
mock UI, flagged again below).

### `/dashboard/members`
Two sections in one page (not two separate nav entries, since they're both
"things the public sent us to review"): pending Join Us applications with
Approve/Reject buttons, and a read-only Contact message list. Gated
independently — a President-only or General-Secretary-only account still
sees both sections since both roles get both capabilities under this
step's scope decision.

### `/dashboard/attendance`
Create a form, copy its public share link (`/attendance/:shareToken`) to
the clipboard, expand any form to view its submitted entries inline.

### `/dashboard/resolutions`
Full create form matching every `ResolutionCreateSchema` field (meeting
no., memo no., date/time, venue, president, convener, agenda, discussion,
decisions, attendee count) plus a list of existing resolutions.

### `/dashboard/documents`
Attach an already-hosted file URL to a Notice or Resolution by ID. No file
upload UI — this project still has no file storage configured (S3/
Cloudinary), a gap flagged since Step 6/7's changelogs and still open; this
page assumes the file is hosted somewhere else already and just records
its URL, matching exactly what the backend `DocumentCreateSchema` supports
today.

### `/(public)/attendance/[shareToken]` — a gap found, not just filled in
While building the dashboard Attendance page, found that
`POST /api/public/attendance/[shareToken]/entries` (the whole point of the
share-token system — letting Club Members and Advisory Board, who have no
login, mark attendance) had **no page anywhere that could reach it**. The
API worked perfectly; there was simply no UI a real person could open. Built
a minimal public, no-login submission page (name, student ID, batch) to
close that loop completely, not just on the panel side.

### Nav updates
Added `Attendance`, `Resolutions`, `Documents` to `DashboardShell`'s nav
array. `Members` was already in the nav array from the original
codebase — pointing at a page that didn't exist until this step (a
previously-dead link, now live).

## What turned out to already exist (nothing to build)
Checked for the public Achievements/Contests/Gallery/Sponsors pages this
step's original scope called for — **all four already existed** in this
codebase (`src/app/(public)/achievements`, `.../contests`, `.../gallery`,
`.../sponsors`), built before this session started. Confirmed real content
before skipping them, not just assumed.

## A mistake made and caught during this step
While adding `MembershipStatusUpdateSchema` to `src/lib/validation/public.ts`,
an editing pass **accidentally deleted `OperationsPaginationSchema`'s own
definition** — which roughly a dozen other schemas (`UserQuerySchema`,
every `...QuerySchema` built via `.extend()`) depend on. This was caught
immediately by re-grepping the file for the symbol after the edit, before
moving on to anything else, and fixed by restoring the definition. Flagging
this here rather than quietly fixing it and saying nothing — worth a second
look at `src/lib/validation/public.ts` specifically if anything in this zip
behaves unexpectedly.

## Not done in this step (flagging, not fixing) — the state of the whole project
This is the last step, so a full honest accounting of what's still open
across all 10 steps, not just this one:

- **`DashboardShell.tsx`/`EventManagement.tsx` are still mock UI.** Every
  "Overview" widget and the entire Events-management flow inside that
  specific component push into local `useState` arrays with no real
  `fetch` calls — flagged since Step 4, never rewired, because doing so
  properly is a rewrite of that component, not an addition alongside it.
  The dedicated pages built in Steps 4-10 (Committees, Elections, Finance,
  Notices, Members, Attendance, Resolutions, Documents) are all real; the
  original dashboard shell and its Events section are not.
- **No file storage (S3/Cloudinary).** Flagged repeatedly since Step 6 —
  Documents can only link already-hosted URLs, generated PDFs are never
  persisted (`Notice.pdfUrl` stays null), and there's no upload UI anywhere.
- **No live-tested AI drafting** (Step 8) — no API key was available in
  this sandbox to confirm the JSON contract holds against the real model.
- **No report-release/approval workflow** (Step 9) — both Treasurer and
  President can generate the same financial report on demand; no
  draft/released state exists.
- **Election eligibility (`Post.eligibleYear` vs. candidate `batch`) is
  still never enforced** at candidate-creation time — flagged since Step 5.
- Fund heads can be created but not edited/deleted (Step 9).

None of these are hidden — each was called out in its own step's changelog
when it was left open, and they're repeated here so this final step doesn't
imply everything above it is airtight.

## How to verify manually
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run dev
```
As President or General Secretary:
1. Submit the public Join Us form, then visit `/dashboard/members` —
   confirm it appears under Pending, Approve it, confirm it disappears from
   the pending list and `status` is `APPROVED` via
   `GET /api/panel/membership-applications?status=APPROVED`.
2. Submit the public Contact form, confirm it shows up in the same page's
   Messages section.

As an Information Secretary-team member:
3. Create an attendance form on `/dashboard/attendance`, copy its link,
   open it in a private/incognito window (no login), submit it, then
   confirm the entry shows up back in the dashboard.
4. Create a resolution on `/dashboard/resolutions`.
5. On `/dashboard/documents`, attach a URL to that resolution's ID, confirm
   it lists and the "Open" link works.

# Step 1 — Schema & Permission Foundation (Backend)

Applied directly on top of the uploaded project. Three files touched:

## 1. `prisma/schema.prisma`
Added `reopenedPostIds String[] @default([])` to the `Election` model —
needed by Step 5 (eligibility fallback: "reopen this post to all members").
Did not exist before.

## 2. `prisma/migrations/<timestamp>_election_reopened_posts/migration.sql`
New migration for the field above, following the project's existing
migration style. Apply it with:
```bash
npx prisma generate
npx prisma migrate deploy   # or `migrate dev` locally
```

## 3. `src/lib/auth/permissions.ts`
Added a new permission: `committee:create_election`, granted only to the
Executive Committee's **President**.

## 4. `src/app/api/panel/committees/route.ts` — the actual bug fix
**Before:** both `GET` and `POST /api/panel/committees` required
`election:manage`, which only an *existing* Election Committee member has.
That made it circularly impossible for the President to ever create the
first Election Committee — the exact step that's supposed to kick off the
annual handover cycle (SRS §5.3).

**After:**
- `POST` with `type: "ELECTION"` now requires `committee:create_election`
  (President-only), and rejects the request with `409` if an Election
  Committee is already active.
- `POST` with `type: "EXECUTIVE"` is now explicitly rejected (`400`) — the
  Executive Committee should never be created through this generic manual
  endpoint. It's produced automatically at election-result declaration
  (Step 6, not yet built) or via the one-time `prisma/onboard-admin.ts`
  script for initial setup.
- `GET` now accepts either `election:manage` **or**
  `committee:create_election`, so the President can see the committee list
  after creating one, not just Election Committee members.

## Not touched in this step (by design)
- `src/app/api/panel/committees/[id]/route.ts` (PATCH/DELETE, including
  dissolution) — still gated by `election:manage` for now. The dedicated,
  correctly-scoped dissolve-executive endpoint is **Step 4**.
- No frontend changes — this step is backend-only, as scoped.

## How to verify manually
```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```
Then, logged in as the seeded President (`prisma:seed` or
`prisma:onboard-admin`):
```bash
curl -i -X POST http://localhost:3000/api/panel/committees \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=<your token>" \
  -d '{"type":"ELECTION","status":"ACTIVE","startDate":"2026-09-18"}'
```
Should return `201`. A second identical call should return `409`. The same
call from a non-President account should return `403`.

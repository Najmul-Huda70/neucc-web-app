# Step 2 — Users & Committee Membership API (Backend)

## New permission
`user:manage` — President-only (`src/lib/auth/permissions.ts`). This is a
deliberate scope decision: the SRS doesn't name an explicit "manage members"
post, and President is the natural governance head who already gets
`election:grant_access` and `committee:create_election`. Revisit if you want
this shared with another post later — it's a one-line change.

## New routes
```
GET    /api/panel/users?page=&pageSize=&q=&committeeId=&postId=&role=&status=
POST   /api/panel/users
GET    /api/panel/users/:id
PATCH  /api/panel/users/:id
```
(`src/app/api/panel/users/route.ts`, `.../[id]/route.ts`)

Key design decisions:

- **`role` is never client-supplied.** Both create and the committee-move
  path on update derive it from the target `Committee.type`
  (`ELECTION` → `ELECTION_COMMITTEE`, `EXECUTIVE` → `EXECUTIVE_COMMITTEE`).
  This is what makes it structurally impossible to end up with a user whose
  `role` doesn't match their `committeeId` — the exact kind of drift that
  would silently break the permission matrix.
- **Committee must be `ACTIVE`** to add or move a member into it — you can't
  staff a dissolved committee by mistake.
- **No `DELETE`.** `User` is referenced by `AuditLog`, verified `Candidate`s,
  published `Notice`s, logged `Transaction`s, uploaded `Document`s, and
  `RefreshToken`s. A hard delete would either hit a foreign-key error or
  orphan historical records depending on the relation. Revoking access is
  `PATCH { "status": "REVOKED" }` — `getCurrentUser()` in `session.ts`
  already rejects non-`ACTIVE` users on every request, so this takes effect
  immediately, no separate "logout everywhere" step needed.
- **`electionAccessGranted` is not editable through this route**, on
  purpose — it only changes through the dedicated grant-access endpoint
  (Step 3), so that specific, audited action stays the only way to flip it.
- **Password reset is supported on `PATCH`** (optional `password` field,
  same 12-character minimum as `onboard-admin.ts`) — useful for a President
  resetting a locked-out member's password without needing DB access.
- Every create/update writes an `AuditLog` row inside the same transaction.

## Validation
`src/lib/validation/public.ts` gained `UserQuerySchema`, `UserCreateSchema`,
`UserUpdateSchema`, following the file's existing patterns
(`OperationsPaginationSchema`, `DateInput`, etc.).

## Docs
`docs/API.md` updated with the new endpoints.

## How to verify manually
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run dev
```
As the seeded/onboarded President:
```bash
# Create the Chief Election Commissioner account
curl -i -X POST http://localhost:3000/api/panel/users \
  -H "Content-Type: application/json" -H "Cookie: access_token=<token>" \
  -d '{
    "name":"Jane CEC","email":"cec@example.com","password":"a-strong-password-1",
    "postId":"<Chief Election Commissioner post id>",
    "committeeId":"<the Election Committee id from Step 1>"
  }'
```
Should return `201` with `role: "ELECTION_COMMITTEE"` auto-derived. Repeating
the same email should return `409`. The same call from a non-President
account should return `403`.

# Step 3 — Grant Election Module Access (Backend)

## New routes
```
POST   /api/panel/users/:id/grant-election-access
DELETE /api/panel/users/:id/grant-election-access
```
(`src/app/api/panel/users/[id]/grant-election-access/route.ts`)

No new permission needed — `election:grant_access` already existed in
`permissions.ts` (President-only) since the original codebase, it just had
no route to actually invoke it. That's the gap this step closes.

## Why nested under `/users/:id/...` and not a new top-level route
The action mutates one field (`electionAccessGranted`) on one specific
`User` row. Nesting it under the resource it acts on matches the existing
`attendance/forms/:id/entries` pattern in this codebase, and keeps it next
to Step 2's user-management routes rather than inventing a new top-level
`/api/panel/election/*` namespace for a single action.

## Validation before granting
The target must be, in order:
1. An existing user (`404` otherwise)
2. `role === "ELECTION_COMMITTEE"` **and** in a committee with
   `status === "ACTIVE"` (`400` otherwise) — you can't grant access to
   someone outside an active Election Committee
3. `post.name === "Chief Election Commissioner"` (`400` otherwise) — the
   flag only ever means anything for this one post, per SRS §5.3
4. Not already granted (`409` otherwise — idempotency guard)

Revoke (`DELETE`) mirrors this but only checks the user exists and
currently has the flag set — a President undoing a mistake shouldn't be
blocked by the same post/committee checks (the target may have since left
the post).

## Why `DELETE` (revoke) exists at all
The original SRS only describes granting access, not revoking it. Added it
anyway because a President who grants access by mistake — or an election
cycle that gets called off after granting — would otherwise have no way to
undo it short of a direct database edit. Low-risk addition: same permission
gate, same audit trail, symmetric to the grant action.

## Audit trail
Both actions write an `AuditLog` row (`ELECTION_MODULE_ACCESS_GRANTED` /
`ELECTION_MODULE_ACCESS_REVOKED`) inside the same transaction as the
`User` update.

## Docs
`docs/API.md` updated with the new endpoint pair.

## How to verify manually
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run dev
```
As the President, against the Chief Election Commissioner account created
in Step 2:
```bash
curl -i -X POST http://localhost:3000/api/panel/users/<cec-user-id>/grant-election-access \
  -H "Cookie: access_token=<president token>"
```
Should return `200` with `electionAccessGranted: true`. Calling it again
should return `409`. Calling `DELETE` on the same URL should flip it back
to `false` and return `200`; calling `DELETE` again should return `409`.
A non-President account attempting either should get `403`.

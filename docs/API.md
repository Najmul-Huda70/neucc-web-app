# NEUCC API Reference

This document covers the HTTP API implemented under `src/app/api`.

## Conventions

- Base URL: the deployed application origin.
- JSON endpoints use `Content-Type: application/json`.
- Protected panel endpoints require the `access_token` HttpOnly cookie.
- Public endpoints do not require authentication.
- Panel collection responses use `{ data, pagination }`.
- Panel record responses use `{ data }`.
- Collection pagination defaults to `page=1`, `pageSize=15`; `pageSize` is capped at 50.
- Structured API errors use `{ "error": { "code": "...", "message": "..." } }`.
- The session helper returns `{ "error": "Unauthorized" }` for unauthenticated panel requests.

## Authentication

### Login

`POST /api/auth/login`

Body:

```json
{
  "registrationNumber": "2026001",
  "email": "member@example.com",
  "password": "password",
  "role": "EXECUTIVE",
  "position": "PRESIDENT"
}
```

`registrationNumber` or `email` is required. `role` and `position` are optional.

- `200`: returns `{ user: { id, name, email, role, post } }` and sets auth cookies.
- `400`: invalid request body.
- `401`: invalid credentials.
- `403`: inactive user or dissolved committee.
- `429`: rate limited.

### Refresh session

`POST /api/auth/refresh`

Requires the refresh-token cookie. Rotates the refresh token.

- `200`: `{ "ok": true }`
- `401`: missing, invalid, revoked, or expired refresh token.
- `403`: user access revoked.

### Logout

`POST /api/auth/logout`

Authentication is optional. Revokes the refresh token when present and clears auth cookies.

- `200`: `{ "ok": true }`

## Public API

### Home and informational content

| Method | Endpoint | Query/body | Response |
| --- | --- | --- | --- |
| `GET` | `/api/public/home` | None | `{ stats, upcomingEvents, highlights, chairpersonMessage, moderatorMessage, aboutSnapshot }` |
| `GET` | `/api/public/about` | None | `{ mission, vision, history, facultyAdvisors, constitutionUrl }` |
| `GET` | `/api/public/constitution` | None | `307` redirect to `/documents/neucc-constitution.pdf` |
| `GET` | `/api/public/achievements` | None | `{ achievements }` |
| `GET` | `/api/public/sponsors` | None | `{ sponsors: { PLATINUM, GOLD, SILVER } }` |
| `GET` | `/api/public/executives` | `history=true` optionally includes dissolved committees | `{ current, pastCommittees }` |

### Public listings

| Method | Endpoint | Query | Response |
| --- | --- | --- |
| `GET` | `/api/public/events` | `status`, `category`, `q`, `page`, `pageSize` | `{ events, pagination }` |
| `GET` | `/api/public/announcements` | `page`, `pageSize` | General notices only: `{ notices, pagination }` |
| `GET` | `/api/public/contests` | Optional `type` | `{ contests }` |
| `GET` | `/api/public/gallery` | Optional `year`, `event` | `{ items }` |

### Public submissions

`POST /api/public/join-us`

Body: `name`, `studentId`, `batch`, `email`, optional `interest`, and optional honeypot field `website`.

- `201`: `{ ok: true, id }`
- `200`: `{ ok: true }` for honeypot submissions.
- `400`: invalid body.
- `429`: rate limited.

`POST /api/public/contact`

Body: `name`, `email`, `subject`, `message`, and optional honeypot field `website`.

- `201`: `{ ok: true, id }`
- `200`: `{ ok: true }` for honeypot submissions.
- `400`: invalid body.
- `429`: rate limited.

`POST /api/public/attendance/:shareToken/entries`

Body: `name`, `studentId`, `batch`.

- `201`: `{ data: entry }`
- `404`: attendance form not found.
- `422`: invalid body.
- `500`: unexpected failure.

## Protected Panel API

All panel routes below require the access-token cookie. Permission names are listed for each resource.

### Current user

`GET /api/panel/me`

Requires an authenticated user. Returns `{ id, name, email, role, post, committeeStatus, capabilities }`.

- `200`: success.
- `401`: `{ "error": "Unauthorized" }`.

### Users (committee membership)

Requires `user:manage` (President only). Password hashes are never returned.

```text
GET    /api/panel/users?page=1&pageSize=15&q=&committeeId=&postId=&role=&status=
POST   /api/panel/users
GET    /api/panel/users/:id
PATCH  /api/panel/users/:id
```

Create body: `name`, `email`, `password` (min 12 chars), `postId`, `committeeId`, optional `studentId`, `batch`.
`role` is never accepted — it's derived server-side from the target committee's `type`, so a client can't create a mismatched account.

- `201`: `{ data: user }`.
- `404`: unknown `postId` or `committeeId`.
- `400`: target committee is `DISSOLVED`.
- `409`: email already in use.

Update body: any of the create fields (all optional) plus `status` (`ACTIVE` | `REVOKED`) and an optional `password` to reset it. Moving `committeeId` re-derives `role` the same way create does. `electionAccessGranted` is intentionally not editable here — see the grant-access endpoint.

No `DELETE`: a `User` row is referenced by audit logs, verified candidates, published notices, and more, so accounts are revoked (`PATCH { "status": "REVOKED" }`), never deleted. A revoked account fails login immediately (`getCurrentUser` checks `status` on every request).

### Governance actions — election access grant & committee dissolution

Dedicated action endpoints for the two governance steps in SRS §5.3,
separate from the generic CRUD resources below.

```text
POST   /api/panel/users/:id/grant-election-access
DELETE /api/panel/users/:id/grant-election-access
POST   /api/panel/committees/dissolve-executive
```

Requires `election:grant_access` (President only). Grants or revokes the
target user's `electionAccessGranted` flag — the switch that unlocks
`election:dissolve_executive` for the Chief Election Commissioner. A
separate, audited action rather than a field on the generic user-update
route, since this is a one-time governance step, not a routine profile edit.

- `200`: `{ data: user }`.
- `400`: target is not an active Election Committee member, or not the
  Chief Election Commissioner.
- `404`: user not found.
- `409`: already granted (`POST`) or not currently granted (`DELETE`).

**Dissolve Executive Committee** (`election:dissolve_executive`, Chief
Election Commissioner only, once access is granted) looks up the current
`ACTIVE` Executive Committee itself — no id needed, there's always at most
one — sets it to `DISSOLVED`, and returns it with its (name/post-only)
member list.

- `200`: `{ data: committee }`.
- `400`: `NO_ACTIVE_EXECUTIVE_COMMITTEE` if there is none.

Members lose panel access on their very next request: `getCurrentUser()`
already rejects a dissolved committee, so no separate step revokes each
member individually. Both actions write an `AuditLog` row inside the same
transaction as the update.

### Standard CRUD resources

Unless noted otherwise, these resources support:

```text
GET    /api/panel/:resource?page=1&pageSize=15&q=search
POST   /api/panel/:resource
GET    /api/panel/:resource/:id
PATCH  /api/panel/:resource/:id
DELETE /api/panel/:resource/:id
```

List responses are `{ data: [], pagination }`; detail and mutation responses are `{ data: record }`.

| Resource | Permission | Create/update fields |
| --- | --- | --- |
| `events` | Read `event:view`; mutations `event:manage` | `title`, `description`, `date`, `venue`, optional `guests`, optional `registrationLink`, `category`, optional `status` |
| `achievements` | Read `content:view`; mutations `content:manage` | `title`, optional `description`, `date`, optional `awardingOrg`, optional `photoUrl` |
| `contests` | Read `content:view`; mutations `content:manage` | `name`, `date`, `type`, optional `result`, optional `registrationLink` |
| `sponsors` | Read `content:view`; mutations `content:manage` | `name`, `tier`, optional `logoUrl`, optional `description` |
| `gallery` | Read `content:view`; mutations `content:manage` | `url`, optional `isVideo`, optional `eventName`, `year` |
| `site-content` | Read `content:view`; mutations `content:manage` | `key`, JSON `value` |

Events additionally support list filters `status` and `category`. Notices use the separate contract below.

### Notices

Endpoints:

```text
GET    /api/panel/notices?page=1&pageSize=15&scope=GENERAL
POST   /api/panel/notices
GET    /api/panel/notices/:id
PATCH  /api/panel/notices/:id
DELETE /api/panel/notices/:id
```

Body: `subject`, `body`, `scope`, `memoNo`, `date`, optional `pdfUrl`, optional `imageUrl`, optional `isPinned`.

**`POST /api/panel/notices/:id/generate-pad`** — renders the notice onto the
club's official letterhead and returns it as a PDF download
(`Content-Type: application/pdf`). Gated on the same permission as viewing
the notice (`notice:view:general`/`internal`/`election` depending on its
scope), not on publish. Optional JSON body: `{ "ccList": string[] }` for a
numbered distribution list (not stored anywhere — supplied fresh each time).
Always renders on demand; `Notice.pdfUrl` is left untouched since there's no
file storage configured yet to persist a URL against. See
`docs/STEP_7_CHANGELOG.md` for how the PDF pipeline itself works.

**`POST /api/panel/notices/ai-draft`** — Notice & Publication Team only
(`notice:ai_generate`). Body: `{ scope, instruction, conversation? }`. Drafts
a notice in Bengali via the Anthropic API, using the scope's 5 most recent
notices as style/memo-numbering context. Returns
`{ needsClarification, clarifyingQuestion, draft }` — exactly one of
`clarifyingQuestion`/`draft` is non-null. If the model needs information it
wasn't given, it asks one question back instead of inventing facts; resubmit
with the reply as the new `instruction` and the prior turns in
`conversation`. `503 AI_NOT_CONFIGURED` if `ANTHROPIC_API_KEY` isn't set.
See `docs/STEP_8_CHANGELOG.md` for the exact turn-taking contract.


Visibility and publishing are scope-aware:

- `GENERAL`: logged-in users and the public announcements API.
- `INTERNAL`: Executive Committee only.
- `ELECTION`: Election Committee only.
- Publishing requires `notice:publish:general`, `notice:publish:internal`, or `notice:publish:election`.

### Election and governance

These resources use the standard CRUD contract. Their list endpoints support `page`, `pageSize`, and resource-specific filters; mutations require `election:manage`.

| Resource | Filters | Create/update fields |
| --- | --- | --- |
| `committees` | `type`, `status`, `q` | `type`, optional `status`, `startDate`, optional `endDate` |
| `elections` | `committeeId`, `status`, `q` | `committeeId`, `applicationDeadline`, `votingDate`, `applicationFee`, optional `eligibleBatches`, optional `resultDeclarationUrl`, optional `status` |
| `candidates` | `electionId`, `status`, `q` | `electionId`, `postId`, `applicantName`, `studentId`, `batch`, `email`, optional `status`, `symbolId`, `isUnopposed`, `eligibilityWaived`, `isWinner` |
| `symbols` | `q` | `name`, optional `imageUrl` |
| `payments` | `candidateId`, `method`, `q` | `candidateId`, `method`, `amount`, optional `transactionRef`, `paidToMember`, `paidAt` |
| `election-results` | `electionId`, `postId`, `outcome`, `q` | `electionId`, `postId`, optional `candidateId`, `outcome` |

Endpoints follow `/api/panel/:resource` and `/api/panel/:resource/:id`.

> `committees` create/update note: `POST /api/panel/committees` with
> `type: "ELECTION"` requires `committee:create_election` (President only),
> not `election:manage` — see "Governance actions" above.
> `type: "EXECUTIVE"` is rejected outright; the Executive Committee is only
> ever produced by the election handover or the one-time onboarding script.
> `GET` accepts either `election:manage` or `committee:create_election`.
> Committee member lists (`members`) only ever return `id`, `name`, and
> `post.name` — never the full `User` row.

> `candidates` and `payments` list/detail responses now select only
> `id`/`name` from their `verifiedBy` relation — they previously returned
> the full `User` row, including `passwordHash`.

`GET /api/panel/posts` — the full list of the 20 constitutional posts
(`id`, `name`, `eligibleYear`, `isAssistant`, `rank`), `election:manage`.
No pagination (small, rarely-changing set). Needed so the panel can show
posts with **zero** candidates, which never appear in a `candidates` list.

### Uncontested posts & eligibility fallback (SRS §6.1.3)

```text
POST /api/panel/elections/:id/posts/:postId/reopen
POST /api/panel/elections/:id/posts/:postId/declare-uncontested
```

Both require `election:manage`.

- **`reopen`** — for a post with zero non-`REJECTED` applications. Pushes
  `postId` onto `Election.reopenedPostIds` and, optionally, extends
  `applicationDeadline` (`{ "newDeadline": "..." }`). `400` if the post
  already has an application; `409` if already reopened. Note: this only
  records that the post was reopened — `POST /api/panel/candidates` does
  not itself enforce `Post.eligibleYear` either way, so
  `Candidate.eligibilityWaived` is still set by hand when the committee
  records a candidate who applied under a reopened post.
- **`declare-uncontested`** — resolves the post's sole `VERIFIED` or
  `SYMBOL_ALLOTTED` candidate itself (doesn't take a `candidateId`, so the
  wrong person can't be picked by mistake) and sets both
  `status: "UNOPPOSED"` and `isUnopposed: true`. `400` if the post doesn't
  have exactly one such candidate.

Both write an `AuditLog` row.

### Election result declaration & automated handover (SRS §5.3, §6.1) ⭐

```text
POST /api/panel/elections/:id/publish-results
```

Requires `election:manage`. This is the single most consequential endpoint
in the system — see `docs/STEP_6_CHANGELOG.md` for the full design writeup.
In one transaction:

1. Resolves a winner (or `NO_CANDIDATE`) for every one of the 20 posts —
   an uncontested post from `declare-uncontested`, or a contested post
   where the committee has `PATCH`'d exactly one candidate's
   `isWinner: true` beforehand. Blocks with `400 UNRESOLVED_POSTS` and a
   per-post reason list if anything is ambiguous (no winner marked, more
   than one marked, etc.) — nothing is guessed.
2. Creates the next Executive Committee (`ACTIVE`).
3. Creates a login for every winner in that new committee
   (`EXECUTIVE_COMMITTEE`, matching post), with a random temporary
   password. Rejects the whole transaction with `409 EMAIL_CONFLICT` if a
   winner's email is already in use by an existing account.
4. Upserts an `ElectionResult` row per post (`ELECTED` / `UNOPPOSED` /
   `NO_CANDIDATE`).
5. Dissolves the Election Committee that ran the election.
6. Sets `Election.status = "RESULTS_PUBLISHED"`.

Preconditions (all `400`/`409` otherwise): election must be `CLOSED`
(`PATCH` its status after voting), must not already be
`RESULTS_PUBLISHED`, and there must be **no** currently `ACTIVE` Executive
Committee — run `POST /api/panel/committees/dissolve-executive` (Step 4)
first.

Response: `{ data: { election, newCommittee, createdAccounts } }`, where
`createdAccounts` is `{ post, name, email, tempPassword, emailSent }[]` — the
only time
these plaintext passwords are ever visible; only their bcrypt hash is
stored. There is no email delivery yet, so the caller must relay them
manually (planned for a later step).

Three `AuditLog` rows are written: `ELECTION_RESULTS_PUBLISHED`,
`EXECUTIVE_COMMITTEE_CREATED`, `ELECTION_COMMITTEE_DISSOLVED`.

### Attendance operations

`GET /api/panel/attendance/forms`

Requires `attendance:view_all`. Query: `page`, `pageSize`, `q`. Returns forms with entry counts.

`POST /api/panel/attendance/forms`

Requires `attendance:create_form`. Body: `{ "title": "Event attendance" }`. Returns `{ data: form }` with `201`.

`GET /api/panel/attendance/forms/:id/entries`

Requires `attendance:view_all` or `attendance:view_oversight`. Returns `{ data: entries, pagination }`.

Attendance forms have no panel update or delete endpoint. Public submissions use the share-token endpoint documented above.

### Finance operations

`GET /api/panel/finance/transactions`

Requires `finance:manage` or `finance:view_oversight`. Query: `page`, `pageSize`, `q`.

`POST /api/panel/finance/transactions`

Requires `finance:manage`. Body: `type`, `fundHeadId`, `amount`, `description`, `memberName`, optional `documentUrl`, optional `date`.

`PATCH /api/panel/finance/transactions/:id`

Requires `finance:manage`. Accepts the transaction fields as optional updates.

`DELETE /api/panel/finance/transactions/:id`

Requires `finance:manage`.

**`GET /api/panel/finance/fund-heads`** — `finance:manage` or
`finance:view_oversight`. No pagination. **`POST /api/panel/finance/fund-heads`**
— `finance:manage` only, body `{ name, type }`. Didn't exist before this
step; fund heads previously only ever came from `prisma/seed.ts`.

**`GET /api/panel/finance/summary`** — `finance:manage` or
`finance:view_oversight`. Real-time aggregate (not a stored value):
`{ totalIncome, totalExpense, balance, byFundHead }`.

**`GET /api/panel/finance/reports/half-yearly?startDate=&endDate=&format=json|pdf|xlsx`**
— `finance:manage` or `finance:view_oversight`. `format=json` (default)
returns the compiled data; `pdf` renders it onto the club letterhead (reuses
Step 7's `renderLetterheadHtml`/`renderHtmlToPdf`) and returns a download;
`xlsx` returns a two-sheet workbook (Summary, Transactions) via `exceljs`.
Simplification vs the SRS's President-review/"released" workflow: there's
no approval-state model, so both Treasurer and President can generate the
same report on demand — see `docs/STEP_9_CHANGELOG.md`.

The fund-head type must match the transaction type; mismatches return `422`. Treasurer mutations are audited, while the President has read-only oversight.

### Resolutions

`/api/panel/resolutions` supports standard CRUD and requires `resolution:manage`.

Body fields: `meetingNo`, `memoNo`, `date`, `meetingTime`, `venue`, `president`, `convener`, `agenda`, `discussion`, `decisions`, `attendeeCount`, optional `implementationResponsibility`, `signatories`, and `pdfUrl`.

Responses include related documents.

### Documents

`GET /api/panel/documents`

Requires `document:manage`. Query: `page`, `pageSize`, `q`.

`POST /api/panel/documents`

Requires `document:manage`. Body: `title`, `url`, `mimeType`, optional `sizeBytes`, and exactly one of `noticeId` or `resolutionId`. The related record must exist.

`DELETE /api/panel/documents/:id`

Requires `document:manage`. Documents have no detail `GET`, update `PATCH`, or panel upload endpoint beyond metadata creation.

### Membership applications & contact messages

```text
GET   /api/panel/membership-applications?status=&q=&page=&pageSize=
PATCH /api/panel/membership-applications/:id     { "status": "APPROVED" | "REJECTED" }
GET   /api/panel/contact-messages?q=&page=&pageSize=
```

Requires `membership:manage` / `contact:view` respectively — a scope
decision not named in the original permission matrix: gated to President or
General Secretary (see `docs/STEP_10_CHANGELOG.md`). Approving a membership
application only changes its `status`; it does **not** create a `User`
account — Club Members are intentionally not a login role in this system
(SRS §5.1). `contact-messages` is read-only; there's no status field on
that model to update.

## Status codes

- `200`: successful read, update, delete, or idempotent response.
- `201`: created.
- `307`: redirect.
- `400`: invalid public request.
- `401`: missing, invalid, or revoked authentication.
- `403`: insufficient permission or inactive access.
- `404`: resource or related record not found.
- `422`: invalid panel query or body.
- `429`: rate limited.
- `500`: unexpected server error.

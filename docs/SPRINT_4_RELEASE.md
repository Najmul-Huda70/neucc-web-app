# Sprint 4 Backend Release Runbook

## Operations API

All protected endpoints require the access-token cookie and return the standard
`{ data }` or `{ error: { code, message } }` response shape.

- Attendance: `GET/POST /api/panel/attendance/forms`,
  `GET /api/panel/attendance/forms/:id/entries`, and public
  `POST /api/public/attendance/:shareToken/entries`.
- Finance: `GET/POST /api/panel/finance/transactions`, plus `PATCH/DELETE`
  on `/api/panel/finance/transactions/:id`.
- Resolutions: `GET/POST /api/panel/resolutions`, plus `GET/PATCH/DELETE`
  on `/api/panel/resolutions/:id`.
- Documents: `GET/POST /api/panel/documents`, plus `DELETE`
  on `/api/panel/documents/:id`.

Attendance submissions do not require login, but the share token is required.
Finance mutations require the Treasurer post; the President has read-only
oversight. Resolution and document mutations require the Information Secretary
or Assistant Information Secretary post. Sensitive mutations create an audit
row in the same database transaction.

## Production Deployment

1. Configure `DATABASE_URL`, `DIRECT_URL`, both JWT secrets, token expiry values,
   and `NEXT_PUBLIC_APP_URL` in the deployment provider. Use unique random JWT
   secrets of at least 32 bytes and never commit them.
2. Take a database backup and record its identifier before applying migrations.
3. Run `npx prisma generate` and `npx prisma migrate deploy` in the release
   environment.
4. Run `npm run build`, then deploy the application.
5. Run the unauthenticated, forbidden, public attendance, and authorized
   mutation smoke checks against the deployed URL.

## First Admin Onboarding

Set `ADMIN_NAME`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` of at least 12
characters only for the one-time command:

```bash
npm run prisma:onboard-admin
```

The command reuses the active executive committee, creates or updates the
President account, and hashes the password. Remove `ADMIN_PASSWORD` from the
environment immediately after it succeeds. Do not use seed data or shared
credentials for production access.

## Rollback

Application rollback is preferred when the schema is backward compatible. Do
not run `prisma migrate reset` in production. For a migration failure, stop the
deployment, preserve logs and the backup identifier, and restore the database
using the provider's point-in-time or backup restore procedure under the release
owner's approval. Re-run validation before reopening traffic.

## Security Gate

- `npx tsc --noEmit`, `npm run lint`, `npm run test`, and `npm run build` pass.
- Login throttling returns `429` after repeated attempts from one client IP.
- Every protected operations route returns `401` without a session and `403`
  for a role without the required action.
- Attendance reads are not exposed through the public share-token endpoint.
- Finance fund-head type matches the transaction type.
- Documents reference exactly one existing notice or resolution.
- No production secrets, default passwords, or test credentials are present.
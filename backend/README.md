# NEUCC Backend — Part 1 & 2 Starter

This folder is the output of **Part 1 (Project Setup)** and **Part 2 (Database
Schema Design)** from the backend roadmap. Drop it into a fresh
`create-next-app` project (or use it as-is) and follow the steps below.

## What's included

```
neucc-backend/
├── prisma/
│   ├── schema.prisma   ← all models from Part 2 (User, Post, Committee,
│   │                      Election, Candidate, Payment, Symbol, Event,
│   │                      Notice, Resolution, Attendance*, Transaction,
│   │                      FundHead, MembershipApplication, ContactMessage,
│   │                      AuditLog)
│   └── seed.ts         ← seeds the 20 constitutional posts, fund heads,
│                          and one test President/Executive Committee
├── lib/
│   └── prisma.ts       ← Prisma client singleton (safe for Next.js hot reload)
├── middleware.ts        ← route-protection skeleton for /api/panel & /dashboard
│                          (Part 3 will fill in real JWT verification)
├── .env.example
└── package.json
```

## Setup steps

1. **Scaffold Next.js** (skip if you already have a project):
   ```bash
   npx create-next-app@latest neucc-web --typescript --tailwind --eslint --app
   cd neucc-web
   ```

2. **Copy these files in** — `prisma/`, `lib/prisma.ts`, `middleware.ts`,
   `.env.example` — into the new project root, merging `package.json`
   dependencies into yours (or just use this `package.json` directly).

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Set up PostgreSQL.**
   - Local dev: run Postgres via Docker —
     ```bash
     docker run --name neucc-db -e POSTGRES_PASSWORD=postgres \
       -e POSTGRES_DB=neucc -p 5432:5432 -d postgres:16
     ```
   - Staging/production: create a database on Neon, Supabase, or Railway.

5. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # then fill in DATABASE_URL (and DIRECT_URL if your provider pools connections)
   ```

6. **Run the first migration:**
   ```bash
   npx prisma migrate dev --name init
   ```
   This creates every table defined in `schema.prisma` and generates the
   type-safe Prisma Client.

7. **Seed the database:**
   ```bash
   npm run prisma:seed
   ```
   This inserts the 20 constitutional posts, income/expense fund heads, and
   a test Executive Committee with a President login
   (`president@neucc.test` / `ChangeMe123!` — change this before going live).

8. **Inspect the data visually (optional but handy):**
   ```bash
   npx prisma studio
   ```

9. **Verify the schema compiles cleanly:**
   ```bash
   npx prisma validate
   npx prisma format
   ```

## Design notes carried over from the SRS

- **Only two roles get `User` rows** — `ElectionCommittee` and
  `ExecutiveCommittee`. Club Members and the Advisory Board have no login
  (SRS §5.1), so they are *not* modeled as `User` — they only appear as
  free-text fields on `MembershipApplication`, `ContactMessage`, and
  `AttendanceEntry`.
- **`Committee.status`** drives the auto-dissolution rule (SRS §5.3): when
  an Executive/Election Committee is dissolved, every `User` linked to it
  should have its elevated permissions revoked on the next authenticated
  request — this check belongs in `lib/auth.ts` in Part 3, not just in the
  UI.
- **`Notice.scope`** (`GENERAL | INTERNAL | ELECTION`) must be checked on
  *every* read/download endpoint, not just at publish time (SRS §6.3.4).
- **`AttendanceEntry`** intentionally has no required `submittedByUserId` —
  the public shareable-link path (Club Members/Advisory Board) submits
  without an account, per SRS §6.4.
- **`AuditLog`** is written to from every dissolution, handover,
  access-grant, notice-publish, and financial-entry action (Part 5–8) — wire
  this in as you build each module, not retroactively.

## Part 3 — Authentication & RBAC

New files added in this part:

```
lib/auth/
├── passwords.ts     ← bcrypt hash/compare (12 salt rounds)
├── jwt.ts            ← sign/verify access (15m) + refresh (30d) tokens with `jose`
│                        (jose, not jsonwebtoken — it runs on the Edge runtime,
│                        which middleware.ts needs)
├── cookies.ts        ← httpOnly/secure/sameSite=lax cookie helpers
├── session.ts         ← getCurrentUser() — re-checks the DB on every call so
│                        a dissolved committee loses access immediately (§5.3)
└── permissions.ts     ← can(user, action) — the ENTIRE Role-wise Permission
                          Matrix (§5.4) lives here as one switch statement;
                          nothing else in the app should hand-roll a role check

app/api/auth/
├── login/route.ts     ← POST — verifies password, checks status/committee,
│                          issues both cookies
├── refresh/route.ts   ← POST — rotates the access token, re-checks the DB
└── logout/route.ts    ← POST — clears both cookies

app/api/panel/me/route.ts   ← example protected route: returns the caller's
                               profile + a `capabilities` map computed from
                               can(), for the frontend to build its menu from

middleware.ts (updated)      ← Edge-safe token check on /api/panel/* and
                               /dashboard/* (redirects/401s on missing or
                               expired token; the *real* RBAC decision still
                               happens in each route handler via getCurrentUser)
```

### Two-layer enforcement, on purpose

1. **`middleware.ts`** (Edge runtime, no DB access) — rejects requests with no
   token or an expired/invalid signature. Cheap, but can't see "was this
   committee dissolved 5 minutes ago?"
2. **`getCurrentUser()`** (Node runtime, inside route handlers) — re-queries
   the `User`/`Committee` rows on *every* call. This is what actually
   satisfies SRS §3's "revoke access the moment a committee is dissolved,
   checked on every authenticated request, not just at login."

Every protected route should follow the pattern in `app/api/panel/me/route.ts`:

```ts
const { user, error } = await requireUser();
if (error) return error;

const denied = assertCan(user, "election:manage");
if (denied) return denied;

// ... handle the request
```

### One schema change

`prisma/schema.prisma`'s `User` model gained one field:

```prisma
electionAccessGranted Boolean @default(false)
```

This backs the "Grant Election Module Access" / "Dissolve Executive
Committee" pair (§5.3) — the President flips it on for the Chief Election
Commissioner; `permissions.ts` checks it directly. Run:

```bash
npx prisma migrate dev --name add-election-access-grant
```

### Setup additions for this part

```bash
npm install   # picks up jose, zod (already in package.json)
```

Add to `.env` (already in `.env.example`):
```
JWT_ACCESS_SECRET="..."
JWT_REFRESH_SECRET="..."
```
Generate strong values with `openssl rand -base64 48`.

### Smoke test

```bash
npm run dev
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"president@neucc.test","password":"ChangeMe123!"}'
# then, using the Set-Cookie header from that response:
curl -i http://localhost:3000/api/panel/me -H "Cookie: access_token=<token>"
```

## Next step

**Part 4 — Public Website APIs** (Home, Events, About/Executives/Contests/
Gallery/Achievements, Announcements, Join Us, Contact) — these need no auth
at all, so they can be built in parallel with Part 5–8 once this part and
Part 2 are solid.

## Part 4 — Public Website APIs

No authentication anywhere in this part — every route is reachable by
anonymous visitors, per SRS §3 (14-page public site, no login).

```
app/api/public/
├── home/route.ts          ← GET — stats (members/events/workshops),
│                             upcoming events preview, achievement highlights
├── events/route.ts        ← GET — filter(status,category), search(q),
│                             pagination(page,pageSize)
├── about/route.ts         ← GET — mission/vision/history + Constitution link,
│                             pulled from SiteContent
├── executives/route.ts    ← GET — current Executive Committee (from
│                             Committee+User+Post, ranked); ?history=true
│                             for past dissolved committees
├── contests/route.ts      ← GET — ?type=PROGRAMMING|CTF|HACKATHON
├── gallery/route.ts       ← GET — ?year=&event=
├── achievements/route.ts  ← GET — full timeline, newest first
├── announcements/route.ts ← GET — Notice WHERE scope="GENERAL" only,
│                             pinned-first ordering (§3.8, §6.3.4)
├── sponsors/route.ts      ← GET — grouped by tier (Platinum/Gold/Silver)
├── join-us/route.ts       ← POST — MembershipApplication, honeypot + rate limit
├── contact/route.ts       ← POST — ContactMessage, honeypot + rate limit
└── constitution/route.ts  ← GET — redirects to the static Constitution PDF

lib/
├── rate-limit.ts          ← in-memory limiter for the two POST endpoints
│                             (swap for Redis/Upstash before deploying to
│                             multi-instance hosting — see file comment)
└── validation/public.ts   ← Zod schemas + honeypot field for both forms
```

### Schema additions for this part

Four new models power the "mostly read-only content" pages that don't map to
anything from Part 2 — `Achievement`, `Contest`, `GalleryItem`, `Sponsor` —
plus a small `SiteContent` key/value table so prose blocks (mission,
vision, chairperson's message) can be edited without a redeploy. `Post`
also gained a `rank` field to order the Executives page hierarchy grid.

```bash
npx prisma migrate dev --name add-public-content-models
npm run prisma:seed   # now also seeds starter About/Home text blocks
```

### Two things intentionally deferred

- **Half-yearly financial report download** (also mentioned in §3.3/§4.5) —
  needs the report-release workflow from **Part 8 (Treasury)**, so its public
  download route is built there instead of here.
- **Static assets** (Constitution PDF, sponsor logos, gallery images) — this
  starter assumes files land in `/public/documents` and `/public/uploads` or
  an S3 bucket; wire in real file storage in **Part 6** when you build the
  Notice/Resolution module's document uploads, and reuse that setup here.

### Smoke test

```bash
npm run dev
curl http://localhost:3000/api/public/home
curl http://localhost:3000/api/public/events?status=UPCOMING
curl -X POST http://localhost:3000/api/public/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"a@b.com","subject":"Hi","message":"Hello there"}'
```

## Next step

**Part 5 — Committee Lifecycle & Election Module** — the most business-logic
-heavy part of the system (election setup, candidate nomination/fee/symbol
workflow, uncontested-post handling, result publication, and the
Election→Executive handover that dissolves/creates committees).

# Urgent — Authentication Bypass Found & Removed

Found while answering "how does a user log into the panel" — not part of
any planned step, but serious enough to fix immediately rather than defer.

## What was wrong

`src/app/api/auth/login/route.ts` had a **hardcoded demo-password
backdoor**:

```ts
const demoPassword = password === "123456";
...
if (demoPassword && registrationNumber) {
  return Response.json({ user: { role: demoRole, post: demoPosition, ... } });
}
```

`role` and `demoPosition` came straight from the **request body** — anyone
could send any `registrationNumber` with `password: "123456"` plus
`role: "EXECUTIVE_COMMITTEE"` and `position: "President"` and get back a
200 response claiming to be the President, with **no database check at
all**. The login page's password field even had `123456` as its visible
placeholder text, advertising the bypass.

Compounding it: `src/app/login/page.tsx` silently substituted `"123456"`
for the password field whenever it was left **empty**
(`password.trim() || '123456'`) — so a user who forgot to type a password
wasn't told "password required"; they were silently routed through the
backdoor instead. It also read the fake `role`/`post` back out of that
response and pushed them into the dashboard URL as query params
(`?role=...&position=...`), which `DashboardShell.tsx` then trusted
directly (`searchParams.get('role')`) to decide what UI to show.

## Why this didn't actually expose real data

Worth being precise about the actual blast radius, not overstating it:

- The demo branch **never called `setAuthCookies()`** — no real session
  cookie was ever issued through it. Every real endpoint this project's
  Steps 1–10 work added (`/api/panel/*`) checks a signed JWT cookie via
  `getCurrentUser()`, which a URL query parameter cannot forge. So none of
  the real Committees/Elections/Finance/Notices/Attendance/Resolutions/
  Documents/Members data built in this project was ever reachable through
  this bug.
- What it did expose: unrestricted access to `DashboardShell.tsx`'s **mock
  UI** (a component already flagged in every step's changelog as
  non-functional demo state with no real API calls) — cosmetically showing
  fake dashboard content as if any chosen role, to anyone, no login
  required.

Low real-data risk today, but this is exactly the kind of dead code that
turns into a real vulnerability the moment someone wires one more real
action into that mock shell without noticing the auth story underneath it
was never real to begin with. Removed rather than left as "technically
low-risk."

## What changed

- **`src/app/api/auth/login/route.ts`** — removed the entire demo branch.
  Login now always checks the `User` table (by email or `studentId`) and
  verifies the password hash — no shortcuts.
- **`src/app/login/page.tsx`** — removed the `role`/`position` fields sent
  to the login API, removed the empty-password → `"123456"` fallback
  (empty password now correctly shows "Please enter your password."),
  removed the query-param role/position redirect trick, changed the
  password field's placeholder from the literal string `123456` to dots.
- **`src/app/login/page.test.tsx`** — updated the one test that asserted
  the old (broken) request body shape, so the test suite no longer encodes
  the bug as expected behavior.

## What was NOT changed (still flagged, not fixed)
`DashboardShell.tsx` still reads `role`/`position` from
`useSearchParams()` — after this fix, that call simply returns nothing
(login no longer puts them there), so the mock shell now always falls back
to its hardcoded default view. This is consistent with every other step's
changelog calling that component out as non-functional mock UI — fixing
it properly means rewiring the whole component to real data, which is a
larger job than this urgent patch, not something to fold in here.

## How to verify
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run dev
```
1. Try logging in with any registration number and password `123456` —
   should now fail with "Invalid registration number or password" unless
   that's an actual account's real password.
2. Log in with a real seeded account's real password — should succeed,
   set cookies, and every real dashboard page
   (`/dashboard/committees`, `/dashboard/elections`, etc.) should reflect
   that account's actual role and permissions via `/api/panel/me`.
3. Leave the password field empty and submit — should show "Please enter
   your password," not silently proceed.

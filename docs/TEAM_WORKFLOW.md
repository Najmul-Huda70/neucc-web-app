# NEUCC Team Workflow

## Team

- **Najmul Huda**: Team Leader, Backend/API, Auth/RBAC, Integration and Release Owner
- **Zuel Rana**: Frontend Dashboard, Public Integration and UI QA Owner

## Branches

```text
main
dev
najmul/backend-integration
zuel/frontend-dashboard
```

`main` is the protected production-ready branch. `dev` is the protected integration
branch. Never push directly to either branch. Both team members work from Sprint
feature branches and open pull requests into `dev`. Najmul Huda performs the final
merge into `dev`. After all Sprint work passes integration and release checks,
Najmul opens or approves the release pull request from `dev` into `main`.

### Branch Naming

Use this format:

```text
<owner>/<type>/<short-description>
```

Examples:

```text
najmul/feat/event-crud-api
najmul/fix/refresh-token-reuse
najmul/chore/add-audit-log
zuel/feat/event-management-ui
zuel/fix/dashboard-mobile-layout
zuel/docs/api-integration-guide
```

Allowed branch types:

- `feat`: new functionality
- `fix`: bug fix
- `refactor`: code restructuring without behavior change
- `test`: test-only changes
- `docs`: documentation-only changes
- `chore`: tooling, configuration or maintenance

### Branch Rules

1. Create the first Sprint branch from the latest `main`; create every later Sprint branch from the latest integrated `dev`.
2. Keep one feature or one bug fix per branch.
3. Do not mix unrelated formatting, refactoring or dependency changes into a feature branch.
4. Rebase or merge the latest `main` before requesting final approval.
5. Delete the feature branch after the pull request is merged.
6. Sprint branches must be created from the latest `dev` after the previous Sprint has been integrated.
7. Pull requests from Sprint branches target `dev`, never `main`.
8. Najmul defines the API contract first and Zuel consumes that contract in a separate branch when a feature requires both backend and frontend changes.

### Branch Ownership

| Branch or path | Owner | Review required from |
|---|---|---|
| `najmul/*` | Najmul Huda | Zuel for affected UI/API contract |
| `zuel/*` | Zuel Rana | Najmul for API/security/architecture |
| `main` | Both | Najmul gives final release merge approval |
| `dev` | Both | Najmul gives final Sprint merge approval |
| `prisma/*`, `src/app/api/*`, `src/lib/auth/*` | Najmul | Najmul plus Zuel if frontend contract changes |
| `src/app/dashboard/*`, `src/components/*` | Zuel | Zuel plus Najmul if API/auth behavior changes |

## Ownership Boundary

### Najmul Huda

Owns:

- API response and error contracts
- Shared panel route authentication/permission helper
- Prisma schema and migrations
- Event CRUD API
- Notice CRUD API
- Login and dashboard backend foundation
- All remaining protected APIs
- JWT, refresh tokens, session validation and RBAC
- Audit logging and security review
- Environment and deployment setup
- Final merge, integration testing and release

Primary paths:

```text
prisma/
src/app/api/
src/lib/auth/
src/lib/validation/
src/lib/http/
src/app/login/
src/app/dashboard/layout.tsx
```

### Zuel Rana

Owns:

- Dashboard layout and navigation UI
- Capability-based menu visibility
- Shared API client helper
- Event management UI
- Notice management UI
- Loading, error and empty states
- Public page API integration
- Remaining dashboard screens after APIs become available
- Responsive and browser QA
- Frontend documentation

Primary paths:

```text
src/app/(public)/
src/app/dashboard/
src/components/
src/lib/api-client.ts
src/types/types.ts
src/components/ui/
docs/
```

Zuel should not modify Prisma schema or protected route behavior. Najmul should not restructure dashboard UI without coordinating first.

## API Contract

All panel endpoints use the same response shape.

### Success

Single record:

```json
{
  "data": { "id": "..." }
}
```

Collection:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

### Error

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action."
  }
}
```

Required status codes:

- `400`: malformed request
- `401`: unauthenticated
- `403`: authenticated but forbidden
- `404`: record not found
- `409`: conflict
- `422`: validation failure
- `429`: rate limit exceeded
- `500`: unexpected server error

## Shared Panel Route Flow

Every protected route follows this order:

```text
1. requireUser()
2. assertCan(user, action)
3. read and validate query/body with Zod
4. load and verify resource ownership/scope
5. execute Prisma operation
6. create audit log for mutations
7. return the standard response shape
```

The frontend must treat `401`, `403`, `404`, `409`, `422`, and `500` separately and show a useful message.

## Sprint 1: Foundation

### Sprint 1 Branches

Najmul Huda:

```text
najmul/sprint-1/backend-foundation
```

Zuel Rana:

```text
zuel/sprint-1/dashboard-foundation
```

Sprint 1 pull request target: `dev`

Najmul branch description:

> Implements the Sprint 1 backend foundation: shared API response/error helpers,
> panel authentication and permission flow, Event CRUD, Notice CRUD, Zod validation,
> and the login/dashboard session contract. Includes focused auth and permission tests.

Zuel branch description:

> Implements the Sprint 1 frontend foundation: responsive dashboard shell,
> capability-based navigation, typed API client, Event and Notice management UI,
> shared loading/error/empty states, and public Event/Announcement API integration.

Najmul Sprint 1 commits:

```text
feat(api): add panel response and error helpers
feat(auth): add protected panel route guard
feat(api): add event CRUD routes
feat(api): add notice CRUD routes
feat(validation): add event and notice schemas
test(api): cover event and notice permissions
docs(api): document Sprint 1 panel contract
```

Zuel Sprint 1 commits:

```text
feat(ui): add dashboard shell and navigation
feat(api-client): add typed panel request helper
feat(ui): add event management screen
feat(ui): add notice management screen
feat(ui): add shared loading error and empty states
feat(public): connect events and announcements to API
test(ui): verify Sprint 1 dashboard flows
```

Sprint 1 PR title for Najmul:

```text
feat(sprint-1): add backend foundation and event notice APIs
```

Sprint 1 PR title for Zuel:

```text
feat(sprint-1): add dashboard foundation and content management UI
```

### Najmul Huda

- Finalize response/error helpers
- Create panel auth and permission helper
- Implement `GET/POST/PATCH/DELETE /api/panel/events`
- Implement `GET/POST/PATCH/DELETE /api/panel/notices`
- Add Zod schemas for events and notices
- Add login page backend contract and dashboard session endpoint
- Add focused API tests for authentication and permissions

### Zuel Rana

- Build dashboard shell and responsive sidebar
- Build capability-based navigation from `/api/panel/me`
- Create shared API client with typed errors
- Build event list/create/edit/delete UI
- Build notice list/create/edit/delete UI
- Add shared loading, error and empty components
- Connect public events and announcements to public API responses

### Sprint 1 Completion Criteria

- A logged-in authorized user can create, update and delete permitted events/notices.
- An unauthorized user receives `401` or `403` and the UI handles it correctly.
- Public event and announcement pages still work with an empty database.
- `npx tsc --noEmit`, `npm run lint`, and focused API tests pass.

## Sprint 2: Public and Content APIs

### Sprint 2 Branches

Najmul Huda:

```text
najmul/sprint-2/content-management-api
```

Zuel Rana:

```text
zuel/sprint-2/content-management-ui
```

Sprint 2 pull request target: `dev`

Najmul branch description:

> Implements protected Achievement, Contest, Sponsor, Gallery metadata and
> SiteContent APIs with pagination, validation, permission checks and audit logs.

Zuel branch description:

> Implements management screens for achievements, contests, sponsors, gallery and
> site content, plus home-page API integration and consistent public loading/error/
> empty states.

Najmul Sprint 2 commits:

```text
feat(api): add achievement CRUD routes
feat(api): add contest CRUD routes
feat(api): add sponsor CRUD routes
feat(api): add gallery metadata routes
feat(api): add site content routes
test(api): cover content permissions and pagination
docs(api): document Sprint 2 content endpoints
```

Zuel Sprint 2 commits:

```text
feat(ui): add achievement management screen
feat(ui): add contest and sponsor management screens
feat(ui): add gallery management screen
feat(ui): add site content editor
feat(public): connect home content to API
test(ui): verify Sprint 2 content flows
```

Sprint 2 PR title for Najmul:

```text
feat(sprint-2): add content management APIs
```

Sprint 2 PR title for Zuel:

```text
feat(sprint-2): add content management UI and public integration
```

### Najmul Huda

- Achievement CRUD API
- Contest CRUD API
- Sponsor CRUD API
- Gallery metadata CRUD API
- SiteContent CRUD API
- Shared pagination/filter validation
- Audit logs for all content mutations

### Zuel Rana

- Achievement, contest and sponsor management screens
- Gallery management screen
- Site content editor
- Public home page API integration
- Standardize loading/error/empty states across public pages

## Sprint 3: Governance Modules

### Sprint 3 Branches

Najmul Huda:

```text
najmul/sprint-3/governance-api
```

Zuel Rana:

```text
zuel/sprint-3/governance-ui
```

Sprint 3 pull request target: `dev`

Najmul branch description:

> Implements committee and executive management, election lifecycle, candidate
> verification, payments, symbols, results, access grants and notice visibility rules.

Zuel branch description:

> Implements committee, election, candidate verification, payment and result screens
> with role-specific actions and capability-based visibility.

Najmul Sprint 3 commits:

```text
feat(api): add committee management routes
feat(api): add election lifecycle routes
feat(api): add candidate verification and payment routes
feat(api): add symbol and result management
fix(auth): enforce election notice visibility
test(api): cover governance permissions and isolation
docs(api): document Sprint 3 governance endpoints
```

Zuel Sprint 3 commits:

```text
feat(ui): add committee management screen
feat(ui): add election dashboard
feat(ui): add candidate verification flow
feat(ui): add election results screen
fix(ui): enforce role-specific governance actions
test(ui): verify Sprint 3 governance flows
```

Sprint 3 PR title for Najmul:

```text
feat(sprint-3): add governance and election APIs
```

Sprint 3 PR title for Zuel:

```text
feat(sprint-3): add governance and election dashboard UI
```

### Najmul Huda

- Committee and executive management API
- Election lifecycle API
- Candidate verification and payment API
- Symbol allotment and result publication
- Election notice visibility isolation

### Zuel Rana

- Executive/committee management UI
- Election dashboard UI
- Candidate verification UI
- Election result and status screens
- Role-specific action visibility

## Sprint 4: Operations and Release

### Sprint 4 Branches

Najmul Huda:

```text
najmul/sprint-4/operations-release
```

Zuel Rana:

```text
zuel/sprint-4/operations-release-ui
```

Sprint 4 pull request target: `dev`

Najmul branch description:

> Implements attendance, finance, resolution and document APIs, completes audit and
> security review, prepares production environment and database deployment, and adds
> the production admin onboarding process.

Zuel branch description:

> Implements attendance, finance, resolution and document screens, completes mobile
> and desktop QA, cleans browser errors and prepares user and release documentation.

Najmul Sprint 4 commits:

```text
feat(api): add attendance form and entry routes
feat(api): add finance and treasury routes
feat(api): add resolution and document routes
feat(audit): record protected mutations
test(security): verify role and data isolation
chore(release): prepare production migration and environment
docs(release): add admin onboarding and rollback steps
```

Zuel Sprint 4 commits:

```text
feat(ui): add attendance management screens
feat(ui): add finance dashboard
feat(ui): add resolution and document screens
test(ui): complete responsive regression checks
fix(ui): clean browser console errors
docs(release): add user guide and release checklist
```

Sprint 4 PR title for Najmul:

```text
feat(sprint-4): complete operations APIs and release preparation
```

Sprint 4 PR title for Zuel:

```text
feat(sprint-4): complete operations UI and release QA
```

## Current Project Status and Next Sprint

The backend foundation, public website, authentication, protected API routes,
Prisma migrations, dashboard shell, event management UI, API reference, and
demo credentials are implemented. The current quality gates pass:

```text
npx tsc --noEmit   PASS
npm run lint       PASS
npm run test       PASS (20 tests)
npm run build      PASS
```

The next sprint focuses on completing frontend integration and release
verification. Work should be completed in this order:

1. **Create the shared API client**
  - Add typed GET/POST/PATCH/DELETE helpers in `src/lib/api-client.ts`.
  - Normalize API errors and handle `401` session expiry consistently.

2. **Finish Event and Notice workflows**
  - Connect dashboard forms to the protected APIs.
  - Complete create, edit, delete, validation, loading, empty and forbidden states.

3. **Complete Sprint 2 content screens**
  - Add Achievements, Contests, Sponsors, Gallery and Site Content management UI.
  - Connect public home and listing pages to the corresponding APIs.

4. **Complete governance screens**
  - Add committee, election, candidate, payment, symbol and result screens.
  - Hide or disable actions according to authenticated user capabilities.

5. **Complete operations screens**
  - Add attendance, finance, resolution and document management UI.
  - Include Treasurer, President and Information Secretary permission states.

6. **Verify authentication flows**
  - Test seeded Executive Committee login, logout, refresh and revoked sessions.
  - Decide and implement the final Election Committee login experience after the
    role selector removal.

7. **Expand automated coverage**
  - Add API tests for `401`, `403`, validation, not-found, scope isolation and
    protected mutations.
  - Add UI tests for CRUD success, errors, empty states and capability visibility.

8. **Run browser and responsive QA**
  - Verify desktop and mobile layouts for public pages and dashboard screens.
  - Check event sharing, forms, navigation, browser console errors and keyboard use.

9. **Prepare production configuration**
  - Configure database URLs, JWT secrets, token expiry values and app URL.
  - Take a database backup, deploy migrations and run admin onboarding once.

10. **Release validation and merge**
   - Run typecheck, lint, tests, build and production smoke checks.
   - Update the task board, complete the PR review checklist, merge into `dev`,
    then promote the validated release to `main`.

### Next Sprint Definition of Done

- All planned dashboard screens use the shared API client.
- Every screen has loading, empty, success, validation, `401` and `403` states.
- CRUD and permission behavior is covered by focused tests.
- Desktop and mobile browser checks are recorded in the PR.
- Production environment and migration steps are verified without committing secrets.
- `npx tsc --noEmit`, `npm run lint`, `npm run test`, and `npm run build` pass.

### Sprint Completion and `dev` Merge

At the end of every Sprint:

1. Najmul pushes `najmul/sprint-X/...` and Zuel pushes `zuel/sprint-X/...`.
2. Each person opens a separate pull request targeting `dev`.
3. The PR title and branch description must use the Sprint-specific values above.
4. Najmul reviews Zuel's PR for API contract, auth state, routing and integration risk.
5. Zuel reviews Najmul's PR for frontend compatibility, response shape and user-facing behavior.
6. The author resolves all review comments and requests re-review after material changes.
7. Both PRs must pass CI, typecheck, lint, focused tests and the Sprint completion criteria.
8. Najmul gives the final approval and merges both PRs into `dev`, preferably with squash merge.
9. After both PRs are merged, the team tests the complete Sprint in `dev`.
10. Najmul tags the Sprint completion commit and updates the task board.

Sprint tag format:

```text
sprint-1-complete
sprint-2-complete
sprint-3-complete
sprint-4-complete
```

After Sprint 4 passes release validation, Najmul opens the release PR:

```text
release: promote dev to main
```

Release PR description:

> Promotes the fully integrated `dev` branch to `main` after Sprint 1-4 completion.
> Includes production migration status, environment verification, admin onboarding,
> security review, regression results and rollback instructions.

### Najmul Huda

- Attendance API and privacy rules
- Finance/treasury API
- Resolution and document API
- Audit log review
- Production environment setup
- Database migration/deployment
- Admin onboarding
- Security and permission review

### Zuel Rana

- Attendance UI
- Finance dashboard UI
- Resolution/document screens
- Mobile and desktop QA
- Browser error cleanup
- User documentation and screenshots
- Release regression checklist

## Daily Workflow

1. Start the day by updating the task board.
2. Agree on API changes before frontend implementation.
3. Keep commits focused on one feature.
4. Open a pull request when the feature is testable.
5. Reviewer checks permission, validation, error state and mobile behavior.
6. Merge only after CI and local validation pass.
7. Update this document or the task board when a requirement is completed.

## Commit Rules

Every commit must be small, focused and reversible. One commit should represent
one logical change whenever practical.

### Commit Format

```text
<type>(<scope>): <short imperative description>
```

Examples:

```text
feat(api): add event CRUD routes
feat(ui): add event management screen
fix(auth): reject revoked committee sessions
test(api): cover notice scope isolation
docs(workflow): document pull request approval rules
chore(config): update production environment example
```

Rules:

- Use imperative language: `add`, `fix`, `update`, not `added` or `fixing`.
- Keep the subject short and specific.
- Do not commit secrets, `.env`, passwords, tokens or production database URLs.
- Do not use `--no-verify` to bypass checks without team-leader approval.
- Before pushing, run `npx tsc --noEmit` and `npm run lint`.
- For backend changes, also run the focused API tests.
- For UI changes, check desktop and mobile behavior and record the result in the PR.
- Use separate commits for implementation, tests and documentation when that makes review clearer.

## Pull Request Review & Approval

### Pull Request Title

Use the same format as the commit subject, with a clear feature name:

```text
feat(api): add event CRUD API
feat(ui): add event management dashboard
fix(auth): block revoked committee sessions
```

### Pull Request Description

Every pull request must include:

```markdown
## Summary
- What changed?
- Why was it needed?

## Scope
- Files/modules changed
- API endpoints or UI screens affected

## API Contract Changes
- Request body
- Response body
- Error/status code changes

## Permission and Security
- Required permission
- Authentication behavior
- Data visibility or scope rules

## Validation
- [ ] npx tsc --noEmit
- [ ] npm run lint
- [ ] Focused tests
- [ ] Desktop checked
- [ ] Mobile checked

## Screenshots or API Examples
Add screenshots for UI work or request/response examples for API work.

## Known Issues
List anything intentionally deferred.
```

### Review Assignment

- **Najmul Huda's PR:** Zuel performs a functional/API-consumer review. Najmul performs the final architecture, security and merge review.
- **Zuel Rana's PR:** Najmul performs the required API contract, auth, permission and architecture review. Zuel performs a self-check for responsive UI and browser behavior before requesting review.
- **Shared API contract change:** Both members review it before implementation continues.
- **Prisma schema or migration change:** Najmul must review and approve it. Zuel reviews only the frontend data impact.
- **Auth, RBAC, permissions or security change:** Najmul must approve. No automatic merge is allowed.

### Approval Rules

1. The author cannot approve their own pull request.
2. Every pull request needs at least one approval from the other teammate.
3. Najmul gives the final merge approval because he owns integration and release.
4. A PR affecting authentication, RBAC, Prisma schema, migrations or protected APIs needs Najmul's explicit approval after all requested changes are resolved.
5. A PR affecting only UI may be approved by Zuel after the implementation review, but it still requires Najmul's final merge approval when it touches dashboard routing, API client behavior or authentication state.
6. Approval becomes invalid when new commits materially change the reviewed behavior. The author must request re-review.
7. Unresolved review comments block merge.
8. A failing CI check blocks merge unless Najmul documents the reason and approves the exception.

### Reviewer Checklist

#### Backend/API review

- [ ] Authentication is checked with `requireUser()`.
- [ ] Permission is checked with `assertCan()`.
- [ ] Zod validates every body and query parameter.
- [ ] Scope and ownership rules prevent unauthorized data access.
- [ ] Response shape and status codes follow the API contract.
- [ ] Prisma errors do not expose secrets or internal details.
- [ ] Mutation creates an audit log when required.
- [ ] Tests cover success, `401`, `403`, invalid input and not-found cases.

#### Frontend review

- [ ] Uses the shared API client and does not call protected endpoints ad hoc.
- [ ] Handles loading, empty, success and error states.
- [ ] Handles `401` by redirecting or showing the login state.
- [ ] Handles `403` with a clear forbidden message.
- [ ] Destructive actions require confirmation.
- [ ] Form errors are visible and actionable.
- [ ] Desktop and mobile layouts are checked.
- [ ] No dummy data or placeholder content was added.

### Merge Procedure

1. Author pushes the feature branch and opens a pull request into `main`.
2. Author fills the complete PR description and assigns the other teammate as reviewer.
3. Reviewer checks the relevant checklist and leaves comments with file/context details.
4. Author resolves comments, adds or updates tests, and pushes fixes.
5. Reviewer re-checks the changed commits and approves when the checklist is satisfied.
6. Najmul checks the latest `main`, resolves conflicts, runs final validation and confirms the release impact.
7. Najmul merges the PR using squash merge unless preserving separate commits is important for a migration or release investigation.
8. The merged branch is deleted and the task board is updated.

### Conflict Resolution

- The person who owns the conflicting code resolves the conflict.
- API contract conflicts are resolved by Najmul before UI changes continue.
- If both sides changed the same behavior, pause the merge and write down the final decision in the PR.
- Never resolve a conflict by silently dropping another teammate's feature.
- After conflict resolution, rerun typecheck, lint and the affected tests.

## Definition of Done

A feature is complete only when:

- Database fields and migration are correct.
- API has authentication and permission checks.
- Request input is validated with Zod.
- Success and error responses use the standard contract.
- Mutations create an audit record where required.
- UI has loading, error, empty and success states.
- Unauthorized and forbidden cases are tested.
- Mobile layout has been checked.
- `npx tsc --noEmit` passes.
- `npm run lint` passes.
- Related API/UI tests pass.
- Pull request has been reviewed and merged.

## Final Release Checklist

- [ ] Production environment variables configured
- [ ] Database migrations deployed
- [ ] Real admin user created securely
- [ ] No test credentials or placeholder content remain
- [ ] All protected routes reject unauthenticated requests
- [ ] Role and post permissions verified
- [ ] Public pages render correctly with empty database
- [ ] Contact and membership rate limits verified
- [ ] API documentation updated
- [ ] Backup and rollback plan documented
- [ ] Production build passes

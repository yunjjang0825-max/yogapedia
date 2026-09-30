# Yogapedia ClassBox MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deployable mobile-first web application that lets one Busan organization recruit and operate a four-week 4060 Movement Recovery ClassBox and review its outcomes.

**Architecture:** Use a single Next.js App Router application with role-gated participant, instructor, organization, and administrator routes. Supabase provides email magic-link authentication and PostgreSQL with RLS; server actions use the signed-in session, and aggregate-only reporting is isolated behind server modules.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Supabase Auth/PostgreSQL, Vitest, Testing Library, Playwright, Supabase CLI, GitHub, Vercel

**Spec:** `docs/superpowers/specs/2026-09-30-yogapedia-classbox-design.md`

## Global Constraints

- Deliver a mobile-first PWA; do not create native mobile applications.
- The first product is `Busan 4060 Movement Recovery ClassBox`, operated for 15 to 20 participants over four weeks.
- Do not diagnose conditions, claim treatment efficacy, or generate movement prescriptions outside the approved ClassBox.
- Do not store posture video in the MVP.
- Use email magic links; do not add password, phone, social, or anonymous authentication.
- Enable RLS on every application table and do not use a Supabase service role key.
- Never send names, contact details, free text, or individual health responses to an AI provider.
- Do not display segmented outcome statistics for groups smaller than five.
- Store source, migrations, tests, and documentation in GitHub; deploy `main` to Vercel production.

## Review Focus

- An unauthenticated or wrong-role user must never read participant operational records; Task 2 pins this with RLS and route-guard tests.
- A repeated application, assessment, or attendance request must not create duplicate records; Tasks 4 through 6 pin idempotency by unique constraints and duplicate-submission tests.
- Expired, reused, or malformed magic links must return a recoverable login state without losing the intended destination; Task 3 pins callback tests.
- Groups smaller than five must never expose segmented outcomes; Task 7 pins suppression tests.
- AI/report-provider failure must not block stored metrics or deterministic report export; Task 7 pins fallback tests.

---

### Task 1: Application Foundation and Quality Gates

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/components/app-shell.tsx`
- Create: `src/lib/env.ts`
- Create: `public/manifest.webmanifest`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/app/page.test.tsx`
- Create: `e2e/public-home.spec.ts`
- Create: `.env.example`
- Create: `.gitignore`

**Interfaces:**
- Consumes: none.
- Produces: `env` validated by `src/lib/env.ts`; public `/` route; shared `AppShell` component.

- [ ] **Step 1: Scaffold Next.js with App Router, TypeScript, Tailwind, ESLint, `src/`, and npm.**

Run the official `create-next-app` generator in a temporary directory, move its generated files into the repository without overwriting `docs/` or `.git/`, and install Vitest, Testing Library, Playwright, Supabase clients, and the Supabase CLI as project dependencies. Add `test`, `typecheck`, and `test:e2e` npm scripts.

- [ ] **Step 2: Write failing foundation tests.**

Create `src/app/page.test.tsx` asserting the brand name, the Movement Recovery ClassBox, and one application call to action. Create `e2e/public-home.spec.ts` asserting `/` renders at mobile width without horizontal overflow.

- [ ] **Step 3: Run tests and confirm the expected failure.**

Run: `npm test -- --run src/app/page.test.tsx`

Expected: FAIL because the public home implementation is absent.

- [ ] **Step 4: Implement the public shell, home page, manifest, and strict environment parser.**

`src/lib/env.ts` must expose `getPublicEnv(): { supabaseUrl: string; supabaseAnonKey: string }` and fail with actionable variable names when configuration is missing.

- [ ] **Step 5: Verify the foundation.**

Run: `npm run lint && npm test -- --run && npm run build && npx playwright test e2e/public-home.spec.ts`

Expected: all commands succeed.

- [ ] **Step 6: Commit.**

```bash
git add package.json package-lock.json next.config.ts src public vitest.config.ts playwright.config.ts e2e .env.example .gitignore
git commit -m "feat: scaffold Yogapedia web app"
```

### Task 2: Database Schema, Seed Data, and RLS

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/202609300001_core_schema.sql`
- Create: `supabase/migrations/202609300002_rls_policies.sql`
- Create: `supabase/seed.sql`
- Create: `supabase/tests/rls_test.sql`
- Create: `src/types/database.ts`
- Create: `src/lib/domain.ts`
- Create: `src/lib/domain.test.ts`

**Interfaces:**
- Consumes: environment contract from Task 1.
- Produces: `UserRole`, `ProgramStatus`, `EnrollmentStatus`, and generated `Database` types; all domain tables and RLS policies from the spec.

- [ ] **Step 1: Write failing domain and SQL policy tests.**

Assert valid role/status parsing, immutable started ClassBox versions, participant self-access, instructor assigned-program access, organization isolation, admin access, and public projection restrictions.

- [ ] **Step 2: Run tests and confirm failure.**

Run: `npm test -- --run src/lib/domain.test.ts && npx supabase test db`

Expected: FAIL because types, migrations, and policies do not exist.

- [ ] **Step 3: Implement the schema and constraints.**

Create every table named in the spec, UUID primary keys, timestamps, foreign keys, lifecycle checks, and uniqueness constraints for enrollment per program/person, attendance per session/enrollment, assessment per enrollment/type, and daily practice log per enrollment/date.

- [ ] **Step 4: Implement RLS and restricted public views.**

Policies must derive access from `auth.uid()`, organization membership, program assignment, or explicit administrator role. Public queries may access only published program fields through `public_programs`.

- [ ] **Step 5: Seed the first ClassBox.**

Seed an unpublished `Busan 4060 Movement Recovery ClassBox` and version `1.0.0` with a four-week, eight-session structure; do not seed real personal data.

- [ ] **Step 6: Verify schema and regenerate TypeScript database types.**

Run: `npx supabase db reset && npx supabase test db && npm test -- --run src/lib/domain.test.ts && npm run typecheck`

Expected: all tests pass and generated types compile.

- [ ] **Step 7: Commit.**

```bash
git add supabase src/types/database.ts src/lib/domain.ts src/lib/domain.test.ts
git commit -m "feat: add ClassBox schema and row security"
```

### Task 3: Authentication and Role-Gated Navigation

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/auth/roles.ts`
- Create: `src/lib/auth/roles.test.ts`
- Create: `src/app/login/page.tsx`
- Create: `src/app/auth/callback/route.ts`
- Create: `src/app/auth/callback/route.test.ts`
- Create: `src/app/(portal)/layout.tsx`
- Create: `src/components/account-menu.tsx`
- Create: `src/proxy.ts`

**Interfaces:**
- Consumes: `UserRole` and profile records from Task 2.
- Produces: `requireUser()`, `requireRole(allowed: UserRole[])`, magic-link login, and redirect-safe callback handling.

- [ ] **Step 1: Write failing role and callback tests.**

Test authenticated role routing, unauthorized responses, preserved safe relative `next` paths, rejection of external redirect URLs, and recoverable errors for missing or invalid auth codes.

- [ ] **Step 2: Run focused tests and confirm failure.**

Run: `npm test -- --run src/lib/auth/roles.test.ts src/app/auth/callback/route.test.ts`

Expected: FAIL because the auth modules do not exist.

- [ ] **Step 3: Implement browser/server Supabase clients and role helpers.**

Use publishable public credentials and signed-in cookies only. Do not introduce a service role key.

- [ ] **Step 4: Implement magic-link login, callback, logout, and portal guard.**

The callback accepts only same-origin relative destinations and returns the user to `/login` with a readable recovery state when exchange fails.

- [ ] **Step 5: Verify auth behavior.**

Run: `npm test -- --run src/lib/auth src/app/auth && npm run build`

Expected: all tests and build pass.

- [ ] **Step 6: Commit.**

```bash
git add src/lib/supabase src/lib/auth src/app/login src/app/auth src/app/'(portal)' src/components/account-menu.tsx src/proxy.ts
git commit -m "feat: add magic-link authentication and role guards"
```

### Task 4: Public Program Discovery and Idempotent Application

**Files:**
- Create: `src/features/programs/queries.ts`
- Create: `src/features/programs/actions.ts`
- Create: `src/features/programs/application-schema.ts`
- Create: `src/features/programs/application-schema.test.ts`
- Create: `src/app/programs/[slug]/page.tsx`
- Create: `src/app/programs/[slug]/apply/page.tsx`
- Create: `src/app/programs/[slug]/apply/application-form.tsx`
- Create: `e2e/program-application.spec.ts`

**Interfaces:**
- Consumes: `public_programs`, enrollments, auth callback, and environment clients.
- Produces: `getPublishedProgram(slug)`, authenticated `submitApplication(input)`, and pending enrollment records owned by `auth.uid()`.

- [ ] **Step 1: Write failing validation and application tests.**

Cover missing consent, unauthenticated submission, unpublished programs, closed capacity, repeated submission, and successful authenticated application with one pending enrollment.

- [ ] **Step 2: Run tests and confirm failure.**

Run: `npm test -- --run src/features/programs/application-schema.test.ts`

Expected: FAIL because the application contract is absent.

- [ ] **Step 3: Implement public program queries and application validation.**

`submitApplication` accepts `{ programId, displayName, serviceConsentVersion }` for the signed-in user and returns `{ enrollmentId, status: 'pending' }`; duplicate submissions return the existing pending enrollment.

- [ ] **Step 4: Implement mobile program and application pages.**

Show purpose, schedule, location, capacity state, participation conditions, privacy link, and one clear action that requests an email magic link before opening the authenticated application form.

- [ ] **Step 5: Verify the journey.**

Run: `npm test -- --run src/features/programs && npx playwright test e2e/program-application.spec.ts`

Expected: validation and end-to-end application tests pass.

- [ ] **Step 6: Commit.**

```bash
git add src/features/programs src/app/programs e2e/program-application.spec.ts
git commit -m "feat: add public program application flow"
```

### Task 5: Participant Consent, Assessment, and Home Practice

**Files:**
- Create: `src/features/participant/assessment-schema.ts`
- Create: `src/features/participant/assessment-schema.test.ts`
- Create: `src/features/participant/actions.ts`
- Create: `src/features/participant/queries.ts`
- Create: `src/app/(portal)/participant/page.tsx`
- Create: `src/app/(portal)/participant/assessment/[kind]/page.tsx`
- Create: `src/app/(portal)/participant/practice/page.tsx`
- Create: `src/components/participant/check-in-form.tsx`
- Create: `e2e/participant-journey.spec.ts`

**Interfaces:**
- Consumes: authenticated participant, enrollments, consents, assessments, sessions, and practice logs.
- Produces: `submitAssessment`, `recordPractice`, `getParticipantHome`, and participant progress summaries.

- [ ] **Step 1: Write failing assessment and idempotency tests.**

Test required consent version, bounded discomfort/function scales, red-flag routing, repeated assessment submission, repeated same-day practice logging, and access to another participant's enrollment.

- [ ] **Step 2: Run tests and confirm failure.**

Run: `npm test -- --run src/features/participant/assessment-schema.test.ts`

Expected: FAIL because schemas and actions are absent.

- [ ] **Step 3: Implement participant queries and actions.**

Red-flag answers return a fixed professional-care notice and `requiresReview: true`; they do not produce a diagnosis or generated movement advice.

- [ ] **Step 4: Implement participant home, assessment, and practice screens.**

Preserve incomplete form state locally and allow a failed request to retry without duplicate database rows.

- [ ] **Step 5: Verify participant behavior.**

Run: `npm test -- --run src/features/participant && npx playwright test e2e/participant-journey.spec.ts`

Expected: all participant tests pass.

- [ ] **Step 6: Commit.**

```bash
git add src/features/participant src/app/'(portal)'/participant src/components/participant e2e/participant-journey.spec.ts
git commit -m "feat: add participant assessment and practice flow"
```

### Task 6: Instructor Session Operations

**Files:**
- Create: `src/features/instructor/queries.ts`
- Create: `src/features/instructor/actions.ts`
- Create: `src/features/instructor/attendance-schema.ts`
- Create: `src/features/instructor/attendance-schema.test.ts`
- Create: `src/app/(portal)/instructor/page.tsx`
- Create: `src/app/(portal)/instructor/programs/[programId]/sessions/[sessionId]/page.tsx`
- Create: `src/components/instructor/attendance-list.tsx`
- Create: `e2e/instructor-session.spec.ts`

**Interfaces:**
- Consumes: assigned programs, sessions, enrollments, participant review flags, and RLS from Tasks 2 and 5.
- Produces: `getInstructorSession`, `saveAttendance`, and `saveSessionNote`.

- [ ] **Step 1: Write failing assignment, attendance, and duplicate-save tests.**

Test unassigned instructor denial, minimum necessary participant fields, attendance upsert behavior, allowed note length, and rejection of unsupported participant IDs.

- [ ] **Step 2: Run tests and confirm failure.**

Run: `npm test -- --run src/features/instructor/attendance-schema.test.ts`

Expected: FAIL because instructor operations are absent.

- [ ] **Step 3: Implement instructor queries and actions.**

Return only participant display name, attendance status, approved precautions, and review flag; exclude contact data and unrelated assessment responses.

- [ ] **Step 4: Implement today's session and attendance interface.**

Use stable list rows, explicit attendance states, a concise note field, and retryable save feedback.

- [ ] **Step 5: Verify session operations.**

Run: `npm test -- --run src/features/instructor && npx playwright test e2e/instructor-session.spec.ts`

Expected: all instructor tests pass.

- [ ] **Step 6: Commit.**

```bash
git add src/features/instructor src/app/'(portal)'/instructor src/components/instructor e2e/instructor-session.spec.ts
git commit -m "feat: add instructor session operations"
```

### Task 7: Organization Outcomes and Resilient Reports

**Files:**
- Create: `src/features/outcomes/metrics.ts`
- Create: `src/features/outcomes/metrics.test.ts`
- Create: `src/features/reports/report-data.ts`
- Create: `src/features/reports/report-data.test.ts`
- Create: `src/features/reports/generator.ts`
- Create: `src/features/reports/generator.test.ts`
- Create: `src/app/(portal)/organization/page.tsx`
- Create: `src/app/(portal)/organization/programs/[programId]/page.tsx`
- Create: `src/app/(portal)/organization/programs/[programId]/report/page.tsx`
- Create: `src/components/organization/outcome-summary.tsx`
- Create: `e2e/organization-outcomes.spec.ts`

**Interfaces:**
- Consumes: organization-scoped program data, attendance, assessments, and practice logs.
- Produces: `calculateProgramMetrics(input)`, `buildAggregateReportData(programId)`, and `generateReportDraft(data)` with deterministic fallback.

- [ ] **Step 1: Write failing metric, privacy, and provider-failure tests.**

Test zero enrollment, incomplete pre/post pairs, completion rate, attendance rate, five-person segmentation threshold, absence of personal/free-text fields in report-provider input, and deterministic fallback when the provider throws.

- [ ] **Step 2: Run tests and confirm failure.**

Run: `npm test -- --run src/features/outcomes src/features/reports`

Expected: FAIL because outcome and report modules are absent.

- [ ] **Step 3: Implement pure aggregate calculations.**

`calculateProgramMetrics` returns counts, rates, paired pre/post changes, and suppressed segments represented as `{ suppressed: true, reason: 'group_too_small' }`.

- [ ] **Step 4: Implement report data and provider boundary.**

The provider receives aggregate numeric metrics and approved program metadata only. `generateReportDraft` falls back to deterministic Korean copy while preserving the stored metrics.

- [ ] **Step 5: Implement organization dashboard and report page.**

Keep participant-level operations separate from aggregated outcomes and label all results as wellness program observations rather than medical effects.

- [ ] **Step 6: Verify outcomes and reporting.**

Run: `npm test -- --run src/features/outcomes src/features/reports && npx playwright test e2e/organization-outcomes.spec.ts`

Expected: all outcome, privacy, fallback, and UI tests pass.

- [ ] **Step 7: Commit.**

```bash
git add src/features/outcomes src/features/reports src/app/'(portal)'/organization src/components/organization e2e/organization-outcomes.spec.ts
git commit -m "feat: add organization outcomes and reports"
```

### Task 8: Pilot Readiness, GitHub, and Vercel Deployment

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `src/app/api/health/route.ts`
- Create: `src/app/api/health/route.test.ts`
- Create: `docs/operations/pilot-readiness.md`
- Create: `docs/operations/deployment.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: complete application and environment contract.
- Produces: CI checks, `/api/health`, deployment instructions, and a pilot rehearsal checklist.

- [ ] **Step 1: Write the failing health-route test.**

Assert a healthy configured app returns `{ status: 'ok' }` without exposing URLs, keys, database details, or provider credentials; missing configuration returns a generic unavailable response.

- [ ] **Step 2: Run the test and confirm failure.**

Run: `npm test -- --run src/app/api/health/route.test.ts`

Expected: FAIL because the route does not exist.

- [ ] **Step 3: Implement health check, CI, and operations documentation.**

CI runs lint, typecheck, unit tests, build, and Playwright smoke tests. Deployment documentation covers separate Supabase development/production projects, GitHub remote setup, Vercel import, environment variables, migration order, rollback, backup, and RLS verification.

- [ ] **Step 4: Run full local verification.**

Run: `npm run lint && npm run typecheck && npm test -- --run && npm run build && npx playwright test && npx supabase test db && git diff --check`

Expected: every command succeeds.

- [ ] **Step 5: Rehearse the pilot workflow.**

Use separate participant, instructor, and organization test accounts to complete application, consent, assessment, attendance, practice, post-assessment, and report generation. Record pass/fail evidence in `docs/operations/pilot-readiness.md` without real personal information.

- [ ] **Step 6: Push GitHub and configure Vercel only after local verification.**

Import the GitHub repository into Vercel, configure development/preview/production environment variables with the matching Supabase project, deploy `main`, and verify `/api/health` plus the public application flow.

- [ ] **Step 7: Commit.**

```bash
git add .github src/app/api/health docs/operations README.md
git commit -m "chore: prepare ClassBox MVP for pilot deployment"
```

## Final Verification

- [ ] Run the complete verification command from Task 8 on a clean checkout.
- [ ] Confirm no secret or `.env` value is tracked by Git.
- [ ] Confirm every application table has RLS enabled and a deliberate policy set.
- [ ] Confirm participant, instructor, organization, and administrator accounts cannot cross role or organization boundaries.
- [ ] Confirm small-group suppression and aggregate-only report-provider payloads.
- [ ] Confirm the Vercel production deployment uses the production Supabase project and `main` branch.
- [ ] Complete a whole-branch code review before enrolling live participants.

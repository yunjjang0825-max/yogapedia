# Yogapedia ClassBox Design

## 1. Purpose

Yogapedia is a Busan-based wellness operations platform that standardizes recovery-yoga programs as reusable ClassBoxes. The first product must help a local organization recruit participants, run a four-week program, measure change, and decide whether to operate the program again.

The first validated product is the **Busan 4060 Movement Recovery ClassBox**. It serves adults aged 40 to 69 who experience ordinary discomfort in areas such as the back, shoulders, or knees. The product supports wellness and continued exercise participation; it does not diagnose or treat medical conditions.

## 2. Product Thesis

Yogapedia's initial advantage is not a large video library or a general-purpose AI coach. Its defensible assets are:

1. Repeatable ClassBox programs.
2. Consistent operational data from real classes.
3. Evidence that organizations can understand and use when deciding to renew or expand a program.

Busan is the first market, test bed, and brand origin. The software and ClassBox model must remain portable to other regions.

## 3. Success Criteria

The MVP succeeds when one Busan partner organization can operate a four-week program for 15 to 20 participants without using separate spreadsheets for core workflow data.

The product must measure:

- Application-to-participation conversion.
- Attendance rate.
- Four-week completion rate.
- Home-practice completion rate.
- Change in self-reported discomfort and daily function.
- Satisfaction and intent to participate again.
- Whether the organization chooses to run the ClassBox again.

The strongest business validation is successful reuse by a second organization or renewal by the first organization.

## 4. Product Scope

### 4.1 MVP

- Public ClassBox and program pages.
- Mobile application flow through a link or QR code.
- Consent collection and pre-program assessment.
- Role-based authentication.
- Program and session management.
- Instructor attendance and session-note workflow.
- Participant check-in and home-practice log.
- Post-program assessment.
- Participant change summary.
- Organization outcome dashboard.
- Draft organization report generation.

### 4.2 Excluded From MVP

- Native iOS or Android applications.
- Real-time camera pose analysis.
- Medical diagnosis or treatment recommendations.
- Payment and subscription billing.
- Public instructor marketplace.
- General-purpose AI chat.
- Large-scale video hosting.
- Integration with hospitals or electronic medical records.

## 5. User Roles

### Participant

A participant discovers a local program, applies, completes consent and a pre-assessment, attends sessions, records brief check-ins and home practice, then receives a personal change summary and a rule-based next-program suggestion.

Participants may only access their own profile, consent, assessments, attendance summary, practice logs, and recommendations.

### Instructor

An instructor accesses assigned programs, views participation notes required for safe class operation, records attendance and session observations, and reviews the standard ClassBox lesson guide.

Instructors may only access participants enrolled in programs assigned to them. Sensitive fields not required for class delivery are hidden.

### Organization Manager

An organization manager creates program runs from an approved ClassBox, monitors recruitment and completion, views aggregated outcomes, and generates a result report.

Managers may access data for their organization. Participant-level information is limited to operationally necessary fields; reports use aggregated or pseudonymized data by default.

### Yogapedia Administrator

An administrator manages ClassBox templates and versions, organizations, role assignments, safety rules, measurement definitions, and system-wide operations.

## 6. Core Domain Model

The system separates a reusable ClassBox definition from a specific program run.

- `profiles`: account identity and basic profile.
- `organizations`: partner organizations and locations.
- `organization_members`: organization roles and membership.
- `class_boxes`: reusable program definition and current lifecycle state.
- `class_box_versions`: immutable curriculum, measurement, and safety versions.
- `programs`: a scheduled run at one organization using one ClassBox version.
- `sessions`: individual class dates and lesson references.
- `enrollments`: participant application and program status.
- `consents`: versioned consent records.
- `assessments`: pre-, periodic-, and post-program responses.
- `attendance`: session attendance.
- `session_notes`: instructor operational notes.
- `practice_logs`: participant home-practice records.
- `recommendations`: rule or AI-assisted next actions with provenance.
- `reports`: generated participant and organization report records.
- `audit_events`: security-sensitive and administrative actions.

ClassBox versions become immutable after a program begins. Improvements produce a new version so outcomes remain attributable to the exact program that was delivered.

## 7. Primary Workflows

### Participant Journey

1. Open a program page from a QR code or link.
2. Review purpose, dates, location, participation conditions, and privacy notice.
3. Enter an email address and continue through a magic link.
4. Submit the application, consent, and pre-assessment as the authenticated participant.
5. Receive enrollment status and schedule.
6. Complete brief session check-ins and optional home-practice logs.
7. Complete the post-assessment.
8. View a non-medical change summary and a rule-based next ClassBox suggestion.

### Instructor Journey

1. Open today's assigned program.
2. Review participant list and relevant precautions.
3. Follow the session guide and available movement alternatives.
4. Record attendance and concise operational notes.
5. Flag issues for an administrator without making a diagnosis.

### Organization Journey

1. Create a program from an approved ClassBox version.
2. Publish the application link and QR code.
3. Monitor applications and enrollment capacity.
4. Monitor attendance and completion during delivery.
5. Review aggregated pre/post outcomes.
6. Generate a report and decide whether to renew or expand.

## 8. AI Boundaries

AI supports operations but does not make medical or safety-critical decisions.

### MVP AI Functions

- Convert structured participant inputs into a concise, neutral summary.
- Suggest non-clinical engagement actions based on attendance and practice history.
- Draft organization reports from approved aggregate metrics.

The MVP does not send participant names, contact details, free-text notes, or individual health responses to an AI provider. Report drafting receives approved aggregate metrics only.

### Later AI Functions

- Recommend a next ClassBox from validated program rules.
- Compare outcomes across ClassBox versions.
- Identify operational patterns that require human review.
- Analyze pose only after a separately approved safety and privacy design.

### Prohibited AI Behavior

- Diagnosing a condition.
- Claiming treatment efficacy.
- Overriding expert-defined participation restrictions.
- Generating a movement prescription outside an approved ClassBox.
- Exposing another participant's data.

Every AI output stores its source data category, prompt or policy version, model identifier, generation timestamp, and reviewer state where applicable.

## 9. Safety and Privacy

- Collect only information required to operate and evaluate the program.
- Separate consent for service operation, outcome analysis, and public testimonials.
- Do not store posture video in the MVP.
- Use expert-authored deterministic rules for red-flag responses.
- Route a red-flag response to a human review or professional-care notice.
- Avoid medical claims in participant and organization reports.
- Use aggregated data in organization dashboards wherever individual identity is unnecessary.
- Do not display segmented outcome statistics for groups with fewer than five participants.
- Define retention and deletion rules before the first live pilot.

## 10. Technical Architecture

### Application

- Next.js with TypeScript.
- Mobile-first responsive PWA.
- One application with route and permission boundaries for public, participant, instructor, organization, and administrator experiences.
- Server-side operations for privileged data access and AI calls.

### Data Platform

- Supabase PostgreSQL as the primary database.
- Supabase Auth for identity.
- Supabase Storage only when a concrete MVP file requirement appears.
- Row Level Security enabled for all application tables.
- SQL migrations stored in Git and reviewed with application code.

### Source and Deployment

- GitHub stores source, migrations, and documentation.
- Vercel creates preview deployments for branches and production deployments from the protected `main` branch.
- Development and production use separate Supabase projects.
- Secrets are stored in local environment files and Vercel environment settings, never in Git.

### Initial Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Server-only AI credentials when AI reporting is enabled.

The MVP does not use a Supabase service role key. Server operations act with the signed-in user's session and remain subject to Row Level Security.

## 11. Authorization Model

Supabase Row Level Security is the primary database boundary.

- Participants can read and update their permitted records only.
- Instructors can read operational records for assigned programs only.
- Organization managers can access programs owned by their organization.
- Aggregated reporting uses server-side functions or views that do not leak unrelated participant data.
- Administrator privileges are explicitly assigned and audited.
- Public program queries expose a restricted public projection, not the underlying operational tables.

`Automatically expose new tables` should remain disabled. RLS must be enabled when each migration creates a table, even if the Supabase project also enables automatic RLS.

## 12. Error Handling

- Application and assessment submissions are idempotent where repeated network requests are likely.
- Unsaved form state is preserved locally during brief connection loss.
- Users receive a clear retry state without seeing database or AI-provider details.
- AI failures do not block attendance, assessment, or report-data collection.
- Report generation can be retried from stored, versioned metrics.
- Privileged failures and repeated authorization denials create audit events.

## 13. Verification Strategy

- Unit tests for scoring, aggregation, recommendation rules, and role helpers.
- Integration tests for Supabase policies and critical database functions.
- End-to-end tests for application, consent, attendance, assessment, and reporting journeys.
- Accessibility checks for mobile forms and dashboards.
- Manual pilot rehearsal using participant, instructor, and organization accounts.
- Production readiness review covering RLS, environment separation, backup, retention, and error monitoring.

## 14. Delivery Sequence

1. Establish the Next.js, Supabase, GitHub, and Vercel foundation.
2. Implement authentication, organizations, roles, and RLS.
3. Implement ClassBox versioning and program setup.
4. Implement participant application, consent, and assessment.
5. Implement instructor attendance and session notes.
6. Implement participant practice logs and post-assessment.
7. Implement aggregated organization outcomes and reports.
8. Rehearse the full workflow before enrolling live participants.
9. Run one Busan pilot and use evidence to prioritize the next version.

## 15. Decisions Deferred Until Pilot Evidence

- Payment model and pricing interface.
- Native mobile applications.
- Tourism-specific product packaging.
- Instructor certification and marketplace.
- Camera pose analysis.
- Multi-region deployment.
- Advanced AI recommendations.

These features are not prerequisites for testing whether a ClassBox creates participant value and organization renewal.

# Busan Pilot Readiness

## Product

- [ ] Publish the approved ClassBox version and pilot program.
- [ ] Confirm venue, eight session dates, capacity, and application period.
- [ ] Review participant copy for non-medical language.
- [ ] Confirm service, outcome-analysis, and testimonial consent versions.

## Rehearsal

- [ ] Participant: magic link, application, consent, pre-assessment.
- [ ] Organization: accept enrollment and verify capacity.
- [ ] Instructor: assigned session, attendance, review flag, session note.
- [ ] Participant: practice, periodic check-in, post-assessment, summary.
- [ ] Organization: aggregate dashboard, suppression, report fallback.
- [ ] Wrong-role and second-organization accounts: access denied.

Do not record real names, emails, health responses, or free-text notes.

| Date | Scenario | Result | Evidence / issue |
| --- | --- | --- | --- |
| Pending | Full dry run | Not run | Requires connected Supabase test project |

## Go-Live Gate

- [ ] Supabase pgTAP policy tests pass against the linked project.
- [ ] GitHub CI and Vercel production build pass.
- [ ] `/api/health` returns `{"status":"ok"}`.
- [ ] Database backup, incident owner, retention, and deletion periods are confirmed.

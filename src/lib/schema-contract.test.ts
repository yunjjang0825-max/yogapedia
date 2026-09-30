import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const schema = readFileSync(
  join(root, "supabase/migrations/202609300001_core_schema.sql"),
  "utf8",
);
const policies = readFileSync(
  join(root, "supabase/migrations/202609300002_rls_policies.sql"),
  "utf8",
);
const seed = readFileSync(join(root, "supabase/seed.sql"), "utf8");

const tables = [
  "profiles",
  "organizations",
  "organization_members",
  "class_boxes",
  "class_box_versions",
  "programs",
  "program_instructors",
  "sessions",
  "enrollments",
  "consents",
  "assessments",
  "attendance",
  "session_notes",
  "practice_logs",
  "recommendations",
  "reports",
  "audit_events",
];

describe("Supabase schema contract", () => {
  it.each(tables)("creates and protects %s", (table) => {
    expect(schema).toContain(`create table public.${table}`);
    expect(policies).toContain(
      `alter table public.${table} enable row level security`,
    );
  });

  it("exposes published programs through a restricted view", () => {
    expect(policies).toContain(
      "create view public.public_programs with (security_invoker = true)",
    );
    expect(policies).toContain("where p.status = 'published'");
  });

  it("seeds one draft ClassBox version with eight sessions", () => {
    expect(seed).toContain("'1.0.0'");
    expect(seed).toContain("'draft'");
    expect(seed.match(/\(\d, '[^']+'\)/g)).toHaveLength(8);
  });

  it("hardens roles, attendance, and atomic applications", () => {
    const hardening = readFileSync(join(root, "supabase/migrations/202609300003_security_hardening.sql"), "utf8");
    expect(hardening).toContain("profiles_protect_role");
    expect(hardening).toContain("attendance_same_program");
    expect(hardening).toContain("for update");
    expect(hardening).toContain("revoke select on public.programs");
  });
});

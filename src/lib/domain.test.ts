import { describe, expect, it } from "vitest";

import {
  canEditClassBoxVersion,
  parseEnrollmentStatus,
  parseProgramStatus,
  parseUserRole,
} from "./domain";

describe("domain values", () => {
  it.each(["participant", "instructor", "organization_manager", "admin"])(
    "accepts the %s user role",
    (role) => {
      expect(parseUserRole(role)).toBe(role);
    },
  );

  it("rejects an unknown user role", () => {
    expect(() => parseUserRole("owner")).toThrow("Unknown user role: owner");
  });

  it.each(["draft", "published", "in_progress", "completed", "cancelled"])(
    "accepts the %s program status",
    (status) => {
      expect(parseProgramStatus(status)).toBe(status);
    },
  );

  it.each(["pending", "accepted", "active", "completed", "withdrawn"])(
    "accepts the %s enrollment status",
    (status) => {
      expect(parseEnrollmentStatus(status)).toBe(status);
    },
  );

  it("allows editing only before a ClassBox version is used", () => {
    expect(canEditClassBoxVersion("draft")).toBe(true);
    expect(canEditClassBoxVersion("published")).toBe(true);
    expect(canEditClassBoxVersion("in_progress")).toBe(false);
    expect(canEditClassBoxVersion("completed")).toBe(false);
  });
});

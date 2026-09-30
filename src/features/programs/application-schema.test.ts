import { describe, expect, it } from "vitest";
import { applicationSchema } from "./application-schema";

const valid = {
  programId: "40000000-0000-4000-8000-000000000001",
  displayName: "부산 참가자",
  serviceConsentVersion: "2026-09",
  serviceConsent: true,
};

describe("program application", () => {
  it("accepts a complete application", () => {
    expect(applicationSchema.parse(valid)).toEqual(valid);
  });

  it("requires service consent", () => {
    expect(() => applicationSchema.parse({ ...valid, serviceConsent: false })).toThrow();
  });

  it("requires a valid program id and display name", () => {
    expect(() => applicationSchema.parse({ ...valid, programId: "x", displayName: "" })).toThrow();
  });
});

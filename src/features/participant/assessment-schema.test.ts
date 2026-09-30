import { describe, expect, it } from "vitest";
import { assessmentSchema, evaluateSafety } from "./assessment-schema";

const valid = { enrollmentId: "40000000-0000-4000-8000-000000000001", kind: "pre", discomfort: 4, dailyFunction: 6, confidence: 5, redFlag: false, consentVersion: "2026-09" };

describe("participant assessment", () => {
  it("accepts bounded wellness scores", () => expect(assessmentSchema.parse(valid)).toEqual(valid));
  it("rejects out-of-range scores", () => expect(() => assessmentSchema.parse({ ...valid, discomfort: 11 })).toThrow());
  it("requires a consent version", () => expect(() => assessmentSchema.parse({ ...valid, consentVersion: "" })).toThrow());
  it("routes red flags to a fixed human-review notice", () => expect(evaluateSafety(true)).toEqual({ requiresReview: true, notice: "운동을 중단하고 담당자 또는 의료 전문가와 상의해 주세요." }));
});

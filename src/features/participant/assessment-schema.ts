import { z } from "zod";
export const assessmentSchema = z.object({ enrollmentId: z.uuid(), kind: z.enum(["pre", "periodic", "post"]), discomfort: z.number().int().min(0).max(10), dailyFunction: z.number().int().min(0).max(10), confidence: z.number().int().min(0).max(10), redFlag: z.boolean(), consentVersion: z.string().min(1) });
export function evaluateSafety(redFlag: boolean) { return redFlag ? { requiresReview: true, notice: "운동을 중단하고 담당자 또는 의료 전문가와 상의해 주세요." } : { requiresReview: false, notice: null }; }

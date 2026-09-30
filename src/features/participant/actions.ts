"use server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { assessmentSchema, evaluateSafety } from "./assessment-schema";

export async function submitAssessment(input: unknown) {
  const value = assessmentSchema.parse(input); await requireRole(["participant"]); const db = await createClient();
  const safety = evaluateSafety(value.redFlag);
  const { error } = await db.from("assessments").upsert({ enrollment_id: value.enrollmentId, assessment_type: value.kind, responses: { discomfort: value.discomfort, dailyFunction: value.dailyFunction, confidence: value.confidence, redFlag: value.redFlag }, score: value.dailyFunction }, { onConflict: "enrollment_id,assessment_type" });
  if (error) throw new Error("평가를 저장하지 못했습니다."); return safety;
}
export async function recordPractice(input: unknown) {
  const value = z.object({ enrollmentId: z.uuid(), practicedOn: z.iso.date(), minutes: z.number().int().min(0).max(360) }).parse(input); await requireRole(["participant"]); const db = await createClient();
  const { error } = await db.from("practice_logs").upsert({ enrollment_id: value.enrollmentId, practiced_on: value.practicedOn, minutes: value.minutes, completed: value.minutes > 0 }, { onConflict: "enrollment_id,practiced_on" });
  if (error) throw new Error("연습 기록을 저장하지 못했습니다."); return { saved: true };
}

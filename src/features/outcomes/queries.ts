import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { calculateProgramMetrics } from "./metrics";

export async function getProgramOutcomes(programId: string) {
  await requireRole(["organization_manager", "admin"]);
  const db = await createClient();
  const { data: program } = await db.from("programs").select("id,title").eq("id", programId).single();
  if (!program) return null;
  const { data: enrollments } = await db.from("enrollments").select("id,status").eq("program_id", programId);
  const ids = (enrollments ?? []).map((item) => item.id);
  const { data: attendance } = ids.length ? await db.from("attendance").select("attended").in("enrollment_id", ids) : { data: [] };
  const { data: assessments } = ids.length ? await db.from("assessments").select("enrollment_id,assessment_type,score").in("enrollment_id", ids).in("assessment_type", ["pre", "post"]) : { data: [] };
  const metrics = calculateProgramMetrics({
    enrollments: (enrollments ?? []).map((item) => ({ id: item.id, completed: item.status === "completed" })),
    attendance: (attendance ?? []).map((item) => item.attended),
    assessments: (assessments ?? []).flatMap((item) => item.score === null || item.assessment_type === "periodic" ? [] : [{ enrollmentId: item.enrollment_id, kind: item.assessment_type, score: item.score }]),
  });
  return { program, metrics };
}

import { getProgramOutcomes } from "@/features/outcomes/queries";
import { createClient } from "@/lib/supabase/server";
import { generateReportDraft } from "./generator";
import { buildAggregateReportData } from "./report-data";

export async function getOrCreateOrganizationReport(programId: string) {
  const db = await createClient();
  const { data: stored } = await db.from("reports").select("draft_text,metrics,generation_metadata").eq("program_id", programId).eq("report_type", "organization").maybeSingle();
  if (stored?.draft_text) return { text: stored.draft_text, stored: true };

  const result = await getProgramOutcomes(programId);
  if (!result) return null;
  const data = buildAggregateReportData(result.program.title, result.metrics);
  const report = await generateReportDraft(data);
  const { error } = await db.from("reports").insert({
    program_id: programId,
    enrollment_id: null,
    report_type: "organization",
    metrics: data.metrics,
    draft_text: report.text,
    generation_metadata: { source: report.source, generatedAt: new Date().toISOString() },
  });
  if (error?.code === "23505") {
    const { data: concurrent } = await db.from("reports").select("draft_text").eq("program_id", programId).eq("report_type", "organization").single();
    if (concurrent?.draft_text) return { text: concurrent.draft_text, stored: true };
  }
  if (error) throw new Error("보고서를 저장하지 못했습니다.");
  return { text: report.text, stored: false };
}

"use server";

import { requireUser } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { applicationSchema } from "./application-schema";

export async function submitApplication(input: unknown) {
  const parsed = applicationSchema.parse(input);
  const user = await requireUser();
  const supabase = await createClient();

  const { data: program } = await supabase
    .from("public_programs")
    .select("id")
    .eq("id", parsed.programId)
    .single();
  if (!program) throw new Error("신청 가능한 프로그램이 아닙니다.");

  const { error: profileError } = await supabase.from("profiles").upsert(
    { id: user.id, display_name: parsed.displayName, role: "participant" },
    { onConflict: "id", ignoreDuplicates: true },
  );
  if (profileError) throw new Error("참가자 정보를 저장하지 못했습니다.");
  const { data: rows, error } = await supabase.rpc("apply_to_program", { target_program_id: parsed.programId });
  const enrollment = rows?.[0];
  if (error || !enrollment) throw new Error("신청 기간, 정원 또는 참여 상태를 확인해 주세요.");

  const { error: consentError } = await supabase.from("consents").upsert({
    enrollment_id: enrollment.enrollment_id,
    consent_type: "service",
    document_version: parsed.serviceConsentVersion,
    accepted: true,
  }, { onConflict: "enrollment_id,consent_type,document_version" });
  if (consentError) throw new Error("동의 기록을 저장하지 못했습니다.");
  return { enrollmentId: enrollment.enrollment_id, status: enrollment.enrollment_status };
}

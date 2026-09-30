import { requireRole } from "@/lib/auth/roles"; import { createClient } from "@/lib/supabase/server";
export async function getParticipantHome() { const { user } = await requireRole(["participant"]); const db = await createClient(); const { data } = await db.from("enrollments").select("id,status,program_id").eq("participant_id", user.id); return data ?? []; }

import { redirect } from "next/navigation";

import { getPortalPath, requireUser } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export default async function PortalPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  redirect(data ? getPortalPath(data.role) : "/login?error=profile_required");
}

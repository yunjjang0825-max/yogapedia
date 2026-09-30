import { redirect } from "next/navigation";
import { headers } from "next/headers";

import type { UserRole } from "@/lib/domain";
import { createClient } from "@/lib/supabase/server";

const portalPaths: Record<UserRole, string> = {
  participant: "/participant",
  instructor: "/instructor",
  organization_manager: "/organization",
  admin: "/admin",
};

export function getPortalPath(role: UserRole): string {
  return portalPaths[role];
}

export function isRoleAllowed(role: UserRole, allowed: UserRole[]): boolean {
  return allowed.includes(role);
}

export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    const destination = (await headers()).get("x-yogapedia-path") ?? "/portal";
    redirect(`/login?error=session_required&next=${encodeURIComponent(destination)}`);
  }

  return data.user;
}

export async function requireRole(allowed: UserRole[]) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !isRoleAllowed(profile.role, allowed)) {
    redirect("/portal?error=role_required");
  }

  return { user, role: profile.role };
}

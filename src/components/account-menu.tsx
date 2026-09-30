"use client";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function AccountMenu() {
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return <button className="text-action" onClick={signOut}>로그아웃</button>;
}

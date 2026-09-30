import { createClient } from "@/lib/supabase/server";

export async function getPublishedProgram(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_programs")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

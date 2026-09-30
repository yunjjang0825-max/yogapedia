import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export function getSafeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/portal";
  }

  return value;
}

export async function resolveCallbackDestination(
  url: URL,
  exchange: (code: string) => Promise<{ error: unknown | null }>,
): Promise<string> {
  const code = url.searchParams.get("code");
  const next = getSafeNextPath(url.searchParams.get("next"));
  const recovery = (error: string) => `/login?error=${error}&next=${encodeURIComponent(next)}`;
  if (!code) return recovery("missing_code");

  const { error } = await exchange(code);
  if (error) return recovery("invalid_or_expired_link");

  return next;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const supabase = await createClient();
  const destination = await resolveCallbackDestination(url, (code) =>
    supabase.auth.exchangeCodeForSession(code),
  );
  return NextResponse.redirect(new URL(destination, url.origin));
}

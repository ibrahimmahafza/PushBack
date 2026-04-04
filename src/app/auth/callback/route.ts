import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Negative case: missing code param
  if (!code) {
    console.error("[auth/callback] No code parameter in callback URL");
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[auth/callback] Exchange failed:", error.message);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    console.log("[auth/callback] Session established, redirecting to dashboard");
    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (err) {
    console.error("[auth/callback] Unexpected error:", err);
    return NextResponse.redirect(`${origin}/login?error=session_error`);
  }
}

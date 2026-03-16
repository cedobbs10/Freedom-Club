import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase redirects here after:
 * - Email confirmation on signup
 * - Password reset link click
 *
 * It exchanges the one-time `code` for a session, then sends the user
 * to their intended destination (defaults to /dashboard).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // After email confirmation → onboarding. Password reset → reset-password page.
  const next = searchParams.get("next") ?? "/onboarding";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — send to login with a message
  return NextResponse.redirect(
    `${origin}/login?error=link_expired`
  );
}

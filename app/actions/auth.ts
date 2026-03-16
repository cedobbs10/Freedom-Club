"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AuthError = { message: string };

// ── Sign Up ───────────────────────────────────────────────────────────────────

export async function signUp(
  _prev: AuthError | null,
  formData: FormData
): Promise<AuthError | null> {
  const fullName    = formData.get("full_name") as string;
  const email       = formData.get("email") as string;
  const password    = formData.get("password") as string;
  // Prefer ref code from the form field, fall back to the cookie set by /join
  const cookieStore = await cookies();
  const cookieRef   = cookieStore.get("fc_ref")?.value?.trim().toUpperCase() || null;
  const refCode     = ((formData.get("referral_code") as string | null)?.trim().toUpperCase() || cookieRef) ?? null;
  const plan        = (formData.get("plan") as string) || "monthly";

  if (!fullName || !email || !password) {
    return { message: "Please fill in all required fields." };
  }
  if (password.length < 8) {
    return { message: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();

  // 1. Create the auth user — the DB trigger auto-creates their profile row
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
      return { message: "An account with this email already exists. Please sign in." };
    }
    return { message: authError.message };
  }

  if (!authData.user) {
    return { message: "Something went wrong. Please try again." };
  }

  const newUserId = authData.user.id;

  // 2. If a referral code was provided, link the relationship using the admin client
  //    (admin bypasses RLS so we can update the new user's row immediately)
  if (refCode) {
    const admin = createAdminClient();

    const { data: referrer } = await admin
      .from("profiles")
      .select("id")
      .eq("referral_code", refCode)
      .single();

    if (referrer) {
      // Link referred_by on the new profile
      await admin
        .from("profiles")
        .update({ referred_by: referrer.id })
        .eq("id", newUserId);

      // Create the referral record (status starts as pending — goes active when they pay)
      await admin.from("referrals").insert({
        referrer_id: referrer.id,
        referred_id: newUserId,
        status: "pending",
      });
    }
  }

  // 3. Store chosen plan in profile for the Stripe checkout step
  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({ subscription_tier: plan })
    .eq("id", newUserId);

  // Clear the referral cookie — it's been consumed
  cookieStore.set("fc_ref", "", { path: "/", maxAge: 0 });

  // Supabase sends a confirmation email.
  // After they confirm, the callback route sends them to /onboarding.
  redirect("/signup/confirm");
}

// ── Sign In ───────────────────────────────────────────────────────────────────

export async function signIn(
  _prev: AuthError | null,
  formData: FormData
): Promise<AuthError | null> {
  const email    = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next     = (formData.get("next") as string) || "/dashboard";

  if (!email || !password) {
    return { message: "Please enter your email and password." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { message: "Incorrect email or password. Please try again." };
    }
    if (error.message.includes("Email not confirmed")) {
      return { message: "Please check your email and click the confirmation link first." };
    }
    return { message: error.message };
  }

  redirect(next);
}

// ── Forgot Password ───────────────────────────────────────────────────────────

export async function forgotPassword(
  _prev: AuthError | null,
  formData: FormData
): Promise<AuthError | { success: true }> {
  const email = formData.get("email") as string;

  if (!email) {
    return { message: "Please enter your email address." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { message: error.message };
  }

  // Always return success — don't confirm whether the email exists (security best practice)
  return { success: true };
}

// ── Sign Out ──────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

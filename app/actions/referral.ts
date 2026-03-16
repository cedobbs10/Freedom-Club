"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface ReferralValidationResult {
  valid: boolean;
  referrerFirstName?: string; // First name only — never expose full name or id
}

/**
 * Validates a referral code and returns the referrer's first name.
 * Used on the /join and /signup pages to show "Jane invited you."
 *
 * Returns first name only — never the full name, email, or user id.
 * If the profile has no name on record, returns a generic fallback.
 */
export async function validateReferralCode(
  code: string
): Promise<ReferralValidationResult> {
  const normalized = code?.trim().toUpperCase();

  if (!normalized || normalized.length !== 8) {
    return { valid: false };
  }

  const admin = createAdminClient();

  const { data } = await admin
    .from("profiles")
    .select("full_name")
    .eq("referral_code", normalized)
    .maybeSingle();

  if (!data) {
    return { valid: false };
  }

  // Extract first name only
  const firstName = data.full_name?.trim().split(/\s+/)[0] ?? null;

  return {
    valid: true,
    // Fall back to "A friend" if the referrer has no name saved
    referrerFirstName: firstName || "A friend",
  };
}

/**
 * Returns the current user's referral stats:
 * - their referral code and link
 * - total referrals (all time)
 * - active referrals (currently paying members)
 * - total referral earnings
 */
export async function getReferralStats(): Promise<{
  referralCode: string | null;
  referralUrl: string | null;
  totalReferrals: number;
  activeReferrals: number;
  totalEarningsCents: number;
} | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();

  // Fetch profile + referral rows in parallel
  const [profileResult, referralsResult, earningsResult] = await Promise.all([
    admin
      .from("profiles")
      .select("referral_code")
      .eq("id", user.id)
      .single(),

    admin
      .from("referrals")
      .select("status")
      .eq("referrer_id", user.id),

    admin
      .from("earnings")
      .select("amount")
      .eq("user_id", user.id)
      .eq("type", "referral")
      .eq("status", "approved"),
  ]);

  const referralCode = profileResult.data?.referral_code ?? null;
  const referrals    = referralsResult.data ?? [];
  const earnings     = earningsResult.data ?? [];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://freedomclub.com";

  return {
    referralCode,
    referralUrl: referralCode ? `${appUrl}/join?ref=${referralCode}` : null,
    totalReferrals:  referrals.length,
    activeReferrals: referrals.filter((r) => r.status === "active").length,
    totalEarningsCents: Math.round(
      earnings.reduce((sum, e) => sum + Number(e.amount), 0) * 100
    ),
  };
}

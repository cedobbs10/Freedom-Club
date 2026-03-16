import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Unambiguous alphanumeric charset.
 * Excluded: 0 (looks like O), 1 (looks like I/L), I, L, O
 * Remaining: 31 characters → 31^8 = ~852 billion possible codes
 */
const CHARSET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/**
 * Generates a random 8-character referral code from the unambiguous charset.
 * Uses crypto.getRandomValues for cryptographic randomness.
 */
export function generateReferralCode(): string {
  const code = new Uint8Array(8);
  crypto.getRandomValues(code);
  return Array.from(code)
    .map((byte) => CHARSET[byte % CHARSET.length])
    .join("");
}

/**
 * Generates a referral code guaranteed to be unique in the profiles table.
 * Retries up to maxAttempts times before throwing (astronomically unlikely
 * to ever retry given 852 billion combinations, but safe to handle).
 */
export async function generateUniqueReferralCode(
  maxAttempts = 10
): Promise<string> {
  const admin = createAdminClient();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const code = generateReferralCode();

    const { data } = await admin
      .from("profiles")
      .select("referral_code")
      .eq("referral_code", code)
      .maybeSingle();

    if (!data) {
      // No existing profile with this code — it's unique
      return code;
    }
  }

  throw new Error(
    `Failed to generate a unique referral code after ${maxAttempts} attempts.`
  );
}

/**
 * Validates that a referral code exists in the profiles table.
 * Returns the referrer's profile id if valid, null if not found.
 */
export async function validateReferralCode(
  code: string
): Promise<{ referrerId: string } | null> {
  if (!code || code.length !== 8) return null;

  const admin = createAdminClient();

  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("referral_code", code.trim().toUpperCase())
    .maybeSingle();

  if (!data) return null;
  return { referrerId: data.id };
}

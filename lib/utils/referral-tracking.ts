/**
 * Referral tracking utilities.
 * Pure functions — no DB calls. All DB work lives in the server actions.
 */

export const REFERRAL_FEE_DOLLARS = 20;
export const ANNUAL_FEE_INTERVAL_DAYS = 365;

/**
 * Returns true if enough time has passed to credit another annual referral fee.
 *
 * Rule: the fee is $20/year. "A year" is defined as 365 days since the
 * last time a fee was paid for this referral (or since the referral was
 * first activated if it has never been paid).
 *
 * This is billing-interval-agnostic: it correctly handles both monthly and
 * annual Stripe subscribers without double-paying on monthly renewals.
 */
export function isEligibleForAnnualFee(
  referralActivatedAt: string,
  lastRewardPaidAt: string | null
): boolean {
  const baseline = lastRewardPaidAt ?? referralActivatedAt;
  const baselineDate = new Date(baseline);
  const now = new Date();
  const daysSince = (now.getTime() - baselineDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSince >= ANNUAL_FEE_INTERVAL_DAYS;
}

/**
 * Projects total annual referral earnings given the number of active referrals.
 */
export function projectAnnualEarnings(activeReferrals: number): number {
  return activeReferrals * REFERRAL_FEE_DOLLARS;
}

/**
 * Projects lifetime earnings: what the referrer has earned so far
 * plus what they'll earn this year from still-active referrals.
 */
export function projectLifetimeEarnings(
  paidToDateDollars: number,
  activeReferrals: number
): number {
  return paidToDateDollars + projectAnnualEarnings(activeReferrals);
}

/**
 * Returns months until the next annual fee for a given referral.
 * Useful for showing "next payout in X months" in the dashboard.
 */
export function monthsUntilNextFee(
  referralActivatedAt: string,
  lastRewardPaidAt: string | null
): number {
  const baseline = lastRewardPaidAt ?? referralActivatedAt;
  const nextPayoutDate = new Date(baseline);
  nextPayoutDate.setFullYear(nextPayoutDate.getFullYear() + 1);
  const now = new Date();
  const msRemaining = nextPayoutDate.getTime() - now.getTime();
  if (msRemaining <= 0) return 0;
  return Math.ceil(msRemaining / (1000 * 60 * 60 * 24 * 30));
}

/**
 * Anonymizes a full name to first name + last initial.
 * "Jane Smith"   → "Jane S."
 * "Jane"         → "Jane"       (single name — no change)
 * null / ""      → "Member"     (no name on record)
 */
export function anonymizeName(fullName: string | null): string {
  if (!fullName?.trim()) return "Member";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

/**
 * Returns a human-readable referral status label.
 */
export function referralStatusLabel(
  status: "pending" | "active" | "expired"
): { label: string; color: string } {
  switch (status) {
    case "pending":
      return { label: "Awaiting payment", color: "yellow" };
    case "active":
      return { label: "Active — earning",  color: "green"  };
    case "expired":
      return { label: "Subscription ended", color: "gray"  };
  }
}

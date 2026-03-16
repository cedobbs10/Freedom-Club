"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  anonymizeName,
  referralStatusLabel,
  monthsUntilNextFee,
  REFERRAL_FEE_DOLLARS,
} from "@/lib/utils/referral-tracking";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReferralRecord {
  id: string;
  referredName: string;           // anonymized: "Jane S."
  status: "pending" | "active" | "expired";
  statusLabel: string;
  statusColor: string;
  joinedAt: string;               // ISO string
  feeEarned: number;              // dollars paid so far for this referral
  nextPayoutMonths: number | null; // null if expired or pending
}

export interface ReferralStats {
  referralCode: string | null;
  referralUrl: string | null;
  totalReferrals: number;
  pendingReferrals: number;
  activeReferrals: number;
  expiredReferrals: number;
  totalEarnedDollars: number;    // all-time approved + paid
  pendingEarningsDollars: number; // earnings not yet paid out
  projectedAnnualDollars: number; // active referrals × $20
}

// ─── recordReferral ───────────────────────────────────────────────────────────

/**
 * Atomically records a referral relationship and credits the first $20 fee.
 *
 * Calls the `record_referral_atomic` Postgres function which handles
 * idempotency internally — safe to call multiple times with the same
 * (referrer_id, referred_id) pair.
 *
 * Returns 'created' | 'already_exists' | 'error'.
 */
export async function recordReferral(
  referrerId: string,
  referredId: string
): Promise<"created" | "already_exists" | "error"> {
  if (!referrerId || !referredId || referrerId === referredId) {
    return "error";
  }

  const admin = createAdminClient();

  const { data, error } = await admin.rpc("record_referral_atomic", {
    p_referrer_id: referrerId,
    p_referred_id: referredId,
    p_fee_amount:  REFERRAL_FEE_DOLLARS,
  });

  if (error) {
    console.error("[recordReferral]", error.message);
    return "error";
  }

  return (data as string) === "created" ? "created" : "already_exists";
}

// ─── getReferralStats ─────────────────────────────────────────────────────────

/**
 * Returns aggregated referral stats for the current user (or a given userId
 * when called from an admin context).
 */
export async function getReferralStats(
  userId?: string
): Promise<ReferralStats | null> {
  let resolvedUserId = userId;

  if (!resolvedUserId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    resolvedUserId = user.id;
  }

  const admin = createAdminClient();

  const [profileResult, referralsResult, earningsResult] = await Promise.all([
    admin
      .from("profiles")
      .select("referral_code")
      .eq("id", resolvedUserId)
      .single(),

    admin
      .from("referrals")
      .select("status, referral_fee_earned")
      .eq("referrer_id", resolvedUserId),

    admin
      .from("earnings")
      .select("amount, status")
      .eq("user_id", resolvedUserId)
      .eq("type", "referral"),
  ]);

  const referralCode = profileResult.data?.referral_code ?? null;
  const referrals    = referralsResult.data ?? [];
  const earnings     = earningsResult.data ?? [];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://freedomclub.com";

  const totalEarned = earnings
    .filter((e) => e.status === "approved" || e.status === "paid")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const pendingEarnings = earnings
    .filter((e) => e.status === "pending")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const activeCount = referrals.filter((r) => r.status === "active").length;

  return {
    referralCode,
    referralUrl:             referralCode ? `${appUrl}/join?ref=${referralCode}` : null,
    totalReferrals:          referrals.length,
    pendingReferrals:        referrals.filter((r) => r.status === "pending").length,
    activeReferrals:         activeCount,
    expiredReferrals:        referrals.filter((r) => r.status === "expired").length,
    totalEarnedDollars:      totalEarned,
    pendingEarningsDollars:  pendingEarnings,
    projectedAnnualDollars:  activeCount * REFERRAL_FEE_DOLLARS,
  };
}

// ─── getReferralList ──────────────────────────────────────────────────────────

/**
 * Returns the referrer's list of referrals with anonymized referred-user names.
 * Names are reduced to "First L." — e.g. "Jane S." — for privacy.
 */
export async function getReferralList(
  userId?: string
): Promise<ReferralRecord[]> {
  let resolvedUserId = userId;

  if (!resolvedUserId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    resolvedUserId = user.id;
  }

  const admin = createAdminClient();

  // Fetch referrals joined with the referred user's profile name
  const { data: referrals, error } = await admin
    .from("referrals")
    .select(`
      id,
      status,
      referral_fee_earned,
      created_at,
      last_reward_paid_at,
      referred:profiles!referrals_referred_id_fkey (
        full_name,
        created_at
      )
    `)
    .eq("referrer_id", resolvedUserId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getReferralList]", error.message);
    return [];
  }

  return (referrals ?? []).map((r) => {
    const referred = r.referred as { full_name: string | null; created_at: string } | null;
    const { label, color } = referralStatusLabel(
      r.status as "pending" | "active" | "expired"
    );

    const nextMonths =
      r.status === "active"
        ? monthsUntilNextFee(r.created_at, r.last_reward_paid_at)
        : null;

    return {
      id:               r.id,
      referredName:     anonymizeName(referred?.full_name ?? null),
      status:           r.status as "pending" | "active" | "expired",
      statusLabel:      label,
      statusColor:      color,
      joinedAt:         referred?.created_at ?? r.created_at,
      feeEarned:        Number(r.referral_fee_earned),
      nextPayoutMonths: nextMonths,
    };
  });
}

// ─── getReferralLeaderboardPosition ──────────────────────────────────────────

export interface LeaderboardPosition {
  rank: number;
  totalReferrers: number;
  percentile: number;   // 1–100; higher = better (top 5% → 95)
  activeReferrals: number;
}

/**
 * Returns the current user's rank among all members who have active referrals.
 * Percentile is computed as: what % of referrers have FEWER active referrals.
 */
export async function getReferralLeaderboardPosition(
  userId?: string
): Promise<LeaderboardPosition | null> {
  let resolvedUserId = userId;

  if (!resolvedUserId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    resolvedUserId = user.id;
  }

  const admin = createAdminClient();

  // Fetch all active referral rows — lightweight (referrer_id only)
  const { data: rows } = await admin
    .from("referrals")
    .select("referrer_id")
    .eq("status", "active");

  if (!rows?.length) {
    return { rank: 1, totalReferrers: 1, percentile: 100, activeReferrals: 0 };
  }

  // Tally active referrals per referrer
  const counts = new Map<string, number>();
  for (const r of rows) {
    counts.set(r.referrer_id, (counts.get(r.referrer_id) ?? 0) + 1);
  }

  const userCount = counts.get(resolvedUserId) ?? 0;
  const totalReferrers = counts.size;
  // Rank = number of referrers with strictly more active referrals + 1
  const rank = [...counts.values()].filter((c) => c > userCount).length + 1;
  // Percentile: share of referrers ranked below (or equal) the user
  const percentile =
    totalReferrers > 1
      ? Math.max(1, Math.round(((totalReferrers - rank + 1) / totalReferrers) * 100))
      : 100;

  return { rank, totalReferrers, percentile, activeReferrals: userCount };
}

// ─── getMonthlyReferralEarnings ───────────────────────────────────────────────

export interface MonthlyEarning {
  month: string;      // "YYYY-MM"
  monthLabel: string; // "Jan", "Feb", …
  amount: number;
}

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/**
 * Returns the last 12 calendar months of referral earnings for the user,
 * including months with $0 so the chart always shows a full 12-bar span.
 */
export async function getMonthlyReferralEarnings(
  userId?: string
): Promise<MonthlyEarning[]> {
  let resolvedUserId = userId;

  if (!resolvedUserId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    resolvedUserId = user.id;
  }

  const admin = createAdminClient();

  // Look back ~13 months to ensure we cover the full trailing 12
  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);
  since.setDate(1);

  const { data: earnings } = await admin
    .from("earnings")
    .select("amount, created_at")
    .eq("user_id", resolvedUserId)
    .eq("type", "referral")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  // Aggregate by "YYYY-MM"
  const grouped = new Map<string, number>();
  for (const e of earnings ?? []) {
    const key = (e.created_at as string).substring(0, 7);
    grouped.set(key, (grouped.get(key) ?? 0) + Number(e.amount));
  }

  // Build last-12-months spine
  const result: MonthlyEarning[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    result.push({
      month:      key,
      monthLabel: MONTH_LABELS[d.getMonth()],
      amount:     grouped.get(key) ?? 0,
    });
  }

  return result;
}

// ─── processAnnualReferralFees (cron job logic) ───────────────────────────────

/**
 * Finds all active referrals that are eligible for their next annual fee
 * and credits $20 to the referrer's earnings ledger.
 *
 * Designed to be called from a cron route (e.g. monthly) as a safety net.
 * The Stripe webhook handles fees in real-time; this catches edge cases
 * (failed webhooks, manual corrections, etc.).
 *
 * Returns the number of fees credited.
 */
export async function processAnnualReferralFees(): Promise<number> {
  const admin = createAdminClient();

  // Find active referrals where next fee is due (365 days since last payment)
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
  const cutoff = cutoffDate.toISOString();

  const { data: dueReferrals, error } = await admin
    .from("referrals")
    .select("id, referrer_id, referred_id, last_reward_paid_at, created_at")
    .eq("status", "active")
    .or(`last_reward_paid_at.is.null,last_reward_paid_at.lte.${cutoff}`);

  if (error || !dueReferrals?.length) return 0;

  // Verify referred user is still actively subscribed before crediting
  const referredIds = dueReferrals.map((r) => r.referred_id);
  const { data: activeProfiles } = await admin
    .from("profiles")
    .select("id")
    .in("id", referredIds)
    .eq("subscription_status", "active");

  const activeSet = new Set((activeProfiles ?? []).map((p) => p.id));

  let credited = 0;

  for (const referral of dueReferrals) {
    // Skip if referred user has lapsed — their referral row should be
    // 'expired' already (set by webhook) but guard here too
    if (!activeSet.has(referral.referred_id)) continue;

    const now = new Date().toISOString();

    // Insert earnings record
    const { error: earningsError } = await admin.from("earnings").insert({
      user_id:     referral.referrer_id,
      type:        "referral",
      amount:      REFERRAL_FEE_DOLLARS,
      description: "Annual referral fee (cron)",
      status:      "approved",
    });

    if (earningsError) {
      console.error("[processAnnualReferralFees] earnings insert:", earningsError.message);
      continue;
    }

    // Update referral fee total + last paid timestamp
    await admin
      .from("referrals")
      .update({
        last_reward_paid_at: now,
        referral_fee_earned: REFERRAL_FEE_DOLLARS, // increment handled in DB function
        paid_out: false, // reset for next payout cycle
      })
      .eq("id", referral.id);

    credited++;
  }

  return credited;
}

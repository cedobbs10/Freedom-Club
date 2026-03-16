"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type SharePlatform = "copy" | "twitter" | "facebook" | "email" | "sms" | "qr";

// ─── trackShareEvent ──────────────────────────────────────────────────────────

/**
 * Records a share event to the share_events analytics table.
 * Fire-and-forget — silently swallows errors so UI interactions are never blocked.
 */
export async function trackShareEvent(
  platform: SharePlatform,
  referralCode: string
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("share_events").insert({
    user_id:      user.id,
    platform,
    referral_code: referralCode,
  });
}

// ─── getShareStats ────────────────────────────────────────────────────────────

export interface ShareStats {
  total: number;
  byPlatform: Partial<Record<SharePlatform, number>>;
}

/**
 * Returns share event counts for the current user, grouped by platform.
 * Useful for optimizing which channels to highlight.
 */
export async function getShareStats(userId?: string): Promise<ShareStats> {
  let resolvedUserId = userId;

  if (!resolvedUserId) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { total: 0, byPlatform: {} };
    resolvedUserId = user.id;
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("share_events")
    .select("platform")
    .eq("user_id", resolvedUserId);

  if (!data?.length) return { total: 0, byPlatform: {} };

  const byPlatform: Partial<Record<SharePlatform, number>> = {};
  for (const row of data) {
    const p = row.platform as SharePlatform;
    byPlatform[p] = (byPlatform[p] ?? 0) + 1;
  }

  return { total: data.length, byPlatform };
}

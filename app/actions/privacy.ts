"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type PrivacyError = { message: string };

// ─── deleteAnonymousProfile ───────────────────────────────────────────────────

/**
 * Permanently removes the user's anonymous profile row.
 * Account, earnings, and referrals are unaffected.
 */
export async function deleteAnonymousProfile(): Promise<{ success: true } | PrivacyError> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "Not signed in." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("anonymous_profiles")
    .delete()
    .eq("user_id", user.id);

  if (error) return { message: "Failed to delete profile. Please try again." };
  return { success: true };
}

// ─── QueryLogEntry ────────────────────────────────────────────────────────────

export interface QueryLogEntry {
  id:          string;
  brand_name:  string;
  queried_at:  string;
}

// ─── getProfileQueryLog ───────────────────────────────────────────────────────

/**
 * Returns the last 50 times this user's anonymous profile was matched
 * by a manufacturer query. Shows brand name + timestamp only — no other details.
 */
export async function getProfileQueryLog(): Promise<QueryLogEntry[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from("profile_query_log")
    .select("id, brand_name, queried_at")
    .eq("user_id", user.id)
    .order("queried_at", { ascending: false })
    .limit(50);

  return (data ?? []) as QueryLogEntry[];
}

// ─── getPrivacyPageData ───────────────────────────────────────────────────────

export interface PrivacyPageData {
  hasAnonymousData: boolean;
  queryLog:         QueryLogEntry[];
}

export async function getPrivacyPageData(): Promise<PrivacyPageData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();

  const [anonRes, logRes] = await Promise.all([
    admin
      .from("anonymous_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle(),
    admin
      .from("profile_query_log")
      .select("id, brand_name, queried_at")
      .eq("user_id", user.id)
      .order("queried_at", { ascending: false })
      .limit(50),
  ]);

  return {
    hasAnonymousData: !!anonRes.data,
    queryLog:         (logRes.data ?? []) as QueryLogEntry[],
  };
}

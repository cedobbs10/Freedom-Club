"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type SubscriptionStatus = "free" | "active" | "canceled" | "past_due";

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  isActive: boolean;
  tier: string | null;         // 'monthly' | 'annual' | null
  stripeCustomerId: string | null;
}

/**
 * Returns the current user's subscription info.
 * For use in Server Components and Server Actions.
 * Returns null if the user is not authenticated.
 */
export async function getSubscriptionInfo(): Promise<SubscriptionInfo | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, subscription_tier, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  const status = (profile.subscription_status ?? "free") as SubscriptionStatus;

  return {
    status,
    isActive: status === "active",
    tier:             profile.subscription_tier,
    stripeCustomerId: profile.stripe_customer_id,
  };
}

/**
 * Simple boolean check — use when you only need to gate a feature.
 */
export async function isSubscribed(): Promise<boolean> {
  const info = await getSubscriptionInfo();
  return info?.isActive ?? false;
}

/**
 * Admin version: look up any user's subscription status by user ID.
 * Only call from trusted server contexts (webhooks, admin routes).
 */
export async function getSubscriptionInfoByUserId(
  userId: string
): Promise<SubscriptionInfo | null> {
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("subscription_status, subscription_tier, stripe_customer_id")
    .eq("id", userId)
    .single();

  if (!profile) return null;

  const status = (profile.subscription_status ?? "free") as SubscriptionStatus;

  return {
    status,
    isActive: status === "active",
    tier:             profile.subscription_tier,
    stripeCustomerId: profile.stripe_customer_id,
  };
}

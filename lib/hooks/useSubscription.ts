"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SubscriptionStatus } from "@/app/actions/subscription";

export interface UseSubscriptionResult {
  isSubscribed:       boolean;
  subscriptionStatus: SubscriptionStatus | null;
  tier:               string | null;
  loading:            boolean;
  error:              string | null;
  /** Re-fetch — useful after a Stripe redirect back to the app */
  refresh:            () => void;
}

/**
 * Client-side hook that returns the current user's subscription state.
 * Subscribes to real-time profile updates so the UI reflects webhook
 * changes (e.g. Stripe marks subscription active) without a page reload.
 */
export function useSubscription(): UseSubscriptionResult {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [tier,   setTier]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]  = useState<string | null>(null);
  const [tick,    setTick]   = useState(0);

  const refresh = () => setTick((t) => t + 1);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function fetchStatus() {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setStatus(null);
        setTier(null);
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("subscription_status, subscription_tier")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
      } else if (profile) {
        setStatus((profile.subscription_status as SubscriptionStatus) ?? "free");
        setTier(profile.subscription_tier);
      }

      setLoading(false);

      // Real-time subscription: update state whenever the profile row changes.
      // This means a Stripe webhook updating subscription_status is reflected
      // in the UI within ~1 second without requiring a page reload.
      channel = supabase
        .channel(`profile-subscription-${user.id}`)
        .on(
          "postgres_changes",
          {
            event:  "UPDATE",
            schema: "public",
            table:  "profiles",
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            const updated = payload.new as {
              subscription_status?: SubscriptionStatus;
              subscription_tier?: string;
            };
            if (updated.subscription_status !== undefined) {
              setStatus(updated.subscription_status);
            }
            if (updated.subscription_tier !== undefined) {
              setTier(updated.subscription_tier);
            }
          }
        )
        .subscribe();
    }

    fetchStatus();

    return () => {
      if (channel) {
        const supabase = createClient();
        supabase.removeChannel(channel);
      }
    };
  }, [tick]);

  return {
    isSubscribed:       status === "active",
    subscriptionStatus: status,
    tier,
    loading,
    error,
    refresh,
  };
}

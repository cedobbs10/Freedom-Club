"use client";

import { useState } from "react";
import Link from "next/link";
import { useSubscription } from "@/lib/hooks/useSubscription";
import Button from "@/components/ui/Button";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  /**
   * What to show while subscription status is loading.
   * Defaults to a subtle skeleton so layout doesn't jump.
   */
  fallbackLoading?: React.ReactNode;
  /**
   * Override the feature label shown in the upgrade prompt.
   * e.g. "watch videos and earn" or "withdraw earnings"
   */
  featureLabel?: string;
}

/**
 * Wraps premium features that require an active subscription.
 *
 * Allowed without subscription:
 *   - Dashboard overview
 *   - Profile (anonymous profile form)
 *   - Referral link (always available — referrals benefit the whole club)
 *
 * Gated behind subscription:
 *   - Video watching / earnings
 *   - Earnings withdrawal
 *   - Any route under /dashboard/videos or /dashboard/earnings
 *
 * Usage:
 *   <SubscriptionGuard featureLabel="watch videos and earn">
 *     <VideoFeed />
 *   </SubscriptionGuard>
 */
export default function SubscriptionGuard({
  children,
  fallbackLoading,
  featureLabel = "access this feature",
}: SubscriptionGuardProps) {
  const { isSubscribed, subscriptionStatus, loading } = useSubscription();

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        {fallbackLoading ?? (
          <div className="animate-pulse space-y-4 p-6">
            <div className="h-6 bg-gray-100 rounded-lg w-1/3" />
            <div className="h-4 bg-gray-100 rounded-lg w-2/3" />
            <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
          </div>
        )}
      </>
    );
  }

  // ── Active subscriber ──────────────────────────────────────────────────────
  if (isSubscribed) {
    return <>{children}</>;
  }

  // ── Past due ───────────────────────────────────────────────────────────────
  if (subscriptionStatus === "past_due") {
    return (
      <div className="flex items-center justify-center min-h-[280px] px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-card border-2 border-yellow-300 p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-extrabold text-navy mb-2">
            Payment Issue
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Your last payment didn&apos;t go through. Update your payment method
            to restore access to {featureLabel}.
          </p>
          <UpdatePaymentButton />
          <p className="text-xs text-gray-400 mt-4">
            Your data and referral earnings are safe.
          </p>
        </div>
      </div>
    );
  }

  // ── Canceled ───────────────────────────────────────────────────────────────
  if (subscriptionStatus === "canceled") {
    return (
      <div className="flex items-center justify-center min-h-[280px] px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-card border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-4">💔</div>
          <h2 className="text-xl font-extrabold text-navy mb-2">
            Membership Ended
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Your Freedom Club membership has ended. Rejoin to {featureLabel}.
          </p>
          <Link href="/pricing">
            <Button size="lg" className="w-full">
              Rejoin Freedom Club — $10/month →
            </Button>
          </Link>
          <p className="text-xs text-gray-400 mt-4">
            30-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </div>
    );
  }

  // ── Free / no subscription ─────────────────────────────────────────────────
  return (
    <div className="flex items-center justify-center min-h-[320px] px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-card border-2 border-blue-accent p-8 text-center">
        {/* Lock icon */}
        <div className="w-14 h-14 bg-hero-gradient rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-extrabold text-navy mb-2">
          Membership Required
        </h2>
        <p className="text-gray-600 text-sm mb-1">
          A Freedom Club membership is required to {featureLabel}.
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Members earn up to{" "}
          <strong className="text-navy">$10/month</strong> watching videos and{" "}
          <strong className="text-navy">$20/year</strong> per referral.
        </p>

        {/* Value props mini-list */}
        <ul className="text-left space-y-2 mb-6">
          {[
            "Earn $1/video — up to 10 videos/month",
            "$20/year for every friend you refer",
            "Manufacturer rebates & D2C pricing",
            "Zero personal data sold — ever",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
              <svg
                className="w-4 h-4 text-blue-accent flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {item}
            </li>
          ))}
        </ul>

        <Link href="/pricing">
          <Button size="lg" className="w-full">
            Subscribe — $10/month →
          </Button>
        </Link>

        <p className="text-xs text-gray-400 mt-3">
          30-day money-back guarantee · Cancel anytime
        </p>
      </div>
    </div>
  );
}

// ─── Inline helper for past_due payment update ────────────────────────────────

function UpdatePaymentButton() {
  const [loading, setLoading] = useState(false); // useState imported at top

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnPath: window.location.pathname }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="lg"
      className="w-full"
      loading={loading}
      disabled={loading}
      onClick={handleClick}
    >
      {loading ? "Opening portal…" : "Update Payment Method →"}
    </Button>
  );
}

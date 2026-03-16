"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

// ─── Shared ───────────────────────────────────────────────────────────────────

async function redirectToCheckout(plan: "monthly" | "annual") {
  const res = await fetch("/api/stripe/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error || "Checkout failed");
  return data.url as string;
}

async function redirectToPortal() {
  const res = await fetch("/api/stripe/create-portal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ returnPath: "/pricing" }),
  });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error || "Portal unavailable");
  return data.url as string;
}

// ─── Plan toggle + checkout CTA (combined so plan state stays local) ─────────

export function PricingActions() {
  const router = useRouter();
  const [plan, setPlan]     = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);
    try {
      const url = await redirectToCheckout(plan);
      router.push(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setPlan("monthly")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              plan === "monthly"
                ? "bg-white text-navy shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setPlan("annual")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              plan === "annual"
                ? "bg-white text-navy shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Annual
            <span className="bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
              SAVE $20
            </span>
          </button>
        </div>
      </div>

      {/* Dynamic price display */}
      <div className="text-center">
        {plan === "monthly" ? (
          <>
            <span className="text-5xl font-extrabold text-navy">$10</span>
            <span className="text-gray-500 text-lg">/month</span>
            <p className="text-gray-400 text-sm mt-1">Billed monthly • Cancel anytime</p>
          </>
        ) : (
          <>
            <span className="text-5xl font-extrabold text-navy">$100</span>
            <span className="text-gray-500 text-lg">/year</span>
            <p className="text-gray-400 text-sm mt-1">
              Just $8.33/month •{" "}
              <span className="text-green-600 font-semibold">Save $20 vs monthly</span>
            </p>
          </>
        )}
      </div>

      {/* CTA */}
      <Button
        size="lg"
        className="w-full text-lg py-4"
        loading={loading}
        disabled={loading}
        onClick={handleSubscribe}
      >
        {loading
          ? "Opening checkout…"
          : plan === "monthly"
          ? "Subscribe Now — $10/month →"
          : "Subscribe Annually — $100/year →"}
      </Button>

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      <p className="text-center text-xs text-gray-400">
        Secured by Stripe · Cancel anytime · 30-day money-back guarantee
      </p>
    </div>
  );
}

// ─── Already-subscribed actions ───────────────────────────────────────────────

export function SubscribedActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function handlePortal() {
    setLoading(true);
    setError(null);
    try {
      const url = await redirectToPortal();
      router.push(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open billing portal.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-green-800 font-semibold text-sm">
          You&apos;re an active Freedom Club member
        </span>
      </div>

      <Button
        variant="outline"
        size="lg"
        className="w-full"
        loading={loading}
        disabled={loading}
        onClick={handlePortal}
      >
        {loading ? "Opening portal…" : "Manage Subscription →"}
      </Button>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <Link
        href="/dashboard"
        className="block text-center text-sm text-gray-500 hover:text-navy transition-colors"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}

// ─── Bottom CTA checkout button (standalone, used in the hero CTA strip) ─────

export function BottomCTAButton() {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const url = await redirectToCheckout("monthly");
      router.push(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        size="lg"
        className="bg-white !text-navy hover:bg-gray-100 text-lg px-12 py-4"
        loading={loading}
        disabled={loading}
        onClick={handleClick}
      >
        {loading ? "Opening checkout…" : "Subscribe Now — $10/month →"}
      </Button>
      {error && <p className="text-sm text-red-300 text-center">{error}</p>}
    </div>
  );
}

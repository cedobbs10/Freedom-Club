import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PricingActions, SubscribedActions, BottomCTAButton } from "./PricingClient";

// ─── Static data ──────────────────────────────────────────────────────────────

const BENEFITS = [
  {
    icon: "🎬",
    title: "Earn up to $10/month watching videos",
    body: "Watch short brand videos and earn $1 each — up to 10 per month. That's $120/year just from watching.",
    highlight: "$10/mo potential",
  },
  {
    icon: "👥",
    title: "Earn $20/year per friend — no limit",
    body: "Refer just 1 friend and your membership pays for itself. Refer 10 and you're earning $200/year in referral income alone.",
    highlight: "1 referral = paid for",
  },
  {
    icon: "🏷️",
    title: "Best prices on top consumer brands",
    body: "Unlock manufacturer-direct pricing and instant rebates of 3–25% — even when shopping at Amazon or Walmart.",
    highlight: "3–25% back",
  },
  {
    icon: "🔒",
    title: "Your privacy protected by patent-pending tech",
    body: "Brands reach you through your anonymous profile. Your name, email, and address are never shared or sold.",
    highlight: "Zero PII sold",
  },
  {
    icon: "💰",
    title: "Quarterly revenue share from the Club",
    body: "As Freedom Club grows, members share in the club's net revenue every quarter — you built this together.",
    highlight: "Coming soon",
  },
];

const ROI_ROWS = [
  { label: "Watching 10 videos/month",      referrals: 0,  annual: 120, highlight: false },
  { label: "Videos + 1 referral",           referrals: 1,  annual: 140, highlight: true  },
  { label: "Videos + 5 referrals",          referrals: 5,  annual: 220, highlight: false },
  { label: "Videos + 10 referrals",         referrals: 10, annual: 320, highlight: false },
];

const FAQS = [
  {
    q: "Does my membership pay for itself?",
    a: "Yes — easily. Watching 10 videos/month earns $10 back immediately. Referring just one friend earns $20/year. That's 3× your monthly fee from a single referral alone.",
  },
  {
    q: "What is the anonymous profile?",
    a: "A 7-question form covering broad ranges — age range, income range, zip code, and a few others. No name, no address, no Social Security number. Brands see aggregated statistics, never individual answers.",
  },
  {
    q: "How and when do I get paid?",
    a: "Earnings are tracked in your dashboard. Payouts are processed monthly to your bank account or PayPal once you reach the $20 minimum balance.",
  },
  {
    q: "What happens if I cancel?",
    a: "Your account stays active until the end of the billing period. No cancellation fees. Your referral earnings already paid out are yours to keep.",
  },
  {
    q: "Is there a free trial?",
    a: "Not at this time — but we offer a 30-day money-back guarantee. If you're not satisfied for any reason, email us within 30 days for a full refund.",
  },
  {
    q: "How is Freedom Club different from cashback apps?",
    a: "Cashback apps still collect and sell your personal data. Freedom Club pays you directly for your anonymous attention while keeping your identity 100% private.",
  },
];

const TESTIMONIALS = [
  {
    quote: "I referred 3 friends in the first week. My membership is already paying for itself three times over.",
    name: "Sarah M.",
    location: "Texas",
  },
  {
    quote: "I can't believe Big Tech was selling my data for years and paying me nothing. This is how it should work.",
    name: "James R.",
    location: "Florida",
  },
  {
    quote: "The rebates alone are worth it. Got 18% back on a refrigerator I was buying anyway.",
    name: "Patricia K.",
    location: "Ohio",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isSubscribed = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single();
    isSubscribed = profile?.subscription_status === "active";
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <section className="bg-hero-gradient pt-28 pb-16 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 mb-5 text-white text-sm font-medium">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Now accepting founding members
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            One Membership.<br />
            <span className="text-blue-light">Unlimited Earning Potential.</span>
          </h1>
          <p className="text-white/75 text-lg max-w-xl mx-auto">
            Most members earn more than they pay — through video rewards, referral income,
            and manufacturer rebates.
          </p>
        </div>
      </section>

      {/* ── Pricing card ── */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-3xl shadow-card-hover border-2 border-blue-accent overflow-hidden">

            {/* Card top bar */}
            <div className="bg-navy px-8 py-4 text-center">
              <p className="text-blue-light font-bold text-sm uppercase tracking-widest">
                Freedom Club Membership
              </p>
            </div>

            <div className="px-8 py-8 space-y-6">
              {/* Plan toggle + price + subscribe OR manage — all client */}
              {isSubscribed ? <SubscribedActions /> : <PricingActions />}

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Benefits checklist */}
              <ul className="space-y-3">
                {BENEFITS.map((b) => (
                  <li key={b.title} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-50 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <div className="text-sm">
                      <span className="text-navy font-semibold">{b.title}</span>
                      <span className="ml-1.5 bg-blue-50 text-blue-accent text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {b.highlight}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Money-back guarantee */}
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <span className="text-2xl flex-shrink-0">🛡️</span>
                <div>
                  <p className="text-green-800 font-bold text-sm">30-Day Money-Back Guarantee</p>
                  <p className="text-green-700 text-xs mt-0.5">
                    Not satisfied for any reason? Email us within 30 days for a full refund. No questions asked.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-6 text-gray-400 text-xs">
            <span className="flex items-center gap-1">🔒 Stripe-secured</span>
            <span className="flex items-center gap-1">🏛️ Patent-pending tech</span>
            <span className="flex items-center gap-1">✓ Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* ── ROI table ── */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mb-3">
              Your Membership Pays for Itself
            </h2>
            <p className="text-gray-500">
              Refer just one friend and you&apos;re in the green. Here&apos;s the math.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-5 text-gray-500 font-semibold">Scenario</th>
                  <th className="text-right py-3 px-5 text-gray-500 font-semibold">Annual earnings</th>
                  <th className="text-right py-3 px-5 text-gray-500 font-semibold">Net after membership</th>
                </tr>
              </thead>
              <tbody>
                {ROI_ROWS.map((row) => (
                  <tr
                    key={row.label}
                    className={`border-b border-gray-50 last:border-0 ${
                      row.highlight ? "bg-blue-50/60" : ""
                    }`}
                  >
                    <td className="py-3.5 px-5">
                      <span className={`font-medium ${row.highlight ? "text-navy" : "text-gray-700"}`}>
                        {row.label}
                      </span>
                      {row.highlight && (
                        <span className="ml-2 bg-blue-accent text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                          MOST COMMON
                        </span>
                      )}
                    </td>
                    <td className={`text-right py-3.5 px-5 font-bold ${row.highlight ? "text-blue-accent" : "text-gray-700"}`}>
                      ${row.annual}
                    </td>
                    <td className={`text-right py-3.5 px-5 font-bold ${
                      row.annual - 120 >= 0 ? "text-green-600" : "text-red-500"
                    }`}>
                      {row.annual - 120 >= 0 ? "+" : ""}${row.annual - 120}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Based on $10/month membership ($120/year) · 10 videos/month ($10/mo) · $20/year per referral
          </p>
        </div>
      </section>

      {/* ── Benefits deep-dive ── */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy text-center mb-10">
            Everything Included
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl shadow-card p-6 flex gap-4">
                <span className="text-3xl flex-shrink-0">{b.icon}</span>
                <div>
                  <p className="font-bold text-navy text-sm mb-1">{b.title}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof ── */}
      <section className="py-14 px-4 sm:px-6 bg-navy">
        <div className="max-w-4xl mx-auto">
          <p className="text-white/40 text-xs uppercase tracking-wider text-center mb-8">
            What members are saying
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white/10 border border-white/15 rounded-2xl p-5">
                <p className="text-white/80 text-sm leading-relaxed mb-4 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/40 text-xs">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-white/25 text-xs text-center mt-6">
            * Testimonials are illustrative. Individual results will vary.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-extrabold text-navy text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="border border-gray-200 rounded-xl p-5">
                <p className="font-bold text-navy text-sm mb-2">{q}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA (only for non-subscribers) ── */}
      {!isSubscribed && (
        <section className="py-16 px-4 sm:px-6 bg-hero-gradient text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Start earning today
            </h2>
            <p className="text-white/70 mb-8">
              Join thousands of members who are already getting paid for their attention —
              while keeping their privacy.
            </p>
            <BottomCTAButton />
            <p className="text-white/40 text-xs mt-4">
              30-day money-back guarantee · Cancel anytime · No hidden fees
            </p>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

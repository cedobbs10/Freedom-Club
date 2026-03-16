import type { Metadata } from "next";
import Link from "next/link";
import ReferralCookieSetter from "./ReferralCookieSetter";
import Button from "@/components/ui/Button";
import { validateReferralCode } from "@/app/actions/referral";

interface JoinPageProps {
  searchParams: Promise<{ ref?: string }>;
}

// ─── Dynamic Open Graph metadata ──────────────────────────────────────────────
// When someone shares /join?ref=CODE on social media, this generates a branded
// preview card showing who invited them via the /api/og/referral image endpoint.

export async function generateMetadata({ searchParams }: JoinPageProps): Promise<Metadata> {
  const params   = await searchParams;
  const refCode  = params.ref?.trim().toUpperCase() || null;
  const referrer = refCode ? await validateReferralCode(refCode) : null;
  const firstName = referrer?.valid ? referrer.referrerFirstName : null;

  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? "https://freedomclub.com";
  const ogImgUrl  = refCode
    ? `${appUrl}/api/og/referral?ref=${refCode}`
    : `${appUrl}/api/og/referral`;

  const title       = firstName
    ? `${firstName} invited you to Freedom Club`
    : "You've been invited to Freedom Club";
  const description =
    "Earn $1/video, $20/year per referral, and unlock manufacturer-direct pricing — with zero personal data sold.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type:   "website",
      url:    refCode ? `${appUrl}/join?ref=${refCode}` : `${appUrl}/join`,
      images: [{ url: ogImgUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:      [ogImgUrl],
    },
  };
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const VALUE_PROPS = [
  {
    icon: "🎬",
    title: "Earn $10/month watching videos",
    body: "Get paid $1 for each brand video you watch — up to 10 short videos per month. Your time is worth money.",
    highlight: "$10/month",
  },
  {
    icon: "👥",
    title: "Earn $20/year per referral",
    body: "Invite friends with your own personal link. Earn $20 every year for each friend who stays a member.",
    highlight: "$20/year",
  },
  {
    icon: "🏷️",
    title: "Best prices guaranteed",
    body: "Unlock manufacturer-direct pricing and instant rebates of 3–25% on top consumer brands — even at Amazon or Walmart.",
    highlight: "3–25% back",
  },
  {
    icon: "🔒",
    title: "Your privacy protected",
    body: "Your personal data is never sold. Our patent-pending anonymous profiling means brands reach you without ever knowing who you are.",
    highlight: "Zero PII sold",
  },
];

const HOW_IT_WORKS = [
  { step: "01", text: "Join for $10/month and create your account in 2 minutes." },
  { step: "02", text: "Complete a quick 7-point anonymous profile — no name, no address." },
  { step: "03", text: "Watch brand videos, earn $1 each, up to $10/month." },
  { step: "04", text: "Invite friends with your referral link and earn $20/year per friend." },
];

const FAQS = [
  {
    q: "Is my personal information safe?",
    a: "Yes. We use patent-pending anonymous profiling technology. Brands only see broad demographic ranges — never your name, email, address, or any identifying information.",
  },
  {
    q: "How do I actually earn money?",
    a: "Two ways: watch up to 10 brand videos per month ($1 each = $10/month), and earn $20/year for every friend who signs up with your referral link.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. No contracts, no cancellation fees. Cancel from your dashboard in one click.",
  },
  {
    q: "What is manufacturer-direct pricing?",
    a: "Brands can offer Freedom Club members exclusive rebates and direct pricing — bypassing the retail middleman. You get better prices. Brands save on advertising.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function JoinPage({ searchParams }: JoinPageProps) {
  const params = await searchParams;
  const refCode = params.ref?.trim().toUpperCase() || null;
  const signupUrl = refCode ? `/signup?ref=${refCode}` : "/signup";

  // Validate the code and get referrer's first name (server-side, no round-trip)
  const referrer = refCode ? await validateReferralCode(refCode) : null;
  const referrerName = referrer?.valid ? referrer.referrerFirstName : null;

  return (
    <>
      {/* Set the cookie silently on mount */}
      {refCode && <ReferralCookieSetter code={refCode} />}

      <div className="min-h-screen bg-white">

        {/* ── Minimal nav ── */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">FC</span>
              </div>
              <span className="text-white font-bold text-sm">Freedom Club</span>
            </div>
            <Link href={signupUrl}>
              <Button size="sm">Join Now — $10/mo</Button>
            </Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="bg-hero-gradient pt-28 pb-16 px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto">

            {/* Referral badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-2 mb-6 text-sm text-white font-medium">
              <span className="text-lg">🎉</span>
              {referrerName
                ? `${referrerName} personally invited you to Freedom Club`
                : refCode
                ? "Your friend personally invited you to Freedom Club"
                : "You've been invited to Freedom Club"}
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              Get Paid to Protect<br />
              <span className="text-blue-light">Your Privacy</span>
            </h1>

            <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
              Freedom Club is the only membership that pays <em>you</em> for your attention —
              while keeping your personal data 100% private.
            </p>

            {/* CTA button */}
            <Link href={signupUrl} className="block sm:inline-block">
              <button className="w-full sm:w-auto bg-white text-navy font-extrabold text-lg px-12 py-4 rounded-xl shadow-lg hover:bg-gray-100 hover:shadow-xl transition-all duration-200 active:scale-95">
                Join Now — $10/month →
              </button>
            </Link>
            <p className="text-white/50 text-xs mt-3">
              No contracts • Cancel anytime • Your data is never sold
            </p>

            {/* Quick earn stats */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10 text-white">
              {[
                { value: "$10", label: "earned/month\nwatching videos" },
                { value: "$20", label: "earned/year\nper referral" },
                { value: "0", label: "personal data\never sold" },
              ].map(({ value, label }) => (
                <div key={value} className="flex items-center gap-3 sm:gap-0 sm:flex-col sm:text-center">
                  <span className="text-3xl font-extrabold">{value}</span>
                  <span className="text-white/60 text-sm whitespace-pre-line">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Value props ── */}
        <section className="py-16 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy text-center mb-10">
              Here&apos;s what you get as a member
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {VALUE_PROPS.map((vp) => (
                <div
                  key={vp.title}
                  className="bg-white rounded-2xl shadow-card p-6 flex gap-4 items-start"
                >
                  <span className="text-3xl flex-shrink-0 mt-0.5">{vp.icon}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-navy text-base">{vp.title}</h3>
                      <span className="bg-blue-50 text-blue-accent text-xs font-bold px-2 py-0.5 rounded-full">
                        {vp.highlight}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{vp.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy text-center mb-10">
              Up and running in 5 minutes
            </h2>

            <div className="space-y-5">
              {HOW_IT_WORKS.map(({ step, text }) => (
                <div key={step} className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-11 h-11 bg-hero-gradient rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                    {step}
                  </div>
                  <p className="text-gray-700 text-base leading-relaxed pt-2">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Privacy callout ── */}
        <section className="py-14 px-4 sm:px-6 bg-navy">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              Your Privacy Is Not For Sale
            </h2>
            <p className="text-white/70 text-base leading-relaxed max-w-xl mx-auto mb-6">
              Big Tech collects your personal data and sells it for{" "}
              <strong className="text-white">$300 billion a year</strong> — without paying you a cent.
              Freedom Club uses patent-pending anonymous profiling so brands can reach their target
              audience without ever seeing your name, address, or any identifying information.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm">
              <span>🏛️</span>
              Patent-Pending Technology • Filed USPTO &amp; International PCT
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="py-16 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mb-3">
              One simple price
            </h2>
            <p className="text-gray-500 mb-8">Cancel anytime. No hidden fees.</p>

            <div className="bg-white rounded-2xl shadow-card-hover border-2 border-blue-accent p-8">
              <div className="flex items-end justify-center gap-1 mb-1">
                <span className="text-5xl font-extrabold text-navy">$10</span>
                <span className="text-gray-500 mb-1.5">/month</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">or $100/year (save 17%)</p>

              <ul className="space-y-3 text-sm text-left mb-8">
                {[
                  "Earn $1/video — up to $10/month",
                  "$20/year per friend you refer",
                  "Manufacturer rebates & direct pricing",
                  "Anonymous profile — zero PII shared",
                  "Cancel anytime, no questions asked",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-gray-700">
                    <svg className="w-4 h-4 text-blue-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={signupUrl} className="block">
                <button className="w-full bg-hero-gradient text-white font-extrabold text-lg py-4 rounded-xl shadow-md hover:shadow-lg hover:opacity-95 transition-all duration-200 active:scale-95">
                  Join Freedom Club →
                </button>
              </Link>

              <p className="text-xs text-gray-400 mt-4">
                Secured by Stripe • Your card details are never stored
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-extrabold text-navy text-center mb-8">
              Common questions
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

        {/* ── Bottom CTA ── */}
        <section className="py-16 px-4 sm:px-6 bg-hero-gradient text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Ready to join the movement?
            </h2>
            <p className="text-white/70 mb-8">
              {referrerName
                ? `${referrerName} is already earning. Start in under 5 minutes.`
                : "Your friend is already earning. Start in under 5 minutes."}
            </p>
            <Link href={signupUrl} className="block sm:inline-block">
              <button className="w-full sm:w-auto bg-white text-navy font-extrabold text-lg px-12 py-4 rounded-xl shadow-lg hover:bg-gray-100 transition-all duration-200 active:scale-95">
                Join Now — $10/month →
              </button>
            </Link>
            <p className="text-white/50 text-xs mt-3">
              No contracts • Cancel anytime • Your data is never sold
            </p>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="bg-navy text-white/50 text-xs text-center py-6 px-4">
          <p>&copy; {new Date().getFullYear()} Freedom Club. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </footer>

      </div>
    </>
  );
}

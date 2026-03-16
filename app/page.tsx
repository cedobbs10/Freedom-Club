import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

// ─── Value Proposition Data ───────────────────────────────────────────────────

const earningItems = [
  {
    icon: "🎬",
    title: "Watch & Earn",
    value: "$10/month",
    description: "Earn $1 for every brand video you watch — up to 10 videos per month.",
  },
  {
    icon: "👥",
    title: "Refer Friends",
    value: "$20/year per referral",
    description: "Share your personal link. Every friend who joins earns you $20 each year they stay.",
  },
  {
    icon: "🏷️",
    title: "Best Prices",
    value: "3–25% back",
    description: "Members unlock instant rebates from top manufacturers, even when shopping at Amazon or Walmart.",
  },
];

const howItWorksSteps = [
  {
    step: "01",
    title: "Join for $10/month",
    description:
      "Create your account and start a monthly or annual membership. Cancel anytime.",
  },
  {
    step: "02",
    title: "Complete Your Anonymous Profile",
    description:
      "Answer 7 simple questions — no name, no address, no Social Security number. Just age range, income range, and a few more broad categories.",
  },
  {
    step: "03",
    title: "Watch Videos & Earn",
    description:
      "View short video ads from top consumer brands. Each video pays you $1, up to 10 per month.",
  },
  {
    step: "04",
    title: "Invite Friends & Multiply",
    description:
      "Share your referral link. Every friend who joins earns you $20/year — automatically, every year they remain a member.",
  },
];

const privacyPoints = [
  {
    icon: "🔒",
    title: "Zero PII Shared",
    description:
      "Manufacturers only see anonymous demographic ranges — never your name, email, or any personally identifiable information.",
  },
  {
    icon: "🧬",
    title: "Patent-Pending Technology",
    description:
      "Our Anonymous Profiling Data Sets use cutting-edge privacy protocols to protect your data while still connecting you with relevant brands.",
  },
  {
    icon: "💰",
    title: "You Own the Value",
    description:
      "Big Tech collects your data for free and sells it. We pay you directly for allowing brands to reach you anonymously.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <section className="bg-hero-gradient pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">
              Now accepting founding members
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight text-balance mb-6">
            Take Back Control of Your Data.{" "}
            <span className="text-blue-light">Get Paid for It.</span>
          </h1>

          <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto mb-10 text-balance">
            Freedom Club is America&apos;s first manufacturer-direct marketplace where{" "}
            <strong className="text-white">your privacy is protected</strong>, you earn real
            money every month, and you unlock the{" "}
            <strong className="text-white">best prices on top brands</strong> — guaranteed.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto text-lg px-10 py-4 bg-white !text-navy hover:bg-gray-100">
                Join for $10/month →
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:!text-navy">
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Social proof stat bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">$10</span>
              <span>/ month earned<br />watching videos</span>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">$20</span>
              <span>/ year per<br />friend referred</span>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">0</span>
              <span>personal data<br />ever sold</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Earn Section ── */}
      <section id="earn" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy mb-4">
              Three Ways to Earn Every Month
            </h2>
            <p className="text-gray-600 text-lg max-w-xl mx-auto">
              Members earn back their membership fee — and then some — just by doing everyday things.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {earningItems.map((item) => (
              <Card key={item.title} hover className="text-center">
                <CardHeader>
                  <div className="text-5xl mb-3">{item.icon}</div>
                  <CardTitle>{item.title}</CardTitle>
                  <p className="text-blue-accent font-bold text-xl mt-1">{item.value}</p>
                </CardHeader>
                <CardContent>
                  <p>{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy mb-4">
              Up and Running in 5 Minutes
            </h2>
            <p className="text-gray-600 text-lg max-w-xl mx-auto">
              No credit card skimming. No selling your phone number. Just four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {howItWorksSteps.map((s) => (
              <div key={s.step} className="flex gap-5 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-hero-gradient rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-md">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy mb-1">{s.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy Section ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-navy">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Your Privacy Is Not For Sale
            </h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              Big Tech made billions selling your personal data without your knowledge or consent.
              Freedom Club was built to change that — permanently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {privacyPoints.map((p) => (
              <div key={p.title} className="bg-white/10 border border-white/15 rounded-2xl p-6">
                <div className="text-4xl mb-4">{p.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{p.title}</h3>
                <p className="text-white/65 text-sm leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600 text-lg mb-12 max-w-xl mx-auto">
            One membership. Everything included. Cancel anytime.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Monthly */}
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Monthly</p>
                <div className="flex items-end gap-1 justify-center">
                  <span className="text-5xl font-extrabold text-navy">$10</span>
                  <span className="text-gray-500 mb-1">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-left mb-6">
                  {["Earn $1/video (up to 10/mo)", "$20/year per referral", "Anonymous profile protection", "Manufacturer rebates & D2C pricing", "Cancel anytime"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup?plan=monthly">
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Annual — highlighted */}
            <Card className="border-2 border-blue-accent relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-blue-accent text-white text-xs font-bold px-2 py-1 rounded-full">
                SAVE 17%
              </div>
              <CardHeader>
                <p className="text-sm font-semibold text-blue-accent uppercase tracking-wider mb-2">Annual</p>
                <div className="flex items-end gap-1 justify-center">
                  <span className="text-5xl font-extrabold text-navy">$100</span>
                  <span className="text-gray-500 mb-1">/year</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">That&apos;s just $8.33/month</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-left mb-6">
                  {["Everything in monthly", "2 months free vs monthly", "Priority member support", "Early access to new features", "Founding member recognition"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup?plan=annual">
                  <Button className="w-full">Get Best Value</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <p className="text-gray-500 text-sm mt-8">
            Payments processed securely by Stripe. No contracts. No hidden fees.
          </p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-hero-gradient">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to Take Back Your Power?
          </h2>
          <p className="text-white/75 text-lg mb-10">
            Join thousands of Americans who are protecting their privacy,
            earning real money, and shopping smarter every month.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white !text-navy hover:bg-gray-100 text-lg px-12 py-4">
              Join Freedom Club Today →
            </Button>
          </Link>
          <p className="text-white/50 text-sm mt-4">$10/month • Cancel anytime • No personal data sold — ever</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import Link from "next/link";
import SignupForm from "./SignupForm";

interface SignupPageProps {
  searchParams: Promise<{ plan?: string; ref?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const plan = params.plan === "annual" ? "annual" : "monthly";
  const referralCode = params.ref?.trim().toUpperCase() || null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-hero-gradient rounded-2xl flex items-center justify-center shadow-md">
              <span className="text-white font-extrabold text-xl">FC</span>
            </div>
            <span className="text-navy font-bold text-lg tracking-tight">Freedom Club</span>
          </Link>

          <h1 className="text-3xl font-extrabold text-navy mt-4">
            Create your account
          </h1>

          <p className="text-gray-500 mt-1">
            {plan === "annual"
              ? "Annual plan — $100/year (save 17%)"
              : "Monthly plan — $10/month"}
          </p>

          {referralCode && (
            <div className="mt-3 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-full">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Referred by a friend — you&apos;re in the right place
            </div>
          )}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          <SignupForm plan={plan} referralCode={referralCode} />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Payments processed securely by Stripe. We never store your card details.
        </p>
      </div>
    </div>
  );
}

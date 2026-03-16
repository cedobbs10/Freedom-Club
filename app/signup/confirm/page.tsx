import Link from "next/link";
import Button from "@/components/ui/Button";

export default function ConfirmEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">

        <div className="bg-white rounded-2xl shadow-card p-10">
          {/* Icon */}
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-2xl font-extrabold text-navy mb-3">
            Check your email
          </h1>

          <p className="text-gray-600 mb-2">
            We&apos;ve sent a confirmation link to your email address.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Click the link in the email to activate your account, then come
            back here to sign in and complete your membership.
          </p>

          <Link href="/login">
            <Button className="w-full" size="lg">
              Go to Sign In
            </Button>
          </Link>

          <p className="text-xs text-gray-400 mt-6">
            Didn&apos;t receive an email? Check your spam folder, or{" "}
            <Link href="/signup" className="text-blue-accent hover:underline">
              try signing up again
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
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
            Reset your password
          </h1>
          <p className="text-gray-500 mt-1">
            We&apos;ll send you a secure link to reset it
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          <ForgotPasswordForm />
        </div>

      </div>
    </div>
  );
}

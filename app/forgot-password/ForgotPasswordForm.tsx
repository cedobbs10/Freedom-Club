"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPassword, type AuthError } from "@/app/actions/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type ForgotState = AuthError | { success: true } | null;

export default function ForgotPasswordForm() {
  const [state, action, isPending] = useActionState<ForgotState, FormData>(
    forgotPassword,
    null
  );

  const isSuccess = state !== null && "success" in state;
  const error = state !== null && "message" in state ? state : null;

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-navy">Check your email</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          If an account exists for that email address, we&apos;ve sent a
          password reset link. It expires in 1 hour.
        </p>
        <p className="text-gray-500 text-sm">
          Check your spam folder if you don&apos;t see it within a few minutes.
        </p>
        <Link
          href="/login"
          className="inline-block text-blue-accent text-sm font-medium hover:underline mt-2"
        >
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error.message}
        </div>
      )}

      <p className="text-gray-600 text-sm">
        Enter the email address on your account and we&apos;ll send you a
        link to reset your password.
      </p>

      <Input
        id="email"
        name="email"
        label="Email Address"
        type="email"
        placeholder="jane@example.com"
        required
        autoComplete="email"
        disabled={isPending}
      />

      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={isPending}
        disabled={isPending}
      >
        {isPending ? "Sending reset link…" : "Send Reset Link"}
      </Button>

      <p className="text-center text-sm text-gray-500">
        Remember your password?{" "}
        <Link href="/login" className="text-blue-accent font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

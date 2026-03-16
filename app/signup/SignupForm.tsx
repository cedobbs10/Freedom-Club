"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthError } from "@/app/actions/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface SignupFormProps {
  plan: "monthly" | "annual";
  referralCode: string | null;
}

export default function SignupForm({ plan, referralCode }: SignupFormProps) {
  const [error, action, isPending] = useActionState<AuthError | null, FormData>(
    signUp,
    null
  );

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="plan" value={plan} />
      {referralCode && (
        <input type="hidden" name="referral_code" value={referralCode} />
      )}

      {/* Global error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error.message}
        </div>
      )}

      <Input
        id="full_name"
        name="full_name"
        label="Full Name"
        type="text"
        placeholder="Jane Smith"
        required
        autoComplete="name"
        disabled={isPending}
      />

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

      <div className="space-y-1.5">
        <Input
          id="password"
          name="password"
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          required
          autoComplete="new-password"
          minLength={8}
          disabled={isPending}
        />
        <p className="text-xs text-gray-400">
          Minimum 8 characters. Use a mix of letters and numbers.
        </p>
      </div>

      {/* Show referral code field openly if not pre-filled */}
      {!referralCode && (
        <div className="space-y-1.5">
          <Input
            id="referral_code"
            name="referral_code"
            label="Referral Code (optional)"
            type="text"
            placeholder="e.g. AB12CD34"
            autoComplete="off"
            disabled={isPending}
          />
          <p className="text-xs text-gray-400">
            Have a friend&apos;s referral code? Enter it here.
          </p>
        </div>
      )}

      <div className="flex items-start gap-3 pt-1">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          required
          disabled={isPending}
          className="mt-0.5 w-4 h-4 accent-blue-accent cursor-pointer flex-shrink-0"
        />
        <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
          I agree to the{" "}
          <Link href="/terms" className="text-blue-accent hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-blue-accent hover:underline">
            Privacy Policy
          </Link>
        </label>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={isPending}
        disabled={isPending}
      >
        {isPending ? "Creating your account…" : "Create My Account →"}
      </Button>

      <p className="text-center text-sm text-gray-500">
        Already a member?{" "}
        <Link href="/login" className="text-blue-accent font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

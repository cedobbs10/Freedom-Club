"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type AuthError } from "@/app/actions/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface LoginFormProps {
  next: string;
  linkExpired: boolean;
}

export default function LoginForm({ next, linkExpired }: LoginFormProps) {
  const [error, action, isPending] = useActionState<AuthError | null, FormData>(
    signIn,
    null
  );

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      {/* Expired link warning */}
      {linkExpired && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg px-4 py-3">
          Your link has expired or is invalid. Please sign in below.
        </div>
      )}

      {/* Auth error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error.message}
        </div>
      )}

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
          placeholder="Your password"
          required
          autoComplete="current-password"
          disabled={isPending}
        />
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-accent hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={isPending}
        disabled={isPending}
      >
        {isPending ? "Signing in…" : "Sign In →"}
      </Button>

      <p className="text-center text-sm text-gray-500">
        Not a member yet?{" "}
        <Link href="/signup" className="text-blue-accent font-medium hover:underline">
          Join Freedom Club
        </Link>
      </p>
    </form>
  );
}

"use client";

/**
 * Browser-side Stripe.js loader — singleton so the script loads once.
 * Import ONLY in Client Components that need to redirect to Stripe Checkout.
 */
import { loadStripe } from "@stripe/stripe-js";

let stripePromise: ReturnType<typeof loadStripe>;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
  }
  return stripePromise;
}

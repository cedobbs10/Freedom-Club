/**
 * Server-side Stripe client.
 * Import ONLY in Route Handlers and Server Actions — never in Client Components.
 */
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  typescript: true,
  // Identify our platform in Stripe logs
  appInfo: {
    name: "Freedom Club",
    version: "1.0.0",
  },
});

/**
 * Stripe Price IDs.
 * Create these in your Stripe dashboard → Products → Add product.
 * Then add the Price IDs to .env.local.
 */
export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY ?? "",
  annual:  process.env.STRIPE_PRICE_ANNUAL  ?? "",
} as const;

export type StripePlan = keyof typeof STRIPE_PRICES;

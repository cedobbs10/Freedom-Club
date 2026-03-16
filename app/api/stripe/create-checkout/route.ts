import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PRICES } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Request body ──────────────────────────────────────────────────────────
    const body = await request.json();
    const plan = (body.plan === "annual" ? "annual" : "monthly") as
      | "monthly"
      | "annual";

    const priceId = plan === "annual" ? STRIPE_PRICES.annual : STRIPE_PRICES.monthly;

    if (!priceId) {
      return NextResponse.json(
        { error: `Stripe price ID for "${plan}" plan is not configured.` },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // ── Retrieve or create Stripe customer (idempotent) ───────────────────────
    const admin = createAdminClient();

    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id, referral_code, referred_by")
      .eq("id", user.id)
      .single();

    let stripeCustomerId = profile?.stripe_customer_id ?? null;

    if (!stripeCustomerId) {
      // Create a new Stripe customer and persist it immediately so concurrent
      // requests don't create duplicates
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });

      stripeCustomerId = customer.id;

      await admin
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", user.id);
    } else {
      // Verify the customer still exists in Stripe (could have been deleted)
      try {
        const existing = await stripe.customers.retrieve(stripeCustomerId);
        if (existing.deleted) {
          const recreated = await stripe.customers.create({
            email: user.email,
            metadata: { supabase_user_id: user.id },
          });
          stripeCustomerId = recreated.id;
          await admin
            .from("profiles")
            .update({ stripe_customer_id: stripeCustomerId })
            .eq("id", user.id);
        }
      } catch {
        // Customer not found — create fresh
        const recreated = await stripe.customers.create({
          email: user.email,
          metadata: { supabase_user_id: user.id },
        });
        stripeCustomerId = recreated.id;
        await admin
          .from("profiles")
          .update({ stripe_customer_id: stripeCustomerId })
          .eq("id", user.id);
      }
    }

    // ── Create Checkout Session ───────────────────────────────────────────────
    const session = await stripe.checkout.sessions.create(
      {
        mode: "subscription",
        customer: stripeCustomerId,
        line_items: [{ price: priceId, quantity: 1 }],

        // Pass through everything we need in the webhook
        metadata: {
          user_id:       user.id,
          plan,
          referral_code: profile?.referral_code ?? "",
          referred_by:   profile?.referred_by   ?? "",
        },

        // Also put user_id on the subscription so subscription webhooks
        // can identify the user without a DB lookup
        subscription_data: {
          metadata: {
            user_id: user.id,
            plan,
          },
        },

        success_url: `${baseUrl}/dashboard?checkout=success`,
        cancel_url:  `${baseUrl}/onboarding`,

        // Allow promo codes from Stripe dashboard
        allow_promotion_codes: true,
      },
      {
        // Idempotency key: one pending checkout per user per plan
        idempotencyKey: `checkout-${user.id}-${plan}`,
      }
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[stripe/create-checkout]", message);
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}

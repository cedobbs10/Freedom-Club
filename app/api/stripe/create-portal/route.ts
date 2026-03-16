import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Creates a Stripe Customer Portal session.
 *
 * The portal lets members:
 * - Update their payment method
 * - Switch between monthly and annual plans
 * - Cancel their subscription
 * - View billing history
 *
 * Stripe handles all of this — no custom UI needed.
 */
export async function POST(request: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Get Stripe customer id ───────────────────────────────────────────────
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No active subscription found." },
        { status: 404 }
      );
    }

    // ── Determine return URL ─────────────────────────────────────────────────
    const body        = await request.json().catch(() => ({}));
    const returnPath  = (body as { returnPath?: string }).returnPath ?? "/dashboard";
    const baseUrl     = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const returnUrl   = `${baseUrl}${returnPath}`;

    // ── Create portal session ────────────────────────────────────────────────
    const session = await stripe.billingPortal.sessions.create({
      customer:   profile.stripe_customer_id,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[stripe/create-portal]", message);
    return NextResponse.json(
      { error: "Failed to open billing portal." },
      { status: 500 }
    );
  }
}

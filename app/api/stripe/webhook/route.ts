import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { isEligibleForAnnualFee, REFERRAL_FEE_DOLLARS } from "@/lib/utils/referral-tracking";
import type Stripe from "stripe";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(event: string, data: Record<string, unknown>) {
  console.log(`[stripe/webhook] ${event}`, JSON.stringify(data));
}

/**
 * Looks up a Supabase user id from a Stripe customer id.
 * Fallback for subscription events where metadata.user_id may not be set
 * (e.g. subscriptions created outside of our checkout flow).
 */
async function getUserIdFromCustomer(
  customerId: string
): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.id ?? null;
}

// ─── Route ────────────────────────────────────────────────────────────────────

// Tell Next.js NOT to parse the body — Stripe needs the raw bytes to verify signature
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig  = request.headers.get("stripe-signature");

  if (!sig) {
    log("error", { message: "Missing stripe-signature header" });
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // ── Verify signature ────────────────────────────────────────────────────────
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log("signature_failed", { message });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  log("received", { type: event.type, id: event.id });

  const admin = createAdminClient();

  try {
    switch (event.type) {

      // ── checkout.session.completed ─────────────────────────────────────────
      // Fires once when the customer completes payment.
      // This is where we activate the subscription and credit the referrer.
      case "checkout.session.completed": {
        const session   = event.data.object as Stripe.Checkout.Session;
        const userId    = session.metadata?.user_id;
        const plan      = session.metadata?.plan as "monthly" | "annual" | undefined;
        const referredBy = session.metadata?.referred_by || null; // profile id of referrer

        if (!userId) {
          log("checkout.no_user_id", { sessionId: session.id });
          break;
        }

        // Idempotency check — skip if already activated
        const { data: current } = await admin
          .from("profiles")
          .select("subscription_status")
          .eq("id", userId)
          .single();

        if (current?.subscription_status === "active") {
          log("checkout.already_active", { userId });
          break;
        }

        // Activate the subscription
        await admin
          .from("profiles")
          .update({
            subscription_status: "active",
            subscription_tier:   plan ?? "monthly",
            stripe_customer_id:  session.customer as string,
          })
          .eq("id", userId);

        log("checkout.activated", { userId, plan });

        // Atomically record the referral + credit $20 to the referrer.
        // record_referral_atomic is idempotent — safe if webhook fires twice.
        if (referredBy) {
          const { data: result, error: rpcError } = await admin.rpc(
            "record_referral_atomic",
            {
              p_referrer_id: referredBy,
              p_referred_id: userId,
              p_fee_amount:  REFERRAL_FEE_DOLLARS,
            }
          );

          if (rpcError) {
            log("checkout.referral_error", { error: rpcError.message });
          } else {
            log("checkout.referral_credited", {
              referrerId: referredBy,
              userId,
              result,
            });
          }
        }

        break;
      }

      // ── customer.subscription.updated ─────────────────────────────────────
      // Fires on any subscription change: renewal, plan change, trial end, etc.
      case "customer.subscription.updated": {
        const sub    = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id
          ?? await getUserIdFromCustomer(sub.customer as string);

        if (!userId) {
          log("subscription.updated.no_user", { customerId: sub.customer });
          break;
        }

        // Map Stripe statuses to our enum
        // Stripe: active | past_due | canceled | incomplete | trialing | paused
        // Ours:   active | past_due | canceled | free
        const statusMap: Record<string, string> = {
          active:     "active",
          trialing:   "active",
          past_due:   "past_due",
          canceled:   "canceled",
          incomplete: "past_due",
          paused:     "canceled",
        };
        const newStatus = statusMap[sub.status] ?? "canceled";

        await admin
          .from("profiles")
          .update({ subscription_status: newStatus })
          .eq("id", userId);

        log("subscription.updated", { userId, status: sub.status, mapped: newStatus });
        break;
      }

      // ── customer.subscription.deleted ─────────────────────────────────────
      // Fires when a subscription ends (canceled and billing period expires).
      case "customer.subscription.deleted": {
        const sub    = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id
          ?? await getUserIdFromCustomer(sub.customer as string);

        if (!userId) {
          log("subscription.deleted.no_user", { customerId: sub.customer });
          break;
        }

        await admin
          .from("profiles")
          .update({ subscription_status: "canceled" })
          .eq("id", userId);

        // Mark any active referrals for this user as expired so no more
        // annual referral fees are generated next cycle
        await admin
          .from("referrals")
          .update({ status: "expired" })
          .eq("referred_id", userId)
          .eq("status", "active");

        log("subscription.deleted", { userId });
        break;
      }

      // ── invoice.payment_failed ─────────────────────────────────────────────
      // Fires when a renewal charge fails. Stripe will retry automatically
      // but we mark the account past_due so the UI can prompt an update.
      case "invoice.payment_failed": {
        const invoice    = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const userId     = await getUserIdFromCustomer(customerId);

        if (!userId) {
          log("payment_failed.no_user", { customerId });
          break;
        }

        await admin
          .from("profiles")
          .update({ subscription_status: "past_due" })
          .eq("id", userId);

        log("payment_failed", {
          userId,
          invoiceId:   invoice.id,
          attemptCount: invoice.attempt_count,
        });
        break;
      }

      // ── invoice.paid ───────────────────────────────────────────────────────
      // Fires on every successful renewal. Re-activate if previously past_due,
      // and generate annual referral fees for active referrers.
      case "invoice.paid": {
        const invoice    = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const userId     = await getUserIdFromCustomer(customerId);

        if (!userId) break;

        // Re-activate if they were past_due and payment went through
        const { data: profile } = await admin
          .from("profiles")
          .select("subscription_status")
          .eq("id", userId)
          .single();

        if (profile?.subscription_status === "past_due") {
          await admin
            .from("profiles")
            .update({ subscription_status: "active" })
            .eq("id", userId);
          log("invoice.paid.reactivated", { userId });
        }

        // Credit annual referral fee — only when 365 days have elapsed since
        // the last payment (or since activation). This is billing-interval-safe:
        // monthly subscribers renew 12×/year but only receive 1 fee credit/year.
        const billingReason = (invoice as Stripe.Invoice & { billing_reason?: string })
          .billing_reason;

        if (billingReason === "subscription_cycle") {
          const { data: referral } = await admin
            .from("referrals")
            .select("id, referrer_id, created_at, last_reward_paid_at")
            .eq("referred_id", userId)
            .eq("status", "active")
            .maybeSingle();

          if (referral && isEligibleForAnnualFee(
            referral.created_at,
            referral.last_reward_paid_at
          )) {
            // Insert earnings record
            await admin.from("earnings").insert({
              user_id:     referral.referrer_id,
              type:        "referral",
              amount:      REFERRAL_FEE_DOLLARS,
              description: "Annual referral renewal fee",
              status:      "approved",
            });

            // Increment fee total + update last_reward_paid_at atomically
            await admin.rpc("increment_referral_fee", {
              p_referral_id: referral.id,
              p_amount:      REFERRAL_FEE_DOLLARS,
            });

            log("invoice.paid.referral_renewed", {
              referrerId: referral.referrer_id,
              userId,
              referralId: referral.id,
            });
          } else if (referral) {
            log("invoice.paid.referral_fee_not_due", {
              referralId: referral.id,
              lastPaid: referral.last_reward_paid_at,
            });
          }
        }

        break;
      }

      default:
        log("unhandled", { type: event.type });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log("handler_error", { type: event.type, message });
    // Return 500 so Stripe retries the webhook
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

import { NextRequest, NextResponse } from "next/server";
import { processAnnualReferralFees } from "@/app/actions/referrals";

/**
 * Monthly cron job: credits annual referral fees for all eligible referrals.
 *
 * The Stripe webhook handles fees in real-time when invoices are paid.
 * This cron is a safety net for:
 *   - Webhooks that failed and weren't retried
 *   - Referrals created before the webhook was deployed
 *   - Any edge cases in billing timing
 *
 * Schedule: run on the 1st of every month.
 *
 * To schedule on Vercel (vercel.json):
 *   {
 *     "crons": [{ "path": "/api/cron/referral-fees", "schedule": "0 0 1 * *" }]
 *   }
 *
 * Protected by CRON_SECRET so it can't be triggered by anyone on the internet.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Require secret in production
  if (
    process.env.NODE_ENV === "production" &&
    (!cronSecret || authHeader !== `Bearer ${cronSecret}`)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const credited = await processAnnualReferralFees();
    console.log(`[cron/referral-fees] Credited ${credited} annual referral fee(s)`);
    return NextResponse.json({ ok: true, credited });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/referral-fees]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

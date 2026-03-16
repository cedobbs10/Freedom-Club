import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getReferralStats } from "@/app/actions/referrals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DashboardLayout from "@/components/DashboardLayout";
import ReferralBanner from "@/components/ReferralBanner";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Fetch referral stats for the banner (best-effort — don't block render on failure)
  let referralUrl: string | null = null;
  let referralCode: string | null = null;
  let activeReferrals = 0;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const stats = await getReferralStats(user.id);
      referralUrl     = stats?.referralUrl    ?? null;
      referralCode    = stats?.referralCode   ?? null;
      activeReferrals = stats?.activeReferrals ?? 0;
    }
  } catch {
    // Banner is non-critical — silently skip if fetch fails
  }

  return (
    <DashboardLayout activeTab="home">
      {/* Referral banner — dismissable, reappears weekly */}
      {referralUrl && referralCode && (
        <ReferralBanner
          referralUrl={referralUrl}
          referralCode={referralCode}
          activeReferrals={activeReferrals}
        />
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-navy">Welcome back!</h1>
        <p className="text-gray-500 mt-1">Here&apos;s a summary of your account.</p>
      </div>

      {/* Earnings summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <Card>
          <CardHeader>
            <p className="text-sm text-gray-500 font-medium">Video Earnings (This Month)</p>
            <p className="text-3xl font-extrabold text-navy mt-1">$0.00</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">0 of 10 videos watched</p>
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-accent rounded-full" style={{ width: "0%" }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm text-gray-500 font-medium">Referral Earnings (Annual)</p>
            <p className="text-3xl font-extrabold text-navy mt-1">$0.00</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">0 active referrals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm text-gray-500 font-medium">Total Lifetime Earnings</p>
            <p className="text-3xl font-extrabold text-navy mt-1">$0.00</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Member since today</p>
          </CardContent>
        </Card>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card hover>
          <CardHeader>
            <div className="text-3xl mb-2">🎬</div>
            <CardTitle>Watch Videos &amp; Earn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You have 10 videos available this month. Each one pays you $1.00.</p>
            <Link href="/dashboard/videos">
              <Button className="w-full">Watch Now</Button>
            </Link>
          </CardContent>
        </Card>

        <Card hover>
          <CardHeader>
            <div className="text-3xl mb-2">👥</div>
            <CardTitle>Invite Friends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Share your referral link. Each friend who joins earns you $20/year.</p>
            <Link href="/dashboard/referrals">
              <Button variant="outline" className="w-full">Get My Referral Link</Button>
            </Link>
          </CardContent>
        </Card>

        <Card hover>
          <CardHeader>
            <div className="text-3xl mb-2">🔒</div>
            <CardTitle>Complete Your Anonymous Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              A complete profile unlocks manufacturer rebates and direct pricing offers.
              Takes 5 minutes. No personal data shared.
            </p>
            <Link href="/dashboard/profile">
              <Button variant="outline" className="w-full">Complete Profile</Button>
            </Link>
          </CardContent>
        </Card>

        <Card hover>
          <CardHeader>
            <div className="text-3xl mb-2">🏷️</div>
            <CardTitle>Browse Member Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Unlock instant rebates and D2C pricing from top consumer brands — even when you
              shop at Amazon or Walmart.
            </p>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

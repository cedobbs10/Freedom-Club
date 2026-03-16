import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getReferralStats,
  getReferralList,
  getReferralLeaderboardPosition,
  getMonthlyReferralEarnings,
} from "@/app/actions/referrals";
import DashboardLayout from "@/components/DashboardLayout";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import ReferralDashboardClient from "./ReferralDashboardClient";

export const dynamic = "force-dynamic";

export default async function ReferralDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/referrals");

  // Fetch all data in parallel
  const [stats, referrals, leaderboard, chart] = await Promise.all([
    getReferralStats(user.id),
    getReferralList(user.id),
    getReferralLeaderboardPosition(user.id),
    getMonthlyReferralEarnings(user.id),
  ]);

  if (!stats) redirect("/dashboard");

  return (
    <DashboardLayout activeTab="referrals">
      <SubscriptionGuard>
        <ReferralDashboardClient
          stats={stats}
          referrals={referrals}
          leaderboard={leaderboard}
          chart={chart}
        />
      </SubscriptionGuard>
    </DashboardLayout>
  );
}

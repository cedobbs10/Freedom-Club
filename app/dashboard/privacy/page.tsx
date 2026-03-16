import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPrivacyPageData } from "@/app/actions/privacy";
import DashboardLayout from "@/components/DashboardLayout";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import PrivacyClient from "./PrivacyClient";

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/privacy");

  const data = await getPrivacyPageData();
  if (!data) redirect("/dashboard");

  return (
    <DashboardLayout activeTab="profile">
      <SubscriptionGuard>
        <PrivacyClient
          queryLog={data.queryLog}
          hasAnonymousData={data.hasAnonymousData}
        />
      </SubscriptionGuard>
    </DashboardLayout>
  );
}

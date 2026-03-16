import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFullProfile } from "@/app/actions/profile";
import DashboardLayout from "@/components/DashboardLayout";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/profile");

  const profile = await getFullProfile();
  if (!profile) redirect("/dashboard");

  return (
    <DashboardLayout activeTab="profile">
      <SubscriptionGuard>
        <ProfileClient profile={profile} />
      </SubscriptionGuard>
    </DashboardLayout>
  );
}

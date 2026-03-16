import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingWizard from "./OnboardingWizard";

export default async function OnboardingPage() {
  const supabase = await createClient();

  // Verify the user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch their referral code
  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code, subscription_status")
    .eq("id", user.id)
    .single();

  // If they already have an active subscription, skip onboarding
  if (profile?.subscription_status === "active") {
    redirect("/dashboard");
  }

  const referralCode = profile?.referral_code ?? "XXXXXXXX";

  return <OnboardingWizard referralCode={referralCode} />;
}

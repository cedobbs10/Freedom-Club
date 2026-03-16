"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProfileError = { message: string };

export interface AnonymousProfileData {
  age_range: string;
  income_range: string;
  sex: string;
  marital_status: string;
  education_level: string;
  zip_code: string;
  interests: string[];
}

export async function saveAnonymousProfile(
  data: AnonymousProfileData
): Promise<ProfileError | { success: true }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be signed in to save your profile." };
  }

  // Validate zip code
  if (!/^\d{5}$/.test(data.zip_code)) {
    return { message: "Please enter a valid 5-digit zip code." };
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("anonymous_profiles")
    .upsert(
      {
        user_id: user.id,
        age_range: data.age_range,
        income_range: data.income_range,
        sex: data.sex,
        marital_status: data.marital_status,
        education_level: data.education_level,
        zip_code: data.zip_code,
        interests: data.interests,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) {
    return { message: "Failed to save your profile. Please try again." };
  }

  return { success: true };
}

export async function getOnboardingData(): Promise<{
  referralCode: string | null;
  hasAnonymousProfile: boolean;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { referralCode: null, hasAnonymousProfile: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", user.id)
    .single();

  const { data: anonProfile } = await supabase
    .from("anonymous_profiles")
    .select("zip_code")
    .eq("user_id", user.id)
    .single();

  return {
    referralCode: profile?.referral_code ?? null,
    hasAnonymousProfile: !!anonProfile?.zip_code,
  };
}

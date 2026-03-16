"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProfileError = { message: string };

export interface AnonymousProfileData {
  age_range:       string;
  income_range:    string;
  sex:             string;
  marital_status:  string;
  education_level: string;
  zip_code:        string;
  interests:       string[];
}

// ─── Field metadata (drives completion + labels) ──────────────────────────────

export const PROFILE_FIELDS = [
  { key: "age_range",       label: "Age Range"        },
  { key: "income_range",    label: "Income Range"     },
  { key: "sex",             label: "Sex"              },
  { key: "marital_status",  label: "Marital Status"   },
  { key: "education_level", label: "Education Level"  },
  { key: "zip_code",        label: "Zip Code"         },
  { key: "interests",       label: "Interests"        },
] as const;

// ─── ProfileCompletion ─────────────────────────────────────────────────────────

export interface ProfileCompletion {
  percentage:     number;
  completedCount: number;
  totalCount:     number;
  missingFields:  string[];
  isComplete:     boolean;
}

/** Pure function — safe to call on the client too. */
export function computeProfileCompletion(
  profile: Partial<AnonymousProfileData> | null
): ProfileCompletion {
  const totalCount = PROFILE_FIELDS.length; // 7

  if (!profile) {
    return {
      percentage:     0,
      completedCount: 0,
      totalCount,
      missingFields:  PROFILE_FIELDS.map((f) => f.label),
      isComplete:     false,
    };
  }

  let completedCount = 0;
  const missingFields: string[] = [];

  for (const field of PROFILE_FIELDS) {
    const value = profile[field.key as keyof AnonymousProfileData];
    const filled =
      field.key === "interests"
        ? Array.isArray(value) && (value as string[]).length > 0
        : typeof value === "string" && value.trim() !== "";

    if (filled) completedCount++;
    else missingFields.push(field.label);
  }

  return {
    percentage:     Math.round((completedCount / totalCount) * 100),
    completedCount,
    totalCount,
    missingFields,
    isComplete:     completedCount === totalCount,
  };
}

// ─── getFullProfile ───────────────────────────────────────────────────────────

export interface FullProfile {
  fullName:  string | null;
  email:     string;
  createdAt: string;
  anonymous: AnonymousProfileData | null;
}

export async function getFullProfile(): Promise<FullProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();

  const [profileRes, anonRes] = await Promise.all([
    admin
      .from("profiles")
      .select("full_name, email, created_at")
      .eq("id", user.id)
      .single(),
    admin
      .from("anonymous_profiles")
      .select("age_range, income_range, sex, marital_status, education_level, zip_code, interests")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!profileRes.data) return null;

  const a = anonRes.data;
  return {
    fullName:  profileRes.data.full_name ?? null,
    email:     profileRes.data.email,
    createdAt: profileRes.data.created_at,
    anonymous: a
      ? {
          age_range:       a.age_range       ?? "",
          income_range:    a.income_range    ?? "",
          sex:             a.sex             ?? "",
          marital_status:  a.marital_status  ?? "",
          education_level: a.education_level ?? "",
          zip_code:        a.zip_code        ?? "",
          interests:       (a.interests as string[]) ?? [],
        }
      : null,
  };
}

// ─── updateAccountProfile ─────────────────────────────────────────────────────

export async function updateAccountProfile(data: {
  fullName: string;
}): Promise<{ success: true } | ProfileError> {
  const name = data.fullName.trim();
  if (!name) return { message: "Name cannot be empty." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "Not signed in." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ full_name: name })
    .eq("id", user.id);

  if (error) return { message: "Failed to update name. Please try again." };

  // Keep auth metadata in sync (used by handle_new_user trigger on future signups)
  await supabase.auth.updateUser({ data: { full_name: name } });

  return { success: true };
}

// ─── changePassword ───────────────────────────────────────────────────────────

export async function changePassword(
  newPassword: string,
  confirmPassword: string
): Promise<{ success: true } | ProfileError> {
  if (newPassword.length < 8)
    return { message: "Password must be at least 8 characters." };
  if (newPassword !== confirmPassword)
    return { message: "Passwords do not match." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) return { message: error.message };
  return { success: true };
}

// ─── saveAnonymousProfile ─────────────────────────────────────────────────────

export async function saveAnonymousProfile(
  data: AnonymousProfileData
): Promise<ProfileError | { success: true }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "You must be signed in to save your profile." };

  if (data.zip_code && !/^\d{5}$/.test(data.zip_code))
    return { message: "Please enter a valid 5-digit zip code." };

  const admin = createAdminClient();
  const { error } = await admin.from("anonymous_profiles").upsert(
    {
      user_id:         user.id,
      age_range:       data.age_range       || null,
      income_range:    data.income_range    || null,
      sex:             data.sex             || null,
      marital_status:  data.marital_status  || null,
      education_level: data.education_level || null,
      zip_code:        data.zip_code        || null,
      interests:       data.interests.length ? data.interests : null,
      updated_at:      new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) return { message: "Failed to save your profile. Please try again." };
  return { success: true };
}

// ─── getOnboardingData ────────────────────────────────────────────────────────

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
    referralCode:       profile?.referral_code ?? null,
    hasAnonymousProfile: !!anonProfile?.zip_code,
  };
}

// ─── getAggregateProfileStats ─────────────────────────────────────────────────
// Manufacturer-facing: returns de-identified segment counts.
// e.g. "47 active members aged 25-34 in zip 334xx interested in Technology"

export interface AggregateSegment {
  age_range:    string;
  income_range: string;
  sex:          string;
  count:        number;
}

export interface AggregateSummary {
  totalActiveMembers: number;
  segments:           AggregateSegment[];
  filters: {
    zipPrefix:  string | null;
    interest:   string | null;
  };
}

export async function getAggregateProfileStats(filters?: {
  zipPrefix?: string;  // e.g. "334" matches all 334xx zip codes
  interest?:  string;  // e.g. "Technology"
}): Promise<AggregateSummary> {
  const admin = createAdminClient();

  // Fetch all anonymous profiles for active subscribers
  let query = admin
    .from("anonymous_profiles")
    .select(`
      age_range,
      income_range,
      sex,
      zip_code,
      interests,
      profile:profiles!anonymous_profiles_user_id_fkey (subscription_status)
    `);

  if (filters?.zipPrefix) {
    // Supabase doesn't support LIKE natively in JS client — filter in JS
  }

  const { data: rows } = await query;
  if (!rows?.length) {
    return {
      totalActiveMembers: 0,
      segments: [],
      filters: { zipPrefix: filters?.zipPrefix ?? null, interest: filters?.interest ?? null },
    };
  }

  // Filter to active subscribers + apply optional filters
  const filtered = rows.filter((r) => {
    const profile = r.profile as { subscription_status: string } | null;
    if (profile?.subscription_status !== "active") return false;
    if (filters?.zipPrefix && !(r.zip_code ?? "").startsWith(filters.zipPrefix)) return false;
    if (filters?.interest && !((r.interests as string[]) ?? []).includes(filters.interest)) return false;
    if (!r.age_range || !r.income_range) return false;
    return true;
  });

  // Aggregate by (age_range, income_range, sex)
  const map = new Map<string, AggregateSegment>();
  for (const r of filtered) {
    const key = `${r.age_range}|${r.income_range}|${r.sex ?? "prefer_not_say"}`;
    if (map.has(key)) {
      map.get(key)!.count++;
    } else {
      map.set(key, {
        age_range:    r.age_range  as string,
        income_range: r.income_range as string,
        sex:          (r.sex ?? "prefer_not_say") as string,
        count:        1,
      });
    }
  }

  const segments = [...map.values()].sort((a, b) => b.count - a.count);

  return {
    totalActiveMembers: filtered.length,
    segments,
    filters: { zipPrefix: filters?.zipPrefix ?? null, interest: filters?.interest ?? null },
  };
}

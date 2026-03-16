export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";
export type SubscriptionInterval = "month" | "year";

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  referral_code: string;
  referred_by: string | null;
  subscription_status: SubscriptionStatus | null;
  subscription_interval: SubscriptionInterval | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnonymousProfile {
  id: string;
  user_id: string;
  age_range: AgeRange | null;
  income_range: IncomeRange | null;
  gender: Gender | null;
  marital_status: MaritalStatus | null;
  education_level: EducationLevel | null;
  zip_code: string | null;
  completed: boolean;
  updated_at: string;
}

export type AgeRange =
  | "18-24"
  | "25-34"
  | "35-44"
  | "45-54"
  | "55-64"
  | "65+";

export type IncomeRange =
  | "under_30k"
  | "30k_50k"
  | "50k_75k"
  | "75k_100k"
  | "100k_150k"
  | "150k_plus";

export type Gender = "male" | "female" | "prefer_not_to_say";

export type MaritalStatus =
  | "single"
  | "married"
  | "divorced"
  | "widowed"
  | "prefer_not_to_say";

export type EducationLevel =
  | "high_school"
  | "some_college"
  | "associates"
  | "bachelors"
  | "masters"
  | "doctorate"
  | "prefer_not_to_say";

export interface VideoAd {
  id: string;
  brand_name: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  reward_cents: number; // 100 = $1.00
  is_active: boolean;
  created_at: string;
}

export interface VideoView {
  id: string;
  user_id: string;
  video_id: string;
  watched_at: string;
  reward_paid: boolean;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  created_at: string;
  annual_reward_paid: boolean;
  last_reward_paid_at: string | null;
}

export interface EarningsSummary {
  video_earnings_cents: number;
  referral_earnings_cents: number;
  total_earnings_cents: number;
  videos_watched_this_month: number;
  referrals_total: number;
}

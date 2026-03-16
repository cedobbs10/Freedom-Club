/**
 * Supabase database types.
 *
 * To regenerate from your live schema after running the migration:
 *
 *   npx supabase gen types typescript \
 *     --project-id YOUR_PROJECT_ID \
 *     --schema public \
 *     > types/database.ts
 *
 * Until then this stub keeps TypeScript happy.
 * The generated file will replace everything below automatically.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string;
          referral_code: string;
          referred_by: string | null;
          subscription_status: "free" | "active" | "canceled" | "past_due";
          subscription_tier: string | null;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email: string;
          referral_code: string;
          referred_by?: string | null;
          subscription_status?: "free" | "active" | "canceled" | "past_due";
          subscription_tier?: string | null;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          email?: string;
          referral_code?: string;
          referred_by?: string | null;
          subscription_status?: "free" | "active" | "canceled" | "past_due";
          subscription_tier?: string | null;
          stripe_customer_id?: string | null;
          updated_at?: string;
        };
      };
      anonymous_profiles: {
        Row: {
          id: string;
          user_id: string;
          age_range: string | null;
          income_range: string | null;
          sex: string | null;
          marital_status: string | null;
          education_level: string | null;
          zip_code: string | null;
          interests: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          age_range?: string | null;
          income_range?: string | null;
          sex?: string | null;
          marital_status?: string | null;
          education_level?: string | null;
          zip_code?: string | null;
          interests?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          age_range?: string | null;
          income_range?: string | null;
          sex?: string | null;
          marital_status?: string | null;
          education_level?: string | null;
          zip_code?: string | null;
          interests?: string[] | null;
          updated_at?: string;
        };
      };
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referred_id: string;
          status: "pending" | "active" | "expired";
          referral_fee_earned: number;
          paid_out: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referred_id: string;
          status?: "pending" | "active" | "expired";
          referral_fee_earned?: number;
          paid_out?: boolean;
          created_at?: string;
        };
        Update: {
          status?: "pending" | "active" | "expired";
          referral_fee_earned?: number;
          paid_out?: boolean;
        };
      };
      video_ads: {
        Row: {
          id: string;
          brand_name: string;
          title: string;
          description: string | null;
          video_url: string;
          thumbnail_url: string | null;
          reward_amount: number;
          target_age_ranges: string[] | null;
          target_income_ranges: string[] | null;
          target_zip_codes: string[] | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          brand_name: string;
          title: string;
          description?: string | null;
          video_url: string;
          thumbnail_url?: string | null;
          reward_amount?: number;
          target_age_ranges?: string[] | null;
          target_income_ranges?: string[] | null;
          target_zip_codes?: string[] | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          brand_name?: string;
          title?: string;
          description?: string | null;
          video_url?: string;
          thumbnail_url?: string | null;
          reward_amount?: number;
          target_age_ranges?: string[] | null;
          target_income_ranges?: string[] | null;
          target_zip_codes?: string[] | null;
          is_active?: boolean;
        };
      };
      video_views: {
        Row: {
          id: string;
          user_id: string;
          video_ad_id: string;
          watched_at: string;
          earned_amount: number;
          month_year: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_ad_id: string;
          watched_at?: string;
          earned_amount?: number;
          month_year: string;
        };
        Update: never;
      };
      earnings: {
        Row: {
          id: string;
          user_id: string;
          type: "referral" | "video" | "survey" | "rebate";
          amount: number;
          description: string | null;
          status: "pending" | "approved" | "paid";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "referral" | "video" | "survey" | "rebate";
          amount: number;
          description?: string | null;
          status?: "pending" | "approved" | "paid";
          created_at?: string;
        };
        Update: {
          status?: "pending" | "approved" | "paid";
          description?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      videos_watched_this_month: {
        Args: { p_user_id: string; p_month_year: string };
        Returns: number;
      };
    };
    Enums: {
      subscription_status_enum: "free" | "active" | "canceled" | "past_due";
      age_range_enum: "18-24" | "25-34" | "35-44" | "45-54" | "55-64" | "65+";
      income_range_enum: "under_30k" | "30k_50k" | "50k_75k" | "75k_100k" | "100k_150k" | "150k_plus";
      sex_enum: "male" | "female" | "other" | "prefer_not_say";
      marital_status_enum: "single" | "married" | "divorced" | "widowed" | "prefer_not_say";
      education_level_enum: "high_school" | "some_college" | "associates" | "bachelors" | "masters" | "doctorate" | "prefer_not_say";
      referral_status_enum: "pending" | "active" | "expired";
      earning_type_enum: "referral" | "video" | "survey" | "rebate";
      earning_status_enum: "pending" | "approved" | "paid";
    };
  };
}

-- ============================================================
-- Freedom Club — Supabase Database Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Enum Types ────────────────────────────────────────────────────────────────
create type subscription_status_enum as enum (
  'free', 'active', 'canceled', 'past_due'
);

create type age_range_enum as enum (
  '18-24', '25-34', '35-44', '45-54', '55-64', '65+'
);

create type income_range_enum as enum (
  'under_30k', '30k_50k', '50k_75k', '75k_100k', '100k_150k', '150k_plus'
);

create type sex_enum as enum (
  'male', 'female', 'other', 'prefer_not_say'
);

create type marital_status_enum as enum (
  'single', 'married', 'divorced', 'widowed', 'prefer_not_say'
);

create type education_level_enum as enum (
  'high_school', 'some_college', 'associates', 'bachelors',
  'masters', 'doctorate', 'prefer_not_say'
);

create type referral_status_enum as enum (
  'pending', 'active', 'expired'
);

create type earning_type_enum as enum (
  'referral', 'video', 'survey', 'rebate'
);

create type earning_status_enum as enum (
  'pending', 'approved', 'paid'
);

-- ── 1. profiles ───────────────────────────────────────────────────────────────
-- One row per user, extends auth.users.
-- id matches auth.users.id exactly (no separate uuid).
create table if not exists public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  full_name             text,
  email                 text not null,
  referral_code         text not null unique,
  referred_by           uuid references public.profiles(id) on delete set null,
  subscription_status   subscription_status_enum not null default 'free',
  subscription_tier     text,                          -- 'monthly' | 'annual'
  stripe_customer_id    text unique,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Indexes
create index idx_profiles_referral_code on public.profiles(referral_code);
create index idx_profiles_referred_by   on public.profiles(referred_by);

-- ── 2. anonymous_profiles ─────────────────────────────────────────────────────
-- 7-point anonymous profile. No PII — zip only, no full address.
create table if not exists public.anonymous_profiles (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null unique references public.profiles(id) on delete cascade,
  age_range        age_range_enum,
  income_range     income_range_enum,
  sex              sex_enum,
  marital_status   marital_status_enum,
  education_level  education_level_enum,
  zip_code         char(5) check (zip_code ~ '^\d{5}$'),   -- 5-digit only
  interests        text[],                                  -- e.g. {'sports','tech','cooking'}
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Index
create index idx_anonymous_profiles_user_id on public.anonymous_profiles(user_id);

-- ── 3. referrals ──────────────────────────────────────────────────────────────
create table if not exists public.referrals (
  id                  uuid primary key default uuid_generate_v4(),
  referrer_id         uuid not null references public.profiles(id) on delete cascade,
  referred_id         uuid not null unique references public.profiles(id) on delete cascade,
  status              referral_status_enum not null default 'pending',
  referral_fee_earned numeric(10, 2) not null default 0.00,
  paid_out            boolean not null default false,
  last_reward_paid_at timestamptz,                     -- null until first fee is credited
  created_at          timestamptz not null default now()
);

-- Indexes
create index idx_referrals_referrer_id on public.referrals(referrer_id);
create index idx_referrals_referred_id on public.referrals(referred_id);
create index idx_referrals_status      on public.referrals(status);

-- ── 4. video_ads ──────────────────────────────────────────────────────────────
-- Catalog of brand video ads. target_* columns let brands reach their market.
create table if not exists public.video_ads (
  id                    uuid primary key default uuid_generate_v4(),
  brand_name            text not null,
  title                 text not null,
  description           text,
  video_url             text not null,
  thumbnail_url         text,
  reward_amount         numeric(10, 2) not null default 1.00,
  target_age_ranges     age_range_enum[],    -- null = all ages
  target_income_ranges  income_range_enum[], -- null = all incomes
  target_zip_codes      text[],              -- null = nationwide
  is_active             boolean not null default true,
  created_at            timestamptz not null default now()
);

-- Index
create index idx_video_ads_is_active on public.video_ads(is_active);

-- ── 5. video_views ────────────────────────────────────────────────────────────
-- Tracks every completed view. month_year (e.g. '2024-03') drives the 10/month cap.
create table if not exists public.video_views (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  video_ad_id   uuid not null references public.video_ads(id) on delete cascade,
  watched_at    timestamptz not null default now(),
  earned_amount numeric(10, 2) not null default 1.00,
  month_year    text not null,               -- format: 'YYYY-MM', e.g. '2024-03'
  unique (user_id, video_ad_id)              -- one reward per video per user ever
);

-- Indexes
create index idx_video_views_user_id    on public.video_views(user_id);
create index idx_video_views_month_year on public.video_views(user_id, month_year); -- cap query

-- ── 6. earnings ───────────────────────────────────────────────────────────────
-- Consolidated ledger of all earnings (videos, referrals, surveys, rebates).
create table if not exists public.earnings (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        earning_type_enum not null,
  amount      numeric(10, 2) not null,
  description text,
  status      earning_status_enum not null default 'pending',
  created_at  timestamptz not null default now()
);

-- Indexes
create index idx_earnings_user_id on public.earnings(user_id);
create index idx_earnings_status  on public.earnings(user_id, status);

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.anonymous_profiles enable row level security;
alter table public.referrals         enable row level security;
alter table public.video_ads         enable row level security;
alter table public.video_views       enable row level security;
alter table public.earnings          enable row level security;

-- profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- anonymous_profiles
create policy "Users can view own anonymous profile"
  on public.anonymous_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own anonymous profile"
  on public.anonymous_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own anonymous profile"
  on public.anonymous_profiles for update
  using (auth.uid() = user_id);

-- referrals: referrers see referrals they created
create policy "Referrers can view their referrals"
  on public.referrals for select
  using (auth.uid() = referrer_id);

-- video_ads: any authenticated user can browse active ads
create policy "Authenticated users can view active video ads"
  on public.video_ads for select
  using (auth.uid() is not null and is_active = true);

-- video_views
create policy "Users can view own video views"
  on public.video_views for select
  using (auth.uid() = user_id);

create policy "Users can insert own video views"
  on public.video_views for insert
  with check (auth.uid() = user_id);

-- earnings
create policy "Users can view own earnings"
  on public.earnings for select
  using (auth.uid() = user_id);

-- ── Helper: view count this month ─────────────────────────────────────────────
-- Call this to check if a user has hit the 10-video cap before crediting a view.
create or replace function public.videos_watched_this_month(p_user_id uuid, p_month_year text)
returns integer
language sql stable security definer
as $$
  select count(*)::integer
  from public.video_views
  where user_id = p_user_id
    and month_year = p_month_year;
$$;

-- ── Referral code generator ───────────────────────────────────────────────────
-- Unambiguous charset: excludes 0/O (look alike), 1/I/L (look alike)
-- 31 characters → 31^8 ≈ 852 billion combinations
create or replace function public.generate_referral_code()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  charset  text    := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  code     text    := '';
  i        integer;
  attempts integer := 0;
  max_attempts integer := 20;
begin
  loop
    code := '';
    -- Build an 8-character code by sampling the charset randomly
    for i in 1..8 loop
      code := code || substr(charset, floor(random() * length(charset) + 1)::integer, 1);
    end loop;

    -- Check uniqueness against existing profiles
    if not exists (
      select 1 from public.profiles where referral_code = code
    ) then
      return code;
    end if;

    attempts := attempts + 1;
    if attempts >= max_attempts then
      raise exception 'Could not generate unique referral code after % attempts', max_attempts;
    end if;
  end loop;
end;
$$;

-- ── Auto-create profile on signup ─────────────────────────────────────────────
-- Fires after every new auth.users row to create the matching profile
-- and an empty anonymous_profiles row.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_code text;
begin
  new_code := public.generate_referral_code();

  insert into public.profiles (id, email, full_name, referral_code)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new_code
  );

  insert into public.anonymous_profiles (user_id)
  values (new.id);

  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- ── Auto-update updated_at timestamps ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger trg_anonymous_profiles_updated_at
  before update on public.anonymous_profiles
  for each row execute procedure public.set_updated_at();

-- ── Atomic referral recording ──────────────────────────────────────────────────
-- Called from the Stripe webhook and recordReferral() server action.
-- Runs in a single transaction to prevent double-crediting.
--
-- Returns:
--   'created'       — new referral row and earnings record were created
--   'already_exists' — referral already existed; nothing written (idempotent)
--
-- Parameters:
--   p_referrer_id  — profiles.id of the member who shared the link
--   p_referred_id  — profiles.id of the new member who signed up
--   p_fee_amount   — dollars to credit (default 20.00)

create or replace function public.record_referral_atomic(
  p_referrer_id uuid,
  p_referred_id uuid,
  p_fee_amount  numeric default 20.00
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_id uuid;
  now_ts      timestamptz := now();
begin
  -- Guard: referrer and referred must be different people
  if p_referrer_id = p_referred_id then
    raise exception 'referrer_id and referred_id must be different';
  end if;

  -- Idempotency check: if this pair already exists, return early
  select id into existing_id
    from public.referrals
   where referrer_id = p_referrer_id
     and referred_id = p_referred_id
   limit 1;

  if found then
    return 'already_exists';
  end if;

  -- 1. Create the referral row
  insert into public.referrals (
    referrer_id,
    referred_id,
    status,
    referral_fee_earned,
    last_reward_paid_at,
    created_at
  ) values (
    p_referrer_id,
    p_referred_id,
    'active',
    p_fee_amount,
    now_ts,
    now_ts
  );

  -- 2. Credit the earnings ledger for the referrer
  insert into public.earnings (
    user_id,
    type,
    amount,
    description,
    status,
    created_at
  ) values (
    p_referrer_id,
    'referral',
    p_fee_amount,
    'Referral fee — new member activated',
    'approved',
    now_ts
  );

  return 'created';
end;
$$;

-- Grant execute to the service role (used by the admin client)
grant execute on function public.record_referral_atomic(uuid, uuid, numeric)
  to service_role;

-- ── Increment referral_fee_earned on annual renewal ────────────────────────────
-- Called by the webhook / cron when an annual fee is credited.
-- Avoids a read-modify-write race by using a single UPDATE with arithmetic.

create or replace function public.increment_referral_fee(
  p_referral_id uuid,
  p_amount      numeric default 20.00
)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.referrals
     set referral_fee_earned = referral_fee_earned + p_amount,
         last_reward_paid_at = now()
   where id = p_referral_id;
$$;

grant execute on function public.increment_referral_fee(uuid, numeric)
  to service_role;

-- ── 7. share_events ────────────────────────────────────────────────────────────
-- Analytics: tracks every time a member shares their referral link.
-- Used to measure channel effectiveness (copy / Twitter / Facebook / email / SMS / QR).

create type share_platform_enum as enum (
  'copy', 'twitter', 'facebook', 'email', 'sms', 'qr'
);

create table if not exists public.share_events (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  platform      share_platform_enum not null,
  referral_code text not null,
  created_at    timestamptz not null default now()
);

create index idx_share_events_user_id  on public.share_events(user_id);
create index idx_share_events_platform on public.share_events(platform);
create index idx_share_events_created  on public.share_events(created_at);

alter table public.share_events enable row level security;

create policy "Users can insert own share events"
  on public.share_events for insert
  with check (auth.uid() = user_id);

create policy "Users can view own share events"
  on public.share_events for select
  using (auth.uid() = user_id);

-- ── 8. profile_query_log ───────────────────────────────────────────────────────
-- Privacy audit trail: records when a manufacturer query matched a user's
-- anonymous profile. Shows members their data was "used" (no PII revealed).
create table if not exists public.profile_query_log (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  brand_name      text not null,
  queried_at      timestamptz not null default now()
);

create index idx_profile_query_log_user_id on public.profile_query_log(user_id);

alter table public.profile_query_log enable row level security;

create policy "Users can view own query log"
  on public.profile_query_log for select
  using (auth.uid() = user_id);

-- ── Aggregate profile stats function ──────────────────────────────────────────
-- Manufacturer-facing: returns de-identified segment counts.
-- Called by /app/actions/profile.ts getAggregateProfileStats().
-- Parameters:
--   p_zip_prefix — first 3 digits of zip (e.g. '334' matches 33401-33499)
--   p_interest   — interest category (e.g. 'Technology')

create or replace function public.get_aggregate_profile_stats(
  p_zip_prefix text default null,
  p_interest   text default null
)
returns table (
  age_range    text,
  income_range text,
  sex          text,
  member_count bigint
)
language sql stable security definer
set search_path = ''
as $$
  select
    ap.age_range::text,
    ap.income_range::text,
    ap.sex::text,
    count(*)::bigint as member_count
  from public.anonymous_profiles ap
  join public.profiles p on p.id = ap.user_id
  where
    p.subscription_status = 'active'
    and ap.age_range    is not null
    and ap.income_range is not null
    and (p_zip_prefix is null or ap.zip_code like p_zip_prefix || '%')
    and (p_interest   is null or p_interest = any(ap.interests))
  group by ap.age_range, ap.income_range, ap.sex
  order by member_count desc;
$$;

grant execute on function public.get_aggregate_profile_stats(text, text)
  to service_role;

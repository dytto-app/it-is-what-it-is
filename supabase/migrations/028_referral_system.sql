-- Migration 028: Referral System
-- Unique referral codes per user, cosmetic rewards for both sides

-- Add referral columns to profiles
alter table profiles
  add column if not exists referral_code text unique,
  add column if not exists referred_by uuid references profiles(id) on delete set null,
  add column if not exists referral_count integer not null default 0;

comment on column profiles.referral_code is 'Unique shareable code for this user (auto-assigned on first load)';
comment on column profiles.referred_by is 'User who referred this account (null if organic)';
comment on column profiles.referral_count is 'Number of successful referrals this user has made';

-- Referrals tracking table
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references profiles(id) on delete cascade,
  referred_id uuid not null references profiles(id) on delete cascade,
  cosmetic_granted boolean not null default false,
  created_at timestamptz not null default now(),
  unique(referred_id) -- each user can only be referred once
);

comment on table referrals is 'Tracks referral relationships and reward grant status';

-- Index for fast referrer lookups
create index if not exists idx_referrals_referrer_id on referrals(referrer_id);

-- Function to look up a user by referral code (used client-side during onboarding)
create or replace function get_user_by_referral_code(p_code text)
returns table(id uuid, nickname text, referral_count integer)
language sql security definer
as $$
  select id, nickname, referral_count
  from profiles
  where referral_code = upper(p_code)
  limit 1;
$$;

-- Function to apply a referral: links new user to referrer, increments count
-- Returns true if referral was applied, false if already referred or code invalid
create or replace function apply_referral(p_new_user_id uuid, p_referral_code text)
returns boolean
language plpgsql security definer
as $$
declare
  v_referrer_id uuid;
  v_already_referred boolean;
begin
  -- Don't self-refer
  select id into v_referrer_id from profiles where referral_code = upper(p_referral_code);
  if v_referrer_id is null then return false; end if;
  if v_referrer_id = p_new_user_id then return false; end if;

  -- Only apply once
  select exists(select 1 from referrals where referred_id = p_new_user_id) into v_already_referred;
  if v_already_referred then return false; end if;

  -- Record referral
  insert into referrals(referrer_id, referred_id) values(v_referrer_id, p_new_user_id);

  -- Update new user's referred_by
  update profiles set referred_by = v_referrer_id where id = p_new_user_id;

  -- Increment referrer's count
  update profiles set referral_count = referral_count + 1 where id = v_referrer_id;

  return true;
end;
$$;

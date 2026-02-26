-- Migration 029: Referral Cosmetic Rewards
-- Exclusive cosmetics granted when referral succeeds

-- Add referral-exclusive cosmetics (not purchasable)
insert into cosmetics (id, name, type, price) values
  ('referrer_badge', '👥 Recruiter', 'badge', 0),
  ('referred_badge', '🎁 Welcome Gift', 'badge', 0),
  ('referrer_title', 'The Connector', 'title', 0),
  ('referred_title', 'Fresh Recruit', 'title', 0)
on conflict (id) do nothing;

-- Function to grant referral cosmetics to both referrer and referred
-- Called after apply_referral succeeds
create or replace function grant_referral_cosmetics(p_referrer_id uuid, p_referred_id uuid)
returns void
language plpgsql security definer
as $$
begin
  -- Grant referrer cosmetics (recruiter badge + connector title)
  insert into user_cosmetics (user_id, cosmetic_id)
  values
    (p_referrer_id, 'referrer_badge'),
    (p_referrer_id, 'referrer_title')
  on conflict (user_id, cosmetic_id) do nothing;

  -- Grant referred cosmetics (welcome badge + recruit title)
  insert into user_cosmetics (user_id, cosmetic_id)
  values
    (p_referred_id, 'referred_badge'),
    (p_referred_id, 'referred_title')
  on conflict (user_id, cosmetic_id) do nothing;

  -- Mark cosmetic as granted in referrals table
  update referrals
  set cosmetic_granted = true
  where referrer_id = p_referrer_id and referred_id = p_referred_id;
end;
$$;

-- Updated apply_referral that auto-grants cosmetics
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

  -- Grant exclusive cosmetics to both parties
  perform grant_referral_cosmetics(v_referrer_id, p_new_user_id);

  return true;
end;
$$;

comment on function grant_referral_cosmetics is 'Grants exclusive cosmetics to referrer and referred user';

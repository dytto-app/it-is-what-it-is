-- Migration 027: Add daily_goal_cents to profiles
-- Allows users to set an optional daily earnings target shown as a progress ring on the tracker

alter table profiles
  add column if not exists daily_goal_cents integer default null;

comment on column profiles.daily_goal_cents is 'Optional daily earnings goal in cents. NULL means no goal set.';

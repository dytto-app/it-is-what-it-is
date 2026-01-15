-- Add break tracking fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS break_goal integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS break_frequency text DEFAULT 'weekly',
ADD COLUMN IF NOT EXISTS onboarded boolean DEFAULT false,
ADD CONSTRAINT break_frequency_check CHECK (break_frequency IN ('hourly', 'weekly', 'monthly', 'annually'));

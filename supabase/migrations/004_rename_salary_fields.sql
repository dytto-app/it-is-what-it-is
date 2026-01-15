-- Rename break tracking fields to salary fields for clarity
ALTER TABLE public.profiles
RENAME COLUMN break_goal TO salary;

ALTER TABLE public.profiles
RENAME COLUMN break_frequency TO salary_period;

-- Update the constraint name
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS break_frequency_check;

ALTER TABLE public.profiles
ADD CONSTRAINT salary_period_check CHECK (salary_period IN ('hourly', 'weekly', 'monthly', 'annually'));

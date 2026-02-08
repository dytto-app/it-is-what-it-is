-- Migration 020: Sync achievement IDs with frontend
-- The frontend achievements.ts uses specific IDs that must match the database.
-- This migration updates the database to use those exact IDs.

TRUNCATE public.user_achievements CASCADE;
TRUNCATE public.achievements CASCADE;

INSERT INTO public.achievements (id, title, description, icon, threshold, type) VALUES
-- Beginner Achievements
('first-session', 'First Drop', 'Complete your first session', 'Zap', 1, 'sessions'),
('early-bird', 'Early Bird', 'Complete a session before 8 AM', 'Sunrise', 1, 'special'),
('night-owl', 'Night Owl', 'Complete a session after 10 PM', 'Moon', 1, 'special'),

-- Session Count Achievements
('five-sessions', 'Getting Started', 'Complete 5 sessions', 'Play', 5, 'sessions'),
('ten-sessions', 'Getting Regular', 'Complete 10 sessions', 'Target', 10, 'sessions'),
('twenty-five-sessions', 'Dedicated User', 'Complete 25 sessions', 'Award', 25, 'sessions'),
('fifty-sessions', 'Weekly Warrior', 'Complete 50 sessions', 'Shield', 50, 'sessions'),
('hundred-sessions', 'Century Master', 'Complete 100 sessions', 'Crown', 100, 'sessions'),
('two-fifty-sessions', 'Elite Professional', 'Complete 250 sessions', 'Star', 250, 'sessions'),
('five-hundred-sessions', 'Legendary Status', 'Complete 500 sessions', 'Trophy', 500, 'sessions'),

-- Earnings Achievements
('first-dollar', 'First Buck', 'Earn your first dollar', 'DollarSign', 1, 'earnings'),
('ten-dollars', 'Coffee Money', 'Earn $10 in break time', 'Coffee', 10, 'earnings'),
('fifty-dollars', 'Lunch Money', 'Earn $50 in break time', 'Utensils', 50, 'earnings'),
('hundred-dollars', 'Century Club', 'Earn $100 in break time', 'Banknote', 100, 'earnings'),
('five-hundred-dollars', 'High Roller', 'Earn $500 in break time', 'Gem', 500, 'earnings'),
('thousand-dollars', 'Millionaire Mindset', 'Earn $1,000 in break time', 'Diamond', 1000, 'earnings'),

-- Time Achievements
('fifteen-minutes', 'Quick Break', 'Accumulate 15 minutes of sessions', 'Clock', 900, 'time'),
('one-hour', 'Time Well Spent', 'Accumulate 1 hour of sessions', 'Clock3', 3600, 'time'),
('five-hours', 'Time Master', 'Accumulate 5 hours of sessions', 'Clock4', 18000, 'time'),
('ten-hours', 'Dedication Incarnate', 'Accumulate 10 hours of sessions', 'Clock8', 36000, 'time'),
('twenty-four-hours', 'Full Day Champion', 'Accumulate 24 hours of sessions', 'Clock12', 86400, 'time'),

-- Streak Achievements
('streak-3', '3-Day Streak', 'Maintain a 3-day streak', 'Flame', 3, 'streak'),
('streak-7', 'Week Streak', 'Maintain a 7-day streak', 'Flame', 7, 'streak'),
('streak-14', 'Two Week Streak', 'Maintain a 14-day streak', 'Flame', 14, 'streak'),
('streak-30', 'Month Streak', 'Maintain a 30-day streak', 'Flame', 30, 'streak'),
('streak-100', 'Century Streak', 'Maintain a 100-day streak', 'Fire', 100, 'streak'),

-- Special Achievements
('speed-demon', 'Speed Demon', 'Complete a session in under 30 seconds', 'Zap', 1, 'special'),
('marathon-runner', 'Marathon Runner', 'Complete a session longer than 20 minutes', 'Timer', 1, 'special'),
('consistency-king', 'Consistency King', 'Complete sessions on 7 consecutive days', 'Calendar', 7, 'special'),
('weekend-warrior', 'Weekend Warrior', 'Complete 10 sessions on weekends', 'Mountain', 10, 'special'),
('workday-hero', 'Workday Hero', 'Complete 25 sessions on weekdays', 'Briefcase', 25, 'special'),
('efficiency-expert', 'Efficiency Expert', 'Maintain average session time under 5 minutes', 'Gauge', 1, 'special'),
('power-user', 'Power User', 'Complete 5 sessions in one day', 'Flame', 5, 'special'),
('midnight-warrior', 'Midnight Warrior', 'Complete a session at exactly midnight', 'Moon', 1, 'special'),
('lunch-break-legend', 'Lunch Break Legend', 'Complete 10 sessions between 12-1 PM', 'Sandwich', 10, 'special');

-- Update type constraint
ALTER TABLE public.achievements DROP CONSTRAINT IF EXISTS achievements_type_check;
ALTER TABLE public.achievements ADD CONSTRAINT achievements_type_check 
  CHECK (type IN ('sessions', 'earnings', 'time', 'streak', 'special'));

DO $$
DECLARE
  cnt INTEGER;
BEGIN
  SELECT COUNT(*) INTO cnt FROM public.achievements;
  RAISE NOTICE 'Achievement sync complete: % rows', cnt;
END $$;

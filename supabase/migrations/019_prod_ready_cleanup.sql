-- Migration 019: Production-Ready Database Cleanup
-- Fixes all accumulated junk data and schema inconsistencies.
-- Run this ONCE to reset everything to a clean state.

-- ============================================
-- 1. ACHIEVEMENTS - Clean and standardize
-- ============================================

-- Wipe and rebuild with consistent naming
TRUNCATE public.user_achievements CASCADE;
TRUNCATE public.achievements CASCADE;

INSERT INTO public.achievements (id, title, description, icon, threshold, type) VALUES
-- Session milestones (simple naming: session-N)
('session-1', 'First Steps', 'Complete your first session', 'Play', 1, 'sessions'),
('session-5', 'Getting Started', 'Complete 5 sessions', 'Target', 5, 'sessions'),
('session-10', 'Regular User', 'Complete 10 sessions', 'CheckCircle', 10, 'sessions'),
('session-25', 'Dedicated', 'Complete 25 sessions', 'Award', 25, 'sessions'),
('session-50', 'Committed', 'Complete 50 sessions', 'Star', 50, 'sessions'),
('session-100', 'Century Club', 'Complete 100 sessions', 'Trophy', 100, 'sessions'),
('session-250', 'Elite', 'Complete 250 sessions', 'Crown', 250, 'sessions'),
('session-500', 'Legendary', 'Complete 500 sessions', 'Gem', 500, 'sessions'),

-- Earnings milestones (earnings-N in dollars)
('earnings-1', 'First Dollar', 'Earn $1 total', 'DollarSign', 1, 'earnings'),
('earnings-10', 'Coffee Money', 'Earn $10 total', 'Coffee', 10, 'earnings'),
('earnings-50', 'Lunch Money', 'Earn $50 total', 'Utensils', 50, 'earnings'),
('earnings-100', 'Benjamin', 'Earn $100 total', 'Banknote', 100, 'earnings'),
('earnings-250', 'Quarter Grand', 'Earn $250 total', 'Wallet', 250, 'earnings'),
('earnings-500', 'Half Grand', 'Earn $500 total', 'PiggyBank', 500, 'earnings'),
('earnings-1000', 'Grand Master', 'Earn $1000 total', 'TrendingUp', 1000, 'earnings'),

-- Time milestones (time-Xh in hours, stored as seconds)
('time-15m', 'Quarter Hour', 'Spend 15 minutes total', 'Clock', 900, 'time'),
('time-1h', 'Hour Power', 'Spend 1 hour total', 'Clock3', 3600, 'time'),
('time-5h', 'Five Hours', 'Spend 5 hours total', 'Clock4', 18000, 'time'),
('time-10h', 'Ten Hours', 'Spend 10 hours total', 'Clock8', 36000, 'time'),
('time-24h', 'Full Day', 'Spend 24 hours total', 'Clock12', 86400, 'time'),
('time-50h', 'Two Days', 'Spend 50 hours total', 'Calendar', 180000, 'time'),
('time-100h', 'Centurion', 'Spend 100 hours total', 'CalendarCheck', 360000, 'time'),

-- Streak milestones
('streak-3', '3-Day Streak', 'Maintain a 3-day streak', 'Flame', 3, 'streak'),
('streak-7', 'Week Streak', 'Maintain a 7-day streak', 'Flame', 7, 'streak'),
('streak-14', 'Two Week Streak', 'Maintain a 14-day streak', 'Flame', 14, 'streak'),
('streak-30', 'Month Streak', 'Maintain a 30-day streak', 'Flame', 30, 'streak'),
('streak-100', 'Century Streak', 'Maintain a 100-day streak', 'Fire', 100, 'streak'),

-- Special achievements
('early-bird', 'Early Bird', 'Start a session before 8 AM', 'Sunrise', 1, 'special'),
('night-owl', 'Night Owl', 'Start a session after 10 PM', 'Moon', 1, 'special'),
('speed-demon', 'Speed Demon', 'Complete a session under 5 minutes', 'Zap', 1, 'special'),
('marathon', 'Marathon', 'Complete a 2+ hour session', 'Activity', 1, 'special'),
('weekend-warrior', 'Weekend Warrior', 'Complete 10 weekend sessions', 'Coffee', 10, 'special');

-- ============================================
-- 2. PROFILES - Ensure streak columns exist
-- ============================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_session_date DATE;

-- ============================================
-- 3. Update achievements type constraint
-- ============================================

-- Drop old constraint if exists
ALTER TABLE public.achievements DROP CONSTRAINT IF EXISTS achievements_type_check;

-- Add updated constraint with streak type
ALTER TABLE public.achievements ADD CONSTRAINT achievements_type_check 
  CHECK (type IN ('sessions', 'earnings', 'time', 'streak', 'special'));

-- ============================================
-- 4. Ensure streak function exists
-- ============================================

CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS TABLE (
  current_streak INTEGER,
  longest_streak INTEGER,
  streak_continued BOOLEAN
) AS $$
DECLARE
  v_last_session_date DATE;
  v_today DATE := CURRENT_DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_streak_continued BOOLEAN := FALSE;
BEGIN
  SELECT 
    p.last_session_date,
    p.current_streak,
    p.longest_streak
  INTO v_last_session_date, v_current_streak, v_longest_streak
  FROM profiles p
  WHERE p.id = p_user_id;

  IF v_last_session_date = v_today THEN
    RETURN QUERY SELECT v_current_streak, v_longest_streak, FALSE;
    RETURN;
  END IF;

  IF v_last_session_date = v_today - 1 THEN
    v_current_streak := v_current_streak + 1;
    v_streak_continued := TRUE;
  ELSE
    v_current_streak := 1;
    v_streak_continued := FALSE;
  END IF;

  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;

  UPDATE profiles
  SET 
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_session_date = v_today
  WHERE id = p_user_id;

  RETURN QUERY SELECT v_current_streak, v_longest_streak, v_streak_continued;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. Verify final state
-- ============================================

DO $$
DECLARE
  achievement_count INTEGER;
  cosmetic_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO achievement_count FROM public.achievements;
  SELECT COUNT(*) INTO cosmetic_count FROM public.cosmetics;
  
  RAISE NOTICE 'Production cleanup complete:';
  RAISE NOTICE '  Achievements: % (expected 35)', achievement_count;
  RAISE NOTICE '  Cosmetics: % (expected 20)', cosmetic_count;
  
  IF achievement_count != 35 THEN
    RAISE WARNING 'Achievement count mismatch!';
  END IF;
  IF cosmetic_count != 20 THEN
    RAISE WARNING 'Cosmetic count mismatch!';
  END IF;
END $$;

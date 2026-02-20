-- Migration 026: Streak Freeze
-- Adds streak_freezes column and updates streak logic to consume freezes when a day is missed.
-- Users earn a freeze at each streak milestone (7, 14, 30, 100 days).

-- 1. Add streak_freezes column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_freezes INTEGER NOT NULL DEFAULT 0;

-- 2. Drop and recreate update_user_streak (return type is changing — new columns added)
DROP FUNCTION IF EXISTS update_user_streak(UUID);

CREATE FUNCTION update_user_streak(p_user_id UUID)
RETURNS TABLE (
  current_streak INTEGER,
  longest_streak INTEGER,
  streak_continued BOOLEAN,
  freeze_consumed BOOLEAN,
  freeze_granted BOOLEAN
) AS $$
DECLARE
  v_last_session_date DATE;
  v_today DATE := CURRENT_DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_streak_freezes INTEGER;
  v_streak_continued BOOLEAN := FALSE;
  v_freeze_consumed BOOLEAN := FALSE;
  v_freeze_granted BOOLEAN := FALSE;
  v_days_missed INTEGER;
BEGIN
  -- Get current streak info
  SELECT 
    p.last_session_date,
    p.current_streak,
    p.longest_streak,
    p.streak_freezes
  INTO v_last_session_date, v_current_streak, v_longest_streak, v_streak_freezes
  FROM profiles p
  WHERE p.id = p_user_id;

  -- If already recorded a session today, no change needed
  IF v_last_session_date = v_today THEN
    RETURN QUERY SELECT v_current_streak, v_longest_streak, FALSE, FALSE, FALSE;
    RETURN;
  END IF;

  -- Calculate days since last session
  IF v_last_session_date IS NULL THEN
    v_days_missed := 999; -- first session ever
  ELSE
    v_days_missed := v_today - v_last_session_date;
  END IF;

  IF v_days_missed = 1 THEN
    -- Continue streak — consecutive day
    v_current_streak := v_current_streak + 1;
    v_streak_continued := TRUE;
  ELSIF v_days_missed = 2 AND v_streak_freezes > 0 THEN
    -- Missed exactly 1 day, have a freeze — consume it and continue streak
    v_current_streak := v_current_streak + 1;
    v_streak_continued := TRUE;
    v_streak_freezes := v_streak_freezes - 1;
    v_freeze_consumed := TRUE;
  ELSE
    -- Reset streak (missed 2+ days, or no freeze available)
    v_current_streak := 1;
    v_streak_continued := FALSE;
  END IF;

  -- Update longest streak if needed
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;

  -- Award a freeze at milestone streaks: 7, 14, 30, 100 days
  -- Only award on the exact milestone day (streak_continued = TRUE means it just incremented)
  IF v_streak_continued AND v_current_streak IN (7, 14, 30, 100) THEN
    v_streak_freezes := v_streak_freezes + 1;
    v_freeze_granted := TRUE;
  END IF;

  -- Update profile
  UPDATE profiles
  SET 
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_session_date = v_today,
    streak_freezes = v_streak_freezes
  WHERE id = p_user_id;

  RETURN QUERY SELECT v_current_streak, v_longest_streak, v_streak_continued, v_freeze_consumed, v_freeze_granted;
END;
$$ LANGUAGE plpgsql;

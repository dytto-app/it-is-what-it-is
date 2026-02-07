-- Add streak tracking columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_session_date DATE;

-- Add streak achievements
INSERT INTO achievements (id, title, description, icon, threshold, type) VALUES
  ('streak_3', '3-Day Warrior', 'Maintained a 3-day streak', '🔥', 3, 'streak'),
  ('streak_7', 'Week Champion', 'Maintained a 7-day streak', '🔥', 7, 'streak'),
  ('streak_14', 'Fortnight Fighter', 'Maintained a 14-day streak', '🔥', 14, 'streak'),
  ('streak_30', 'Monthly Master', 'Maintained a 30-day streak', '🔥', 30, 'streak'),
  ('streak_100', 'Century Legend', 'Maintained a 100-day streak', '💯', 100, 'streak')
ON CONFLICT (id) DO NOTHING;

-- Function to update streak on session completion
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
  -- Get current streak info
  SELECT 
    p.last_session_date,
    p.current_streak,
    p.longest_streak
  INTO v_last_session_date, v_current_streak, v_longest_streak
  FROM profiles p
  WHERE p.id = p_user_id;

  -- If already recorded a session today, no change
  IF v_last_session_date = v_today THEN
    RETURN QUERY SELECT v_current_streak, v_longest_streak, FALSE;
    RETURN;
  END IF;

  -- Check if yesterday
  IF v_last_session_date = v_today - 1 THEN
    -- Continue streak
    v_current_streak := v_current_streak + 1;
    v_streak_continued := TRUE;
  ELSE
    -- Reset streak (missed a day or first session)
    v_current_streak := 1;
    v_streak_continued := FALSE;
  END IF;

  -- Update longest streak if needed
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;

  -- Update profile
  UPDATE profiles
  SET 
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_session_date = v_today
  WHERE id = p_user_id;

  RETURN QUERY SELECT v_current_streak, v_longest_streak, v_streak_continued;
END;
$$ LANGUAGE plpgsql;

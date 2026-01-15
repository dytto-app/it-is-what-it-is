-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  threshold integer NOT NULL,
  type text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT achievements_type_check CHECK (type IN ('sessions', 'earnings', 'time'))
);

-- Create user_achievements table (tracks unlocked achievements)
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id text NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE IF EXISTS public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Achievements are readable by everyone" ON public.achievements;
DROP POLICY IF EXISTS "Users can read their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Service role can insert achievements" ON public.user_achievements;

-- Achievements are public - everyone can read
CREATE POLICY "Achievements are readable by everyone" ON public.achievements
  FOR SELECT USING (true);

-- User achievements - users can read their own
CREATE POLICY "Users can read their own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Allow insertion for achievement unlocks (from frontend or edge functions)
CREATE POLICY "Anyone can insert achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (true);

-- Insert achievement data
INSERT INTO public.achievements (id, title, description, icon, threshold, type) VALUES
-- Session-based achievements
('first-session', 'First Break', 'Complete your first break session', '🎉', 1, 'sessions'),
('five-sessions', 'Five Times Over', 'Complete 5 break sessions', '5️⃣', 5, 'sessions'),
('ten-sessions', 'On a Roll', 'Complete 10 break sessions', '🔟', 10, 'sessions'),
('fifty-sessions', 'Break Master', 'Complete 50 break sessions', '🏆', 50, 'sessions'),
-- Earnings-based achievements
('speed-demon', 'Speed Demon', 'Earn $10 from breaks', '⚡', 1000, 'earnings'),
('money-maker', 'Money Maker', 'Earn $50 from breaks', '💰', 5000, 'earnings'),
('rich', 'Getting Rich', 'Earn $100 from breaks', '💸', 10000, 'earnings'),
-- Time-based achievements
('hour-grinder', 'Hour Grinder', 'Accumulate 1 hour of break time', '⏳', 3600, 'time'),
('day-dreamer', 'Day Dreamer', 'Accumulate 8 hours of break time', '😴', 28800, 'time'),
('week-warrior', 'Week Warrior', 'Accumulate 40 hours of break time', '💪', 144000, 'time')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);

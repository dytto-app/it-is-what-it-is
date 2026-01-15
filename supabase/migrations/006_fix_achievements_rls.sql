-- Drop all existing policies on user_achievements
DROP POLICY IF EXISTS "Users can read their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Service role can insert achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Anyone can insert achievements" ON public.user_achievements;

-- Recreate RLS policies with proper permissions
-- Users can read their own achievements
CREATE POLICY "Users can read their own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Allow insertions for achievement unlocks
CREATE POLICY "Anyone can insert achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (true);

-- Also allow the service role to do whatever
CREATE POLICY "Service role can manage achievements" ON public.user_achievements
  FOR ALL USING (auth.role() = 'service_role');

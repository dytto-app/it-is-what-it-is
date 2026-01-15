-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Cosmetics are readable by everyone" ON public.cosmetics;
DROP POLICY IF EXISTS "Users can read their own cosmetics" ON public.user_cosmetics;
DROP POLICY IF EXISTS "Service role can insert cosmetics" ON public.user_cosmetics;
DROP POLICY IF EXISTS "Anyone can insert cosmetics (frontend)" ON public.user_cosmetics;
DROP POLICY IF EXISTS "Users can read their equipped cosmetics" ON public.user_equipped_cosmetics;
DROP POLICY IF EXISTS "Users can update their equipped cosmetics" ON public.user_equipped_cosmetics;
DROP POLICY IF EXISTS "Users can insert their equipped cosmetics" ON public.user_equipped_cosmetics;
DROP POLICY IF EXISTS "Users can insert equipped cosmetics" ON public.user_equipped_cosmetics;

-- Cosmetics are public - everyone can read
CREATE POLICY "Cosmetics are readable by everyone" ON public.cosmetics
  FOR SELECT USING (true);

-- User cosmetics - users can read their own, anyone can insert
CREATE POLICY "Users can read their own cosmetics" ON public.user_cosmetics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert cosmetics (frontend)" ON public.user_cosmetics
  FOR INSERT WITH CHECK (true);

-- User equipped cosmetics - users can read, update, insert their own
CREATE POLICY "Users can read their equipped cosmetics" ON public.user_equipped_cosmetics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their equipped cosmetics" ON public.user_equipped_cosmetics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their equipped cosmetics" ON public.user_equipped_cosmetics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

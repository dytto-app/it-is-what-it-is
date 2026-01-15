-- Create cosmetics table
CREATE TABLE IF NOT EXISTS public.cosmetics (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  price integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cosmetics_type_check CHECK (type IN ('frame', 'badge', 'title'))
);

-- Create user_cosmetics table (tracks owned cosmetics)
CREATE TABLE IF NOT EXISTS public.user_cosmetics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cosmetic_id text NOT NULL REFERENCES public.cosmetics(id) ON DELETE CASCADE,
  purchased_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, cosmetic_id)
);

-- Create user_equipped_cosmetics table (tracks currently equipped cosmetics)
CREATE TABLE IF NOT EXISTS public.user_equipped_cosmetics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  frame_id text REFERENCES public.cosmetics(id) ON DELETE SET NULL,
  badge_id text REFERENCES public.cosmetics(id) ON DELETE SET NULL,
  title_id text REFERENCES public.cosmetics(id) ON DELETE SET NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert cosmetics data
INSERT INTO public.cosmetics (id, name, type, price) VALUES
-- Frames
('gold', 'Golden Aura', 'frame', 99),
('diamond', 'Diamond Elite', 'frame', 299),
('fire', 'Blazing Fire', 'frame', 199),
('cosmic', 'Cosmic Energy', 'frame', 699),
-- Badges
('star', 'Rising Star', 'badge', 99),
('lightning', 'Speed Demon', 'badge', 149),
('flame', 'On Fire', 'badge', 199),
('diamond', 'Diamond Pro', 'badge', 299),
('shield', 'Elite Guard', 'badge', 349),
-- Titles
('rookie', 'The Rookie', 'title', 49),
('grinder', 'The Grinder', 'title', 99),
('legend', 'Living Legend', 'title', 199),
('master', 'Poop Master', 'title', 299),
('emperor', 'Toilet Emperor', 'title', 499)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE IF EXISTS public.cosmetics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_cosmetics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_equipped_cosmetics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (from previous runs)
DROP POLICY IF EXISTS "Cosmetics are readable by everyone" ON public.cosmetics;
DROP POLICY IF EXISTS "Users can read their own cosmetics" ON public.user_cosmetics;
DROP POLICY IF EXISTS "Service role can insert cosmetics" ON public.user_cosmetics;
DROP POLICY IF EXISTS "Users can read their equipped cosmetics" ON public.user_equipped_cosmetics;
DROP POLICY IF EXISTS "Users can update their equipped cosmetics" ON public.user_equipped_cosmetics;
DROP POLICY IF EXISTS "Users can insert equipped cosmetics" ON public.user_equipped_cosmetics;

-- Cosmetics are public - everyone can read
CREATE POLICY "Cosmetics are readable by everyone" ON public.cosmetics
  FOR SELECT USING (true);

-- User cosmetics - users can read their own, service role can insert
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_cosmetics_user_id ON public.user_cosmetics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_equipped_cosmetics_user_id ON public.user_equipped_cosmetics(user_id);

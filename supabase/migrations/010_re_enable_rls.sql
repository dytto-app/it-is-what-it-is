-- Migration 010: Re-enable RLS on all tables
-- Fixes: https://github.com/Ayaan-P/back-log/issues/1
-- 
-- Migration 009 disabled RLS on all tables, leaving the entire database
-- exposed to any client with the anon key. This migration re-enables RLS
-- with proper policies.

-- ============================================
-- 1. Re-enable RLS on all tables
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cosmetics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cosmetics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_equipped_cosmetics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Drop ALL existing policies (clean slate)
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public leaderboard readable" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Sessions
DROP POLICY IF EXISTS "Users can read their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.sessions;

-- Achievements
DROP POLICY IF EXISTS "Achievements are readable by everyone" ON public.achievements;

-- User Achievements
DROP POLICY IF EXISTS "Users can read their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Anyone can insert achievements" ON public.user_achievements;

-- Cosmetics
DROP POLICY IF EXISTS "Cosmetics are readable by everyone" ON public.cosmetics;

-- User Cosmetics
DROP POLICY IF EXISTS "Users can read their own cosmetics" ON public.user_cosmetics;
DROP POLICY IF EXISTS "Anyone can insert cosmetics (frontend)" ON public.user_cosmetics;
DROP POLICY IF EXISTS "Service role can insert cosmetics" ON public.user_cosmetics;

-- User Equipped Cosmetics
DROP POLICY IF EXISTS "Users can read their equipped cosmetics" ON public.user_equipped_cosmetics;
DROP POLICY IF EXISTS "Users can update their equipped cosmetics" ON public.user_equipped_cosmetics;
DROP POLICY IF EXISTS "Users can insert their equipped cosmetics" ON public.user_equipped_cosmetics;
DROP POLICY IF EXISTS "Users can insert equipped cosmetics" ON public.user_equipped_cosmetics;

-- ============================================
-- 3. Create proper RLS policies
-- ============================================

-- === PROFILES ===
-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Leaderboard: anyone authenticated can see profiles that opted in
-- (needed for leaderboard to show other users' nicknames)
CREATE POLICY "profiles_select_leaderboard"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (show_on_leaderboard = true);

-- Users can create their own profile (signup)
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- === SESSIONS ===
-- Users can only see their own sessions
CREATE POLICY "sessions_select_own"
  ON public.sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Leaderboard needs to read sessions of leaderboard-visible users
-- This allows reading sessions where the session owner has opted into leaderboard
CREATE POLICY "sessions_select_leaderboard"
  ON public.sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = sessions.user_id
      AND profiles.show_on_leaderboard = true
    )
  );

-- Users can create sessions for themselves only
CREATE POLICY "sessions_insert_own"
  ON public.sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update (end) their own sessions only
CREATE POLICY "sessions_update_own"
  ON public.sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- === ACHIEVEMENTS (reference data) ===
-- Everyone can read achievements (they're reference data)
CREATE POLICY "achievements_select_all"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (true);

-- === USER ACHIEVEMENTS ===
-- Users can read their own unlocked achievements
CREATE POLICY "user_achievements_select_own"
  ON public.user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can unlock achievements for themselves
CREATE POLICY "user_achievements_insert_own"
  ON public.user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- === COSMETICS (reference data) ===
-- Everyone can read the cosmetics catalog
CREATE POLICY "cosmetics_select_all"
  ON public.cosmetics FOR SELECT
  TO authenticated
  USING (true);

-- === USER COSMETICS (purchases) ===
-- Users can see their own purchased cosmetics
CREATE POLICY "user_cosmetics_select_own"
  ON public.user_cosmetics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Only service role can insert purchases (via Stripe webhook)
-- No INSERT policy for authenticated role = frontend cannot fake purchases
-- The Stripe webhook function uses the service_role key which bypasses RLS

-- === USER EQUIPPED COSMETICS ===
-- Users can read their own equipped cosmetics
CREATE POLICY "user_equipped_select_own"
  ON public.user_equipped_cosmetics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can equip cosmetics they own
CREATE POLICY "user_equipped_insert_own"
  ON public.user_equipped_cosmetics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can change their equipped cosmetics
CREATE POLICY "user_equipped_update_own"
  ON public.user_equipped_cosmetics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

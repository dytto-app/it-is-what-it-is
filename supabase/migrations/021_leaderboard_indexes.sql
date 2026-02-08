-- Migration 021: Add indexes for leaderboard performance
-- These indexes optimize the common leaderboard queries:
-- - Aggregating sessions by user
-- - Filtering by show_on_leaderboard
-- - Sorting by earnings/time totals
-- - Fetching equipped cosmetics

-- Sessions: Speed up aggregation by user_id and time-based filtering
CREATE INDEX IF NOT EXISTS idx_sessions_user_id_start_time 
  ON public.sessions(user_id, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id_earnings 
  ON public.sessions(user_id, earnings);

-- Profiles: Speed up leaderboard filtering
CREATE INDEX IF NOT EXISTS idx_profiles_leaderboard 
  ON public.profiles(show_on_leaderboard) 
  WHERE show_on_leaderboard = true;

-- User equipped cosmetics: Speed up leaderboard cosmetic lookup
CREATE INDEX IF NOT EXISTS idx_user_equipped_user_id 
  ON public.user_equipped_cosmetics(user_id);

-- User achievements: Speed up achievement count queries  
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_achievement 
  ON public.user_achievements(user_id, achievement_id);

-- Cosmetics by type: Speed up shop/inventory queries
CREATE INDEX IF NOT EXISTS idx_cosmetics_type 
  ON public.cosmetics(type);

-- Analyze tables to update query planner statistics
ANALYZE public.sessions;
ANALYZE public.profiles;
ANALYZE public.user_equipped_cosmetics;
ANALYZE public.user_achievements;
ANALYZE public.cosmetics;

DO $$
BEGIN
  RAISE NOTICE 'Leaderboard indexes created and tables analyzed';
END $$;

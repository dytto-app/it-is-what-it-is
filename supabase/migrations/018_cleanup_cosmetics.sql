-- Migration: Reset cosmetics table to clean state
-- The cosmetics table accumulated junk data with inconsistent IDs.
-- This migration wipes it clean and re-inserts only the correct cosmetics
-- matching the frontend COSMETICS definition.

-- Clear all tables with CASCADE to handle FK constraints
TRUNCATE public.user_equipped_cosmetics CASCADE;
TRUNCATE public.user_cosmetics CASCADE;
TRUNCATE public.cosmetics CASCADE;

-- Re-insert correct cosmetics (matching frontend exactly)

-- FRAMES (6 total)
INSERT INTO public.cosmetics (id, name, type, price) VALUES
  ('clean', 'Clean Look', 'frame', 0),
  ('neon', 'Neon Green', 'frame', 0),
  ('gold', 'Golden Aura', 'frame', 99),
  ('diamond', 'Diamond Elite', 'frame', 299),
  ('fire', 'Blazing Fire', 'frame', 199),
  ('cosmic', 'Cosmic Energy', 'frame', 699);

-- BADGES (7 total)
INSERT INTO public.cosmetics (id, name, type, price) VALUES
  ('newbie', 'Newbie', 'badge', 0),
  ('veteran', 'Veteran', 'badge', 0),
  ('star', 'Rising Star', 'badge', 99),
  ('lightning', 'Speed Demon', 'badge', 149),
  ('flame', 'On Fire', 'badge', 199),
  ('diamond-badge', 'Diamond Pro', 'badge', 299),
  ('shield', 'Elite Guard', 'badge', 349);

-- TITLES (7 total)
INSERT INTO public.cosmetics (id, name, type, price) VALUES
  ('enthusiast', 'Bathroom Enthusiast', 'title', 0),
  ('breaker', 'Break Taker', 'title', 0),
  ('rookie', 'The Rookie', 'title', 49),
  ('grinder', 'The Grinder', 'title', 99),
  ('legend', 'Living Legend', 'title', 199),
  ('master', 'Poop Master', 'title', 299),
  ('emperor', 'Toilet Emperor', 'title', 499);

-- Verify: should be exactly 20 rows (6 + 7 + 7)
DO $$
DECLARE
  total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM public.cosmetics;
  RAISE NOTICE 'Cosmetics reset complete: % total rows', total_count;
  
  IF total_count != 20 THEN
    RAISE EXCEPTION 'Expected 20 cosmetics, got %', total_count;
  END IF;
END $$;

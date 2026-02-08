-- Migration 023: Fix user_equipped_cosmetics FK to reference profiles
-- PostgREST needs FK to profiles for the join query to work
-- profiles.id already references auth.users.id, so this is safe

ALTER TABLE public.user_equipped_cosmetics 
  DROP CONSTRAINT IF EXISTS user_equipped_cosmetics_user_id_fkey;

ALTER TABLE public.user_equipped_cosmetics
  ADD CONSTRAINT user_equipped_cosmetics_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

DO $$
BEGIN
  RAISE NOTICE 'FK constraint updated to reference profiles.id';
END $$;

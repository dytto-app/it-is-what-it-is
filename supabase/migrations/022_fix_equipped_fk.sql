-- Migration 022: Fix user_equipped_cosmetics FK and ensure it references auth.users
-- There was a potential mismatch where FK might point to profiles instead of auth.users

-- First ensure the table exists with correct structure
-- Drop and recreate if FK is wrong (safe since table is empty after cleanup)

-- Check if constraint exists pointing to wrong table and fix it
DO $$
BEGIN
  -- Drop the old FK constraint if it exists (might be named differently)
  ALTER TABLE public.user_equipped_cosmetics 
    DROP CONSTRAINT IF EXISTS user_equipped_cosmetics_user_id_fkey;
  
  -- Recreate FK to auth.users (the source of truth for user IDs)
  ALTER TABLE public.user_equipped_cosmetics
    ADD CONSTRAINT user_equipped_cosmetics_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    
  RAISE NOTICE 'FK constraint updated to reference auth.users';
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'FK constraint already exists correctly';
  WHEN OTHERS THEN
    RAISE NOTICE 'FK update issue: %', SQLERRM;
END $$;

-- Also ensure the UNIQUE constraint exists for upsert to work
DO $$
BEGIN
  ALTER TABLE public.user_equipped_cosmetics 
    ADD CONSTRAINT user_equipped_cosmetics_user_id_key UNIQUE (user_id);
EXCEPTION
  WHEN duplicate_table THEN
    RAISE NOTICE 'UNIQUE constraint already exists';
  WHEN duplicate_object THEN
    RAISE NOTICE 'UNIQUE constraint already exists';
END $$;

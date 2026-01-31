-- Remove any existing INSERT policy on user_cosmetics for anon/authenticated users
-- Cosmetic ownership should only be granted by the Stripe webhook (service_role)
-- Users can still READ their owned cosmetics

-- Drop existing permissive insert policies if they exist
DO $$
BEGIN
  -- Try to drop any insert policies on user_cosmetics
  EXECUTE 'DROP POLICY IF EXISTS "Users can insert own cosmetics" ON user_cosmetics';
  EXECUTE 'DROP POLICY IF EXISTS "Allow insert cosmetics" ON user_cosmetics';
  EXECUTE 'DROP POLICY IF EXISTS "user_cosmetics_insert" ON user_cosmetics';
  EXECUTE 'DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_cosmetics';
END $$;

-- Ensure RLS is enabled
ALTER TABLE user_cosmetics ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own cosmetics
CREATE POLICY "Users can read own cosmetics"
  ON user_cosmetics FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policy for authenticated users
-- Only service_role (used by webhook) can insert cosmetics

-- Fix 1: Allow authenticated users to claim FREE cosmetics (price = 0)
-- Paid cosmetics are still only granted by Stripe webhook (service_role)

CREATE POLICY "Users can claim free cosmetics"
  ON user_cosmetics FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM cosmetics 
      WHERE cosmetics.id = cosmetic_id 
      AND cosmetics.price = 0
    )
  );

-- Fix 2: Add recovery_email column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recovery_email TEXT;

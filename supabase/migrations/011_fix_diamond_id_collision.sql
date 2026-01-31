-- Migration 011: Fix diamond cosmetic ID collision
-- Fixes: https://github.com/Ayaan-P/back-log/issues/3
--
-- The 'diamond' ID is used for both a frame ("Diamond Elite") and a badge
-- ("Diamond Pro"). Since cosmetics.id is the primary key, only one can exist.
-- This renames the badge to 'diamond-badge' to make IDs unique.

-- Step 1: Insert the new badge with unique ID
INSERT INTO public.cosmetics (id, name, type, price)
VALUES ('diamond-badge', 'Diamond Pro', 'badge', 299)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Migrate existing user_cosmetics referencing 'diamond' that were
-- intended as badge purchases. Since we can't tell which were frames vs badges
-- from the old data (both had id='diamond'), we keep existing 'diamond' as the
-- frame and don't auto-migrate. Users who bought "Diamond Pro" badge will need
-- to be manually reconciled or re-granted via support.
--
-- For user_equipped_cosmetics, update badge_id references:
UPDATE public.user_equipped_cosmetics
SET badge_id = 'diamond-badge'
WHERE badge_id = 'diamond';

-- Step 3: Ensure the 'diamond' entry in cosmetics is the frame
-- (It should already be, but let's make sure the type is correct)
UPDATE public.cosmetics
SET type = 'frame', name = 'Diamond Elite'
WHERE id = 'diamond';

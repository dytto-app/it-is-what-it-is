-- Migration: Add session categories for break type classification
-- Categories: bathroom, coffee, lunch, walk, chat, other

-- Add category column to sessions table
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT NULL;

-- Create index for category-based queries (analytics breakdowns)
CREATE INDEX IF NOT EXISTS idx_sessions_category ON sessions(category) WHERE category IS NOT NULL;

-- Add comment explaining valid categories
COMMENT ON COLUMN sessions.category IS 'Break category: bathroom, coffee, lunch, walk, chat, other. NULL = uncategorized.';

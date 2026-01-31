-- Change earnings column from text to numeric for proper storage
-- This avoids parseFloat() calls throughout the codebase

-- First convert existing string values to numeric
ALTER TABLE sessions 
  ALTER COLUMN earnings TYPE numeric(12,4) 
  USING earnings::numeric(12,4);

-- Server-side enforcement: auto-close sessions older than 30 minutes
-- This runs as a database function that can be called via pg_cron or on-demand

-- Function to close stale sessions (active sessions > 30 min)
CREATE OR REPLACE FUNCTION close_stale_sessions()
RETURNS void AS $$
BEGIN
  UPDATE sessions
  SET 
    is_active = false,
    end_time = start_time + INTERVAL '30 minutes',
    duration = 1800,  -- 30 minutes in seconds
    earnings = COALESCE(
      (SELECT (p.hourly_wage * 1800.0 / 3600.0)::text 
       FROM profiles p WHERE p.id = sessions.user_id),
      '0'
    )
  WHERE is_active = true
    AND start_time < NOW() - INTERVAL '30 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also add a trigger to prevent creating sessions with start_time in the past
CREATE OR REPLACE FUNCTION validate_session_start()
RETURNS trigger AS $$
BEGIN
  -- Reject sessions with start_time more than 1 minute in the past
  IF NEW.start_time < NOW() - INTERVAL '1 minute' THEN
    RAISE EXCEPTION 'Cannot create session with start_time in the past';
  END IF;
  
  -- Reject if user already has an active session
  IF EXISTS (
    SELECT 1 FROM sessions 
    WHERE user_id = NEW.user_id 
      AND is_active = true 
      AND id != COALESCE(NEW.id, '')
  ) THEN
    RAISE EXCEPTION 'User already has an active session';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger (drop first if exists)
DROP TRIGGER IF EXISTS validate_session_start_trigger ON sessions;
CREATE TRIGGER validate_session_start_trigger
  BEFORE INSERT ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION validate_session_start();

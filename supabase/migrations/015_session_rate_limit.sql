-- Server-side rate limiting: max 20 sessions per user per day
CREATE OR REPLACE FUNCTION check_session_rate_limit()
RETURNS trigger AS $$
DECLARE
  session_count integer;
BEGIN
  SELECT COUNT(*) INTO session_count
  FROM sessions
  WHERE user_id = NEW.user_id
    AND start_time > NOW() - INTERVAL '24 hours';

  IF session_count >= 20 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 20 sessions per 24 hours';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_session_rate_limit_trigger ON sessions;
CREATE TRIGGER check_session_rate_limit_trigger
  BEFORE INSERT ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION check_session_rate_limit();

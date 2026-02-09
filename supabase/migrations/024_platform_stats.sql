-- Platform-wide statistics for landing page social proof
-- Returns aggregate stats without exposing individual user data

CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS TABLE (
  total_users bigint,
  total_sessions bigint,
  total_hours_tracked numeric,
  total_earnings numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::bigint FROM profiles) as total_users,
    (SELECT COUNT(*)::bigint FROM sessions WHERE is_active = false) as total_sessions,
    (SELECT COALESCE(SUM(duration)::numeric / 3600, 0) FROM sessions WHERE is_active = false) as total_hours_tracked,
    (SELECT COALESCE(SUM(earnings)::numeric, 0) FROM sessions WHERE is_active = false) as total_earnings;
END;
$$;

-- Allow public access to platform stats (no auth required for landing page)
GRANT EXECUTE ON FUNCTION get_platform_stats() TO anon;
GRANT EXECUTE ON FUNCTION get_platform_stats() TO authenticated;

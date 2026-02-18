-- Recent activity stats for landing page social proof
-- Shows "X users this week" and "Y sessions today" to create FOMO/urgency
-- Related: GitHub issue #23

CREATE OR REPLACE FUNCTION get_recent_activity()
RETURNS TABLE (
  users_this_week bigint,
  sessions_today bigint,
  earnings_today numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::bigint FROM profiles WHERE created_at > NOW() - INTERVAL '7 days') as users_this_week,
    (SELECT COUNT(*)::bigint FROM sessions WHERE is_active = false AND created_at > NOW() - INTERVAL '24 hours') as sessions_today,
    (SELECT COALESCE(SUM(earnings)::numeric, 0) FROM sessions WHERE is_active = false AND created_at > NOW() - INTERVAL '24 hours') as earnings_today;
END;
$$;

-- Allow public access (no auth required — landing page is public)
GRANT EXECUTE ON FUNCTION get_recent_activity() TO anon;
GRANT EXECUTE ON FUNCTION get_recent_activity() TO authenticated;

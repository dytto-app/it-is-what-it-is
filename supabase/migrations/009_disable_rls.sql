-- Disable RLS on all tables (frontend will handle auth checks via auth.uid())
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cosmetics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cosmetics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_equipped_cosmetics DISABLE ROW LEVEL SECURITY;

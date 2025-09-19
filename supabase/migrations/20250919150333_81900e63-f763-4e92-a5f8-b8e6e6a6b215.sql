-- Create a secure function to count users per golf club without exposing personal data
CREATE OR REPLACE FUNCTION public.get_golf_club_user_counts()
RETURNS TABLE(home_club text, user_count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.home_club,
    COUNT(*) as user_count
  FROM public.profiles p
  WHERE p.home_club IS NOT NULL
  GROUP BY p.home_club;
$$;
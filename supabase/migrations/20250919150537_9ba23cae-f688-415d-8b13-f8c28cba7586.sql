-- Create a secure admin function to get accurate user statistics
CREATE OR REPLACE FUNCTION public.get_admin_user_stats()
RETURNS TABLE(
  total_users bigint,
  active_profiles bigint,
  incomplete_profiles bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  WITH profile_stats AS (
    SELECT 
      COUNT(*) as total_count,
      COUNT(CASE 
        WHEN name IS NOT NULL 
        AND birth_date IS NOT NULL 
        AND gender IS NOT NULL 
        AND handicap IS NOT NULL 
        AND home_city IS NOT NULL 
        THEN 1 
      END) as complete_count
    FROM public.profiles
  )
  SELECT 
    total_count as total_users,
    complete_count as active_profiles,
    (total_count - complete_count) as incomplete_profiles
  FROM profile_stats;
$$;
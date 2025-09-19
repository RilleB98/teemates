-- Fix security issues with profiles table RLS policy
-- Issue 1: Restrict profile visibility to protect personal data
-- Issue 2: Remove push_token from searchable fields

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow profile search and friend visibility" ON public.profiles;

-- Create a more restrictive policy that protects personal data
CREATE POLICY "Restricted profile access policy"
ON public.profiles
FOR SELECT
USING (
  -- Users can always see their own profile (full access)
  auth.uid() = user_id 
  OR 
  -- Users can see profiles of accepted friends (full access)
  (
    auth.uid() IS NOT NULL 
    AND user_id <> auth.uid() 
    AND EXISTS (
      SELECT 1 FROM friends 
      WHERE friends.status = 'accepted'
      AND (
        (friends.user_id = auth.uid() AND friends.friend_id = profiles.user_id) 
        OR 
        (friends.user_id = profiles.user_id AND friends.friend_id = auth.uid())
      )
    )
  )
);

-- Create a separate view for limited search data that only exposes minimal info
CREATE OR REPLACE VIEW public.searchable_profiles AS
SELECT 
  user_id,
  name,
  golf_id,
  handicap,
  home_club
FROM public.profiles
WHERE 
  name IS NOT NULL 
  AND golf_id IS NOT NULL;

-- Enable RLS on the view
ALTER VIEW public.searchable_profiles SET (security_barrier = true);

-- Create RLS policy for the searchable view
CREATE POLICY "Allow limited profile search"
ON public.searchable_profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND user_id <> auth.uid()
);
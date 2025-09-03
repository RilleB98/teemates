-- Fix security vulnerability in profiles table RLS policy
-- The current policy allows any authenticated user to view profiles with names
-- This should be restricted to only the user themselves and their accepted friends

-- Drop the existing policy
DROP POLICY IF EXISTS "Profile access policy" ON public.profiles;

-- Create a new secure policy that only allows:
-- 1. Users to view their own profile
-- 2. Users to view profiles of their accepted friends
CREATE POLICY "Secure profile access policy" ON public.profiles
FOR SELECT
USING (
  -- User can view their own profile
  (auth.uid() = user_id) 
  OR 
  -- User can view profiles of accepted friends
  (
    auth.uid() IS NOT NULL 
    AND user_id <> auth.uid() 
    AND EXISTS (
      SELECT 1
      FROM friends
      WHERE friends.status = 'accepted'
        AND (
          (friends.user_id = auth.uid() AND friends.friend_id = profiles.user_id)
          OR 
          (friends.user_id = profiles.user_id AND friends.friend_id = auth.uid())
        )
    )
  )
);
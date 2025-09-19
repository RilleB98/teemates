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

-- Create a security definer function for safe profile search by golf_id
-- This allows searching by golf_id while protecting sensitive data
CREATE OR REPLACE FUNCTION public.search_profiles_by_golf_id(search_golf_id text)
RETURNS TABLE (
  user_id uuid,
  name text,
  golf_id text,
  handicap numeric,
  home_club text,
  avatar_url text
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.name,
    p.golf_id,
    p.handicap,
    p.home_club,
    p.avatar_url
  FROM profiles p
  WHERE 
    p.golf_id = search_golf_id
    AND p.user_id != COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
    AND p.name IS NOT NULL
    AND p.golf_id IS NOT NULL
  LIMIT 10;
$$;
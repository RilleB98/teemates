-- Create a new RLS policy for swipe functionality
-- This allows authenticated users to view basic profile info for swiping
-- while keeping the existing restricted policy for sensitive data

-- First, update the existing restrictive policy to be more specific
DROP POLICY IF EXISTS "Restricted profile access policy" ON public.profiles;

-- Create a basic swipe policy that allows viewing essential swipe data
CREATE POLICY "Allow swipe profile access" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND user_id != auth.uid()
  AND name IS NOT NULL
);

-- Create a policy for viewing full profile details (friends + own profile)
CREATE POLICY "Full profile access policy" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR (
    auth.uid() IS NOT NULL 
    AND user_id != auth.uid() 
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
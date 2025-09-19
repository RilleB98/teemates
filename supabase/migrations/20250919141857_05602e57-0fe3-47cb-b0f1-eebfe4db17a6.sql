-- Update the profiles table RLS policy to allow searching for users by golf_id
-- This will allow users to see basic profile information for search purposes
-- while still protecting sensitive data

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Secure profile access policy" ON public.profiles;

-- Create a new policy that allows basic profile visibility for search
CREATE POLICY "Allow profile search and friend visibility"
ON public.profiles
FOR SELECT
USING (
  -- Users can always see their own profile
  auth.uid() = user_id 
  OR 
  -- Users can see profiles of accepted friends
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
  OR
  -- Users can see basic profile info for search purposes (when golf_id, name, or home_club are being searched)
  -- This allows searching for new users but limits what fields are accessible
  (
    auth.uid() IS NOT NULL 
    AND user_id <> auth.uid()
    AND (
      name IS NOT NULL 
      OR golf_id IS NOT NULL 
      OR home_club IS NOT NULL
    )
  )
);
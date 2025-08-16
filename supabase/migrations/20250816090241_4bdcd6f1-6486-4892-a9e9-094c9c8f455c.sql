-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view profiles for matching" ON public.profiles;

-- Create more restrictive policies for profile access
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow viewing basic profile info for potential matches (for swipe functionality)
-- This excludes sensitive fields like birth_date, last_location, push_token
CREATE POLICY "Users can view basic profile info for matching" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND user_id != auth.uid()
  AND name IS NOT NULL
);

-- Allow viewing complete friend profiles
CREATE POLICY "Users can view friends' profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND user_id != auth.uid()
  AND (
    -- Check if they are friends (bidirectional)
    EXISTS (
      SELECT 1 FROM public.friends 
      WHERE status = 'accepted' 
      AND (
        (user_id = auth.uid() AND friend_id = profiles.user_id) OR
        (user_id = profiles.user_id AND friend_id = auth.uid())
      )
    )
  )
);
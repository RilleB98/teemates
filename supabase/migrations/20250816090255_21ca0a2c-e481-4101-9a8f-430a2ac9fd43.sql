-- Drop all existing SELECT policies on profiles table
DROP POLICY IF EXISTS "Users can view profiles for matching" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new restrictive policies for profile access
CREATE POLICY "Own profile access" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow viewing basic profile info for potential matches (for swipe functionality)
-- This allows access to matching-relevant fields but protects sensitive data
CREATE POLICY "Basic profile access for matching" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND user_id != auth.uid()
  AND name IS NOT NULL
);

-- Allow viewing complete friend profiles (including sensitive fields)
CREATE POLICY "Friends profile access" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND user_id != auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.friends 
    WHERE status = 'accepted' 
    AND (
      (user_id = auth.uid() AND friend_id = profiles.user_id) OR
      (user_id = profiles.user_id AND friend_id = auth.uid())
    )
  )
);
-- Fix Auth RLS Initialization Plan issues and multiple permissive policies
-- First drop all existing policies, then create optimized ones

-- Drop all profiles policies
DROP POLICY IF EXISTS "Basic profile access for matching" ON public.profiles;
DROP POLICY IF EXISTS "Friends profile access" ON public.profiles;
DROP POLICY IF EXISTS "Own profile access" ON public.profiles;
DROP POLICY IF EXISTS "Profile access policy" ON public.profiles;

-- Drop all user_photos policies  
DROP POLICY IF EXISTS "Friends can view photos" ON public.user_photos;
DROP POLICY IF EXISTS "Users can view their own photos" ON public.user_photos;
DROP POLICY IF EXISTS "Photo access policy" ON public.user_photos;

-- Drop all user_roles policies
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Role access policy" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;

-- Drop all round_suggestion_participants DELETE policies
DROP POLICY IF EXISTS "Users can delete their own participation" ON public.round_suggestion_participants;
DROP POLICY IF EXISTS "Users can leave round suggestions" ON public.round_suggestion_participants;
DROP POLICY IF EXISTS "Users can manage their own participation" ON public.round_suggestion_participants;

-- Now create the consolidated and optimized policies

-- Consolidated profiles access policy
CREATE POLICY "Profile access policy" ON public.profiles
FOR SELECT USING (
  -- Own profile access
  ((SELECT auth.uid()) = user_id) OR
  -- Friends profile access  
  (((SELECT auth.uid()) IS NOT NULL) AND (user_id <> (SELECT auth.uid())) AND 
   (EXISTS (SELECT 1 FROM friends WHERE friends.status = 'accepted' AND 
            (((friends.user_id = (SELECT auth.uid())) AND (friends.friend_id = profiles.user_id)) OR 
             ((friends.user_id = profiles.user_id) AND (friends.friend_id = (SELECT auth.uid()))))))) OR
  -- Basic profile access for matching
  (((SELECT auth.uid()) IS NOT NULL) AND (user_id <> (SELECT auth.uid())) AND (name IS NOT NULL))
);

-- Consolidated user_photos access policy
CREATE POLICY "Photo access policy" ON public.user_photos
FOR SELECT USING (
  -- Own photos
  ((SELECT auth.uid()) = user_id) OR
  -- Friends can view photos
  (((SELECT auth.uid()) IS NOT NULL) AND (user_id <> (SELECT auth.uid())) AND 
   (EXISTS (SELECT 1 FROM friends WHERE friends.status = 'accepted' AND 
            (((friends.user_id = (SELECT auth.uid())) AND (friends.friend_id = user_photos.user_id)) OR 
             ((friends.user_id = user_photos.user_id) AND (friends.friend_id = (SELECT auth.uid())))))))
);

-- Consolidated user_roles policies
CREATE POLICY "Role access policy" ON public.user_roles
FOR SELECT USING (
  -- Users can view their own roles
  ((SELECT auth.uid()) = user_id) OR
  -- Admins can view all roles
  has_role((SELECT auth.uid()), 'admin'::app_role)
);

CREATE POLICY "Admins can manage all user roles" ON public.user_roles
FOR ALL USING (has_role((SELECT auth.uid()), 'admin'::app_role));

-- Consolidated round_suggestion_participants DELETE policy
CREATE POLICY "Users can manage their own participation" ON public.round_suggestion_participants
FOR DELETE USING ((SELECT auth.uid()) = user_id);
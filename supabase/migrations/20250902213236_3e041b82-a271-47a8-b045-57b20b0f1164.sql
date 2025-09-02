-- Fix Auth RLS Initialization Plan issues by optimizing auth.uid() calls
-- Replace auth.uid() with (SELECT auth.uid()) for better performance

-- Drop and recreate group_chat_members policies
DROP POLICY IF EXISTS "Members can leave groups" ON public.group_chat_members;
DROP POLICY IF EXISTS "Members can view group chat members safely" ON public.group_chat_members;
DROP POLICY IF EXISTS "Group creators and round participants can add members" ON public.group_chat_members;

CREATE POLICY "Members can leave groups" ON public.group_chat_members
FOR DELETE USING (
  (user_id = (SELECT auth.uid())) OR 
  (group_chat_id IN (SELECT gc.id FROM group_chats gc WHERE gc.created_by = (SELECT auth.uid())))
);

CREATE POLICY "Members can view group chat members safely" ON public.group_chat_members
FOR SELECT USING (
  is_group_member(group_chat_id, (SELECT auth.uid())) OR 
  (group_chat_id IN (SELECT gc.id FROM group_chats gc WHERE gc.created_by = (SELECT auth.uid())))
);

CREATE POLICY "Group creators and round participants can add members" ON public.group_chat_members
FOR INSERT WITH CHECK (
  (group_chat_id IN (SELECT gc.id FROM group_chats gc WHERE gc.created_by = (SELECT auth.uid()))) OR 
  ((user_id = (SELECT auth.uid())) AND (group_chat_id IN (SELECT rs.group_chat_id FROM round_suggestions rs WHERE rs.group_chat_id IS NOT NULL)))
);

-- Drop and recreate group_chats policies
DROP POLICY IF EXISTS "Users can create group chats" ON public.group_chats;
DROP POLICY IF EXISTS "Users can update their own group chats" ON public.group_chats;
DROP POLICY IF EXISTS "Users can delete their own group chats" ON public.group_chats;
DROP POLICY IF EXISTS "Users can view group chats they created or are members of" ON public.group_chats;

CREATE POLICY "Users can create group chats" ON public.group_chats
FOR INSERT WITH CHECK ((SELECT auth.uid()) = created_by);

CREATE POLICY "Users can update their own group chats" ON public.group_chats
FOR UPDATE USING ((SELECT auth.uid()) = created_by);

CREATE POLICY "Users can delete their own group chats" ON public.group_chats
FOR DELETE USING ((SELECT auth.uid()) = created_by);

CREATE POLICY "Users can view group chats they created or are members of" ON public.group_chats
FOR SELECT USING (
  ((SELECT auth.uid()) = created_by) OR 
  is_group_member(id, (SELECT auth.uid()))
);

-- Fix multiple permissive policies by consolidating them

-- Consolidate profiles SELECT policies
DROP POLICY IF EXISTS "Basic profile access for matching" ON public.profiles;
DROP POLICY IF EXISTS "Friends profile access" ON public.profiles;
DROP POLICY IF EXISTS "Own profile access" ON public.profiles;

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

-- Consolidate round_suggestion_participants DELETE policies
DROP POLICY IF EXISTS "Users can delete their own participation" ON public.round_suggestion_participants;
DROP POLICY IF EXISTS "Users can leave round suggestions" ON public.round_suggestion_participants;

CREATE POLICY "Users can manage their own participation" ON public.round_suggestion_participants
FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Consolidate user_photos SELECT policies
DROP POLICY IF EXISTS "Friends can view photos" ON public.user_photos;
DROP POLICY IF EXISTS "Users can view their own photos" ON public.user_photos;

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

-- Consolidate user_roles SELECT policies
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Role access policy" ON public.user_roles
FOR SELECT USING (
  -- Users can view their own roles
  ((SELECT auth.uid()) = user_id) OR
  -- Admins can view all roles
  has_role((SELECT auth.uid()), 'admin'::app_role)
);

-- Recreate admin management policy for user_roles
CREATE POLICY "Admins can manage all user roles" ON public.user_roles
FOR ALL USING (has_role((SELECT auth.uid()), 'admin'::app_role));
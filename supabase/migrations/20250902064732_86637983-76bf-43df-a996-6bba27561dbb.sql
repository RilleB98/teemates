-- Fix RLS performance issues by optimizing auth.uid() calls
-- Replace auth.uid() with (select auth.uid()) to prevent re-evaluation for each row

-- Drop and recreate policies for profiles table
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Own profile access" ON public.profiles;
DROP POLICY IF EXISTS "Basic profile access for matching" ON public.profiles;
DROP POLICY IF EXISTS "Friends profile access" ON public.profiles;

CREATE POLICY "Users can create their own profile" ON public.profiles
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Own profile access" ON public.profiles
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Basic profile access for matching" ON public.profiles
FOR SELECT USING (((select auth.uid()) IS NOT NULL) AND (user_id <> (select auth.uid())) AND (name IS NOT NULL));

CREATE POLICY "Friends profile access" ON public.profiles
FOR SELECT USING (((select auth.uid()) IS NOT NULL) AND (user_id <> (select auth.uid())) AND (EXISTS ( SELECT 1
   FROM friends
  WHERE ((friends.status = 'accepted'::text) AND (((friends.user_id = (select auth.uid())) AND (friends.friend_id = profiles.user_id)) OR ((friends.user_id = profiles.user_id) AND (friends.friend_id = (select auth.uid()))))))));

-- Drop and recreate policies for messages table
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;
DROP POLICY IF EXISTS "Secure chat room access" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in accessible rooms" ON public.messages;

CREATE POLICY "Users can update their own messages" ON public.messages
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own messages" ON public.messages
FOR DELETE USING ((select auth.uid()) = user_id);

CREATE POLICY "Secure chat room access" ON public.messages
FOR SELECT USING (((select auth.uid()) IS NOT NULL) AND can_access_chat_room((select auth.uid()), chat_room_id));

CREATE POLICY "Users can create messages in accessible rooms" ON public.messages
FOR INSERT WITH CHECK (((select auth.uid()) = user_id) AND can_access_chat_room((select auth.uid()), chat_room_id));

-- Drop and recreate policies for user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (has_role((select auth.uid()), 'admin'::app_role));

-- Drop and recreate policies for friends table
DROP POLICY IF EXISTS "Users can view their friendships and pending requests" ON public.friends;
DROP POLICY IF EXISTS "Users can create friend requests" ON public.friends;
DROP POLICY IF EXISTS "Users can update friend requests they received" ON public.friends;
DROP POLICY IF EXISTS "Users can delete their own friendships" ON public.friends;

CREATE POLICY "Users can view their friendships and pending requests" ON public.friends
FOR SELECT USING (((select auth.uid()) = user_id) OR ((select auth.uid()) = friend_id));

CREATE POLICY "Users can create friend requests" ON public.friends
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update friend requests they received" ON public.friends
FOR UPDATE USING ((select auth.uid()) = friend_id);

CREATE POLICY "Users can delete their own friendships" ON public.friends
FOR DELETE USING (((select auth.uid()) = user_id) OR ((select auth.uid()) = friend_id));

-- Drop and recreate policies for favorite_golf_courses table
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorite_golf_courses;
DROP POLICY IF EXISTS "Users can create their own favorites" ON public.favorite_golf_courses;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorite_golf_courses;

CREATE POLICY "Users can view their own favorites" ON public.favorite_golf_courses
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own favorites" ON public.favorite_golf_courses
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own favorites" ON public.favorite_golf_courses
FOR DELETE USING ((select auth.uid()) = user_id);

-- Drop and recreate policies for message_reads table
DROP POLICY IF EXISTS "Users can view their own read status" ON public.message_reads;
DROP POLICY IF EXISTS "Users can mark messages as read" ON public.message_reads;
DROP POLICY IF EXISTS "Users can update their own read status" ON public.message_reads;

CREATE POLICY "Users can view their own read status" ON public.message_reads
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can mark messages as read" ON public.message_reads
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own read status" ON public.message_reads
FOR UPDATE USING ((select auth.uid()) = user_id);

-- Drop and recreate policies for chat_room_members table
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.chat_room_members;

CREATE POLICY "Users can view their own memberships" ON public.chat_room_members
FOR SELECT USING ((select auth.uid()) = user_id);

-- Drop and recreate policies for user_swipes table
DROP POLICY IF EXISTS "Users can create their own swipes" ON public.user_swipes;
DROP POLICY IF EXISTS "Users can view their own swipes" ON public.user_swipes;
DROP POLICY IF EXISTS "Users can update their own swipes" ON public.user_swipes;

CREATE POLICY "Users can create their own swipes" ON public.user_swipes
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can view their own swipes" ON public.user_swipes
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own swipes" ON public.user_swipes
FOR UPDATE USING ((select auth.uid()) = user_id);

-- Drop and recreate policies for user_photos table
DROP POLICY IF EXISTS "Users can view their own photos" ON public.user_photos;
DROP POLICY IF EXISTS "Users can insert their own photos" ON public.user_photos;
DROP POLICY IF EXISTS "Users can update their own photos" ON public.user_photos;
DROP POLICY IF EXISTS "Users can delete their own photos" ON public.user_photos;
DROP POLICY IF EXISTS "Friends can view photos" ON public.user_photos;

CREATE POLICY "Users can view their own photos" ON public.user_photos
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own photos" ON public.user_photos
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own photos" ON public.user_photos
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own photos" ON public.user_photos
FOR DELETE USING ((select auth.uid()) = user_id);

CREATE POLICY "Friends can view photos" ON public.user_photos
FOR SELECT USING (((select auth.uid()) IS NOT NULL) AND (user_id <> (select auth.uid())) AND (EXISTS ( SELECT 1
   FROM friends
  WHERE ((friends.status = 'accepted'::text) AND (((friends.user_id = (select auth.uid())) AND (friends.friend_id = user_photos.user_id)) OR ((friends.user_id = user_photos.user_id) AND (friends.friend_id = (select auth.uid()))))))));

-- Drop and recreate policies for round_suggestions table
DROP POLICY IF EXISTS "Users can create their own round suggestions" ON public.round_suggestions;
DROP POLICY IF EXISTS "Users can update their own round suggestions" ON public.round_suggestions;
DROP POLICY IF EXISTS "Users can delete their own round suggestions" ON public.round_suggestions;
DROP POLICY IF EXISTS "Users can view round suggestions from friends" ON public.round_suggestions;

CREATE POLICY "Users can create their own round suggestions" ON public.round_suggestions
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own round suggestions" ON public.round_suggestions
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own round suggestions" ON public.round_suggestions
FOR DELETE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view round suggestions from friends" ON public.round_suggestions
FOR SELECT USING (((select auth.uid()) IS NOT NULL) AND ((user_id = (select auth.uid())) OR (EXISTS ( SELECT 1
   FROM friends
  WHERE ((friends.status = 'accepted'::text) AND (((friends.user_id = (select auth.uid())) AND (friends.friend_id = round_suggestions.user_id)) OR ((friends.user_id = round_suggestions.user_id) AND (friends.friend_id = (select auth.uid())))))))));

-- Drop and recreate policies for round_suggestion_participants table
DROP POLICY IF EXISTS "Users can join round suggestions from friends" ON public.round_suggestion_participants;
DROP POLICY IF EXISTS "Users can update their own participation status" ON public.round_suggestion_participants;
DROP POLICY IF EXISTS "Users can view participants for accessible round suggestions" ON public.round_suggestion_participants;
DROP POLICY IF EXISTS "Users can leave round suggestions" ON public.round_suggestion_participants;
DROP POLICY IF EXISTS "Users can delete their own participation" ON public.round_suggestion_participants;

CREATE POLICY "Users can join round suggestions from friends" ON public.round_suggestion_participants
FOR INSERT WITH CHECK (((select auth.uid()) = user_id) AND (EXISTS ( SELECT 1
   FROM (round_suggestions rs
     JOIN friends f ON ((((f.user_id = (select auth.uid())) AND (f.friend_id = rs.user_id)) OR ((f.user_id = rs.user_id) AND (f.friend_id = (select auth.uid()))))))
  WHERE ((rs.id = round_suggestion_participants.round_suggestion_id) AND (f.status = 'accepted'::text)))));

CREATE POLICY "Users can update their own participation status" ON public.round_suggestion_participants
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view participants for accessible round suggestions" ON public.round_suggestion_participants
FOR SELECT USING (EXISTS ( SELECT 1
   FROM round_suggestions rs
  WHERE ((rs.id = round_suggestion_participants.round_suggestion_id) AND ((rs.user_id = (select auth.uid())) OR (EXISTS ( SELECT 1
           FROM friends
          WHERE ((friends.status = 'accepted'::text) AND (((friends.user_id = (select auth.uid())) AND (friends.friend_id = rs.user_id)) OR ((friends.user_id = rs.user_id) AND (friends.friend_id = (select auth.uid()))))))))))));

CREATE POLICY "Users can leave round suggestions" ON public.round_suggestion_participants
FOR DELETE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own participation" ON public.round_suggestion_participants
FOR DELETE USING ((select auth.uid()) = user_id);

-- Drop and recreate policies for group_chats table
DROP POLICY IF EXISTS "authenticated_users_insert" ON public.group_chats;
DROP POLICY IF EXISTS "creators_update" ON public.group_chats;
DROP POLICY IF EXISTS "creators_delete" ON public.group_chats;
DROP POLICY IF EXISTS "users_can_view_groups" ON public.group_chats;

CREATE POLICY "authenticated_users_insert" ON public.group_chats
FOR INSERT WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "creators_update" ON public.group_chats
FOR UPDATE USING (created_by = (select auth.uid()));

CREATE POLICY "creators_delete" ON public.group_chats
FOR DELETE USING (created_by = (select auth.uid()));

CREATE POLICY "users_can_view_groups" ON public.group_chats
FOR SELECT USING ((created_by = (select auth.uid())) OR (EXISTS ( SELECT 1
   FROM group_chat_members
  WHERE ((group_chat_members.group_chat_id = group_chats.id) AND (group_chat_members.user_id = (select auth.uid()))))));

-- Drop and recreate policies for group_chat_members table
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public.group_chat_members;
DROP POLICY IF EXISTS "Creators can add members" ON public.group_chat_members;
DROP POLICY IF EXISTS "Remove members" ON public.group_chat_members;
DROP POLICY IF EXISTS "Users can remove themselves or creators can remove members" ON public.group_chat_members;

CREATE POLICY "Allow authenticated users to insert" ON public.group_chat_members
FOR INSERT WITH CHECK ((select auth.uid()) = added_by);

CREATE POLICY "Creators can add members" ON public.group_chat_members
FOR INSERT WITH CHECK (((select auth.uid()) = added_by) AND (EXISTS ( SELECT 1
   FROM group_chats
  WHERE ((group_chats.id = group_chat_members.group_chat_id) AND (group_chats.created_by = (select auth.uid()))))));

CREATE POLICY "Users can remove themselves or creators can remove members" ON public.group_chat_members
FOR DELETE USING (((select auth.uid()) = user_id) OR (EXISTS ( SELECT 1
   FROM group_chats
  WHERE ((group_chats.id = group_chat_members.group_chat_id) AND (group_chats.created_by = (select auth.uid()))))));
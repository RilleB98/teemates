-- Remove the overly permissive policies for group_chats
DROP POLICY IF EXISTS "simple_group_chats_all" ON public.group_chats;

-- Remove the overly permissive policies for group_chat_members  
DROP POLICY IF EXISTS "simple_group_chat_members_all" ON public.group_chat_members;

-- Create proper RLS policies for group_chats
-- Users can only see group chats they are members of
CREATE POLICY "Users can view group chats they are members of"
ON public.group_chats
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_chat_members
    WHERE group_chat_members.group_chat_id = group_chats.id
    AND group_chat_members.user_id = auth.uid()
  )
);

-- Users can create group chats
CREATE POLICY "Users can create group chats"
ON public.group_chats
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Users can update group chats they created
CREATE POLICY "Users can update their own group chats"
ON public.group_chats
FOR UPDATE
USING (auth.uid() = created_by);

-- Users can delete group chats they created
CREATE POLICY "Users can delete their own group chats"
ON public.group_chats
FOR DELETE
USING (auth.uid() = created_by);

-- Create proper RLS policies for group_chat_members
-- Users can view members of groups they belong to
CREATE POLICY "Users can view members of their groups"
ON public.group_chat_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_chat_members gm
    WHERE gm.group_chat_id = group_chat_members.group_chat_id
    AND gm.user_id = auth.uid()
  )
);

-- Users can add members to groups they belong to
CREATE POLICY "Users can add members to their groups"
ON public.group_chat_members
FOR INSERT
WITH CHECK (
  auth.uid() = added_by AND
  EXISTS (
    SELECT 1 FROM public.group_chat_members
    WHERE group_chat_id = group_chat_members.group_chat_id
    AND user_id = auth.uid()
  )
);

-- Users can remove themselves from groups
CREATE POLICY "Users can remove themselves from groups"
ON public.group_chat_members
FOR DELETE
USING (auth.uid() = user_id);

-- Group creators can remove any member
CREATE POLICY "Group creators can remove any member"
ON public.group_chat_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.group_chats
    WHERE group_chats.id = group_chat_members.group_chat_id
    AND group_chats.created_by = auth.uid()
  )
);
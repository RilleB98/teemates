-- Fix infinite recursion in group_chat_members RLS policies
-- Drop existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view group chat members of their groups" ON public.group_chat_members;
DROP POLICY IF EXISTS "Users can add members to their group chats" ON public.group_chat_members;
DROP POLICY IF EXISTS "Users can remove themselves from group chats" ON public.group_chat_members;

-- Create new policies without recursion
CREATE POLICY "Users can view group chat members"
ON public.group_chat_members
FOR SELECT
USING (
  user_id = auth.uid() OR 
  group_chat_id IN (
    SELECT id FROM public.group_chats 
    WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can add members to group chats they created"
ON public.group_chat_members
FOR INSERT
WITH CHECK (
  group_chat_id IN (
    SELECT id FROM public.group_chats 
    WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can remove themselves from group chats"
ON public.group_chat_members
FOR DELETE
USING (user_id = auth.uid());

CREATE POLICY "Group creators can remove members"
ON public.group_chat_members
FOR DELETE
USING (
  group_chat_id IN (
    SELECT id FROM public.group_chats 
    WHERE created_by = auth.uid()
  )
);
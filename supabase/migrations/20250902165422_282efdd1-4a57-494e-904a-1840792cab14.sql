-- Clean up all conflicting group_chat_members policies and create unified ones
DROP POLICY IF EXISTS "Users can view group chat members" ON public.group_chat_members;
DROP POLICY IF EXISTS "Users can add members to group chats they created" ON public.group_chat_members;
DROP POLICY IF EXISTS "Users can remove themselves from group chats" ON public.group_chat_members;
DROP POLICY IF EXISTS "Group creators can remove members" ON public.group_chat_members;
DROP POLICY IF EXISTS "Group creators can remove any member" ON public.group_chat_members;
DROP POLICY IF EXISTS "Users can add members to their groups" ON public.group_chat_members;
DROP POLICY IF EXISTS "Users can remove themselves from groups" ON public.group_chat_members;
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_chat_members;

-- Create clean, non-conflicting policies for group_chat_members
CREATE POLICY "Members can view group chat members"
ON public.group_chat_members
FOR SELECT
USING (
  -- Users can see members of groups they belong to
  group_chat_id IN (
    SELECT gcm.group_chat_id 
    FROM public.group_chat_members gcm 
    WHERE gcm.user_id = auth.uid()
  )
  OR
  -- Group creators can see all members of their groups
  group_chat_id IN (
    SELECT gc.id 
    FROM public.group_chats gc 
    WHERE gc.created_by = auth.uid()
  )
);

CREATE POLICY "Group creators can add members"
ON public.group_chat_members
FOR INSERT
WITH CHECK (
  -- Only group creators can add members
  group_chat_id IN (
    SELECT gc.id 
    FROM public.group_chats gc 
    WHERE gc.created_by = auth.uid()
  )
);

CREATE POLICY "Members can leave groups"
ON public.group_chat_members
FOR DELETE
USING (
  -- Users can remove themselves
  user_id = auth.uid()
  OR
  -- Group creators can remove any member
  group_chat_id IN (
    SELECT gc.id 
    FROM public.group_chats gc 
    WHERE gc.created_by = auth.uid()
  )
);
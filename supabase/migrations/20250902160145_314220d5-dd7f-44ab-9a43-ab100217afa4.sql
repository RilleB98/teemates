-- First drop ALL existing policies on group_chat_members to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public.group_chat_members;
DROP POLICY IF EXISTS "Creators can add members" ON public.group_chat_members;
DROP POLICY IF EXISTS "Members can view group memberships" ON public.group_chat_members;
DROP POLICY IF EXISTS "Users can remove themselves or creators can remove members" ON public.group_chat_members;
DROP POLICY IF EXISTS "Users can add members to groups they created" ON public.group_chat_members;
DROP POLICY IF EXISTS "Users can view group memberships where they are members" ON public.group_chat_members;

-- Now create the correct non-recursive policies
CREATE POLICY "enable_insert_for_group_creators" 
ON public.group_chat_members 
FOR INSERT 
WITH CHECK (
  auth.uid() = added_by AND 
  EXISTS (
    SELECT 1 FROM public.group_chats 
    WHERE id = group_chat_members.group_chat_id 
    AND created_by = auth.uid()
  )
);

CREATE POLICY "enable_select_for_members_and_creators" 
ON public.group_chat_members 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.group_chats 
    WHERE id = group_chat_members.group_chat_id 
    AND created_by = auth.uid()
  )
);

CREATE POLICY "enable_delete_for_self_and_creators" 
ON public.group_chat_members 
FOR DELETE 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.group_chats 
    WHERE id = group_chat_members.group_chat_id 
    AND created_by = auth.uid()
  )
);
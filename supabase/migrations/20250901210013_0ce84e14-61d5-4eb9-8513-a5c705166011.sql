-- Drop duplicate and conflicting policies on group_chats
DROP POLICY IF EXISTS "allow_authenticated_insert" ON public.group_chats;
DROP POLICY IF EXISTS "authenticated_users_can_create_group_chats" ON public.group_chats;
DROP POLICY IF EXISTS "group_creators_can_delete_group_chats" ON public.group_chats;
DROP POLICY IF EXISTS "group_creators_can_update_group_chats" ON public.group_chats;
DROP POLICY IF EXISTS "group_members_can_view_group_chats" ON public.group_chats;

-- Create clean, simple policies
CREATE POLICY "Users can create group chats" 
ON public.group_chats 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Members can view group chats" 
ON public.group_chats 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.group_chat_members 
    WHERE group_chat_id = group_chats.id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Creators can update group chats" 
ON public.group_chats 
FOR UPDATE 
TO authenticated 
USING (created_by = auth.uid());

CREATE POLICY "Creators can delete group chats" 
ON public.group_chats 
FOR DELETE 
TO authenticated 
USING (created_by = auth.uid());
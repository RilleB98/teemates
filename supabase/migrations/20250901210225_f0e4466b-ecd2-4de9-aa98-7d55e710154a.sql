-- Drop the problematic SELECT policy and create a better one
DROP POLICY IF EXISTS "members_view" ON public.group_chats;

-- Allow users to view group chats they created OR are members of
CREATE POLICY "users_can_view_groups" 
ON public.group_chats 
FOR SELECT 
TO authenticated 
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.group_chat_members 
    WHERE group_chat_id = group_chats.id 
    AND user_id = auth.uid()
  )
);
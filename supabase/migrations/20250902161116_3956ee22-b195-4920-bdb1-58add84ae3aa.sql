-- Fix group_chats SELECT policy to allow members to see the chat too
DROP POLICY IF EXISTS "group_chats_select_policy" ON public.group_chats;

-- Allow both creators and members to see group chats
CREATE POLICY "group_chats_select_policy" 
ON public.group_chats 
FOR SELECT 
USING (
  created_by = auth.uid() OR 
  auth.uid() IN (
    SELECT user_id FROM public.group_chat_members 
    WHERE group_chat_id = group_chats.id
  )
);
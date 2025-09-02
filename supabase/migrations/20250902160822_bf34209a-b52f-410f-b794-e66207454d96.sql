-- Fix group_chat_members policies to allow self-joining
-- Drop existing policies
DROP POLICY IF EXISTS "enable_insert_for_group_creators" ON public.group_chat_members;
DROP POLICY IF EXISTS "enable_select_for_members_and_creators" ON public.group_chat_members;
DROP POLICY IF EXISTS "enable_delete_for_self_and_creators" ON public.group_chat_members;

-- Create new policies that allow users to join themselves
CREATE POLICY "group_chat_members_insert_policy" 
ON public.group_chat_members 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.group_chats 
    WHERE group_chats.id = group_chat_id 
    AND group_chats.created_by = auth.uid()
  )
);

CREATE POLICY "group_chat_members_select_policy" 
ON public.group_chat_members 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.group_chats 
    WHERE group_chats.id = group_chat_id 
    AND group_chats.created_by = auth.uid()
  )
);

CREATE POLICY "group_chat_members_delete_policy" 
ON public.group_chat_members 
FOR DELETE 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.group_chats 
    WHERE group_chats.id = group_chat_id 
    AND group_chats.created_by = auth.uid()
  )
);
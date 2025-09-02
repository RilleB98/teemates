-- Fix infinite recursion in group_chats policies
-- Drop the problematic policies first
DROP POLICY IF EXISTS "authenticated_users_insert" ON public.group_chats;
DROP POLICY IF EXISTS "creators_delete" ON public.group_chats;
DROP POLICY IF EXISTS "creators_update" ON public.group_chats;
DROP POLICY IF EXISTS "users_can_view_groups" ON public.group_chats;

-- Create simplified, non-recursive policies
CREATE POLICY "enable_insert_for_authenticated_users" 
ON public.group_chats 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "enable_select_for_creators_and_members" 
ON public.group_chats 
FOR SELECT 
USING (
  created_by = auth.uid() OR 
  auth.uid() IN (
    SELECT user_id FROM public.group_chat_members 
    WHERE group_chat_id = group_chats.id
  )
);

CREATE POLICY "enable_update_for_creators" 
ON public.group_chats 
FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "enable_delete_for_creators" 
ON public.group_chats 
FOR DELETE 
USING (created_by = auth.uid());
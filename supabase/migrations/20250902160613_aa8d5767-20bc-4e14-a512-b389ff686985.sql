-- Drop all existing policies on group_chats to start fresh
DROP POLICY IF EXISTS "enable_insert_for_authenticated_users" ON public.group_chats;
DROP POLICY IF EXISTS "enable_select_for_creators_and_members" ON public.group_chats;
DROP POLICY IF EXISTS "enable_update_for_creators" ON public.group_chats;
DROP POLICY IF EXISTS "enable_delete_for_creators" ON public.group_chats;

-- Create the simplest possible policies to avoid recursion
CREATE POLICY "group_chats_insert_policy" 
ON public.group_chats 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "group_chats_select_policy" 
ON public.group_chats 
FOR SELECT 
USING (created_by = auth.uid());

CREATE POLICY "group_chats_update_policy" 
ON public.group_chats 
FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "group_chats_delete_policy" 
ON public.group_chats 
FOR DELETE 
USING (created_by = auth.uid());
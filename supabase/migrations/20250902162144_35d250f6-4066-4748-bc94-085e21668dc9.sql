-- Completely simplify all group chat policies to avoid any recursion
-- Drop all existing policies first
DROP POLICY IF EXISTS "group_chats_insert_policy" ON public.group_chats;
DROP POLICY IF EXISTS "group_chats_select_policy" ON public.group_chats;
DROP POLICY IF EXISTS "group_chats_update_policy" ON public.group_chats;
DROP POLICY IF EXISTS "group_chats_delete_policy" ON public.group_chats;

DROP POLICY IF EXISTS "group_chat_members_insert_policy" ON public.group_chat_members;
DROP POLICY IF EXISTS "group_chat_members_select_policy" ON public.group_chat_members;
DROP POLICY IF EXISTS "group_chat_members_delete_policy" ON public.group_chat_members;

-- Create ultra simple policies for group_chats
CREATE POLICY "simple_group_chats_all" 
ON public.group_chats 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create ultra simple policies for group_chat_members  
CREATE POLICY "simple_group_chat_members_all" 
ON public.group_chat_members 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
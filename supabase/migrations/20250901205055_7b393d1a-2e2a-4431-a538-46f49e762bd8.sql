-- Check all current policies on group_chats
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'group_chats';

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'group_chats';

-- Temporarily disable RLS on group_chats for testing
ALTER TABLE public.group_chats DISABLE ROW LEVEL SECURITY;
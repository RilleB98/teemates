-- Drop ALL existing policies for group_chats
DROP POLICY IF EXISTS "Members can create group chats" ON public.group_chats;
DROP POLICY IF EXISTS "Users can create group chats" ON public.group_chats;
DROP POLICY IF EXISTS "authenticated_users_can_create_group_chats" ON public.group_chats;

-- View current policies
SELECT policyname FROM pg_policies WHERE tablename = 'group_chats';

-- Create a simple working policy for INSERT
CREATE POLICY "allow_authenticated_insert" 
ON public.group_chats 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
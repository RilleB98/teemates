-- First, let's check the current policies for group_chats
SELECT policyname, cmd, with_check 
FROM pg_policies 
WHERE tablename = 'group_chats' AND cmd = 'INSERT';

-- Drop existing policies and recreate simpler ones
DROP POLICY IF EXISTS "Members can create group chats" ON public.group_chats;
DROP POLICY IF EXISTS "Users can create group chats" ON public.group_chats;

-- Create a more explicit policy that should work
CREATE POLICY "authenticated_users_can_create_group_chats" 
ON public.group_chats 
FOR INSERT 
TO authenticated
WITH CHECK (true);
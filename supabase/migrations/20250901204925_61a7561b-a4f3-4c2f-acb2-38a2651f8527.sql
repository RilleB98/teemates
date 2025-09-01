-- Check and fix the RLS policy for group_chats INSERT
-- First, let's see what the current policy looks like
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'group_chats' AND cmd = 'INSERT';

-- Drop and recreate the INSERT policy with explicit check
DROP POLICY IF EXISTS "Members can create group chats" ON public.group_chats;

-- Create a simpler, more explicit policy
CREATE POLICY "Users can create group chats" 
ON public.group_chats 
FOR INSERT 
TO authenticated
WITH CHECK (created_by = auth.uid());
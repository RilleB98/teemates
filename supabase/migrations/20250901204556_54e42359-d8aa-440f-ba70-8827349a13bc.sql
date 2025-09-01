-- Drop and recreate the INSERT policy for group_chats with proper WITH CHECK
DROP POLICY IF EXISTS "Members can create group chats" ON public.group_chats;

CREATE POLICY "Members can create group chats" 
ON public.group_chats 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);
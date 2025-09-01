-- Fix the RLS policy for group_chat_members to allow creators to add themselves
DROP POLICY IF EXISTS "Members can add other members" ON public.group_chat_members;

-- Create a new policy that allows:
-- 1. Group chat creators to add members
-- 2. Existing members to add new members
CREATE POLICY "Members can add other members" 
ON public.group_chat_members 
FOR INSERT 
WITH CHECK (
  (auth.uid() = added_by) AND (
    -- Allow if user is the creator of the group chat
    EXISTS (
      SELECT 1 FROM public.group_chats 
      WHERE id = group_chat_id AND created_by = auth.uid()
    )
    OR
    -- Allow if user is already a member of the group chat
    EXISTS (
      SELECT 1 FROM public.group_chat_members gcm
      WHERE gcm.group_chat_id = group_chat_members.group_chat_id 
      AND gcm.user_id = auth.uid()
    )
  )
);
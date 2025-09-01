-- Drop the problematic function and policy
DROP FUNCTION IF EXISTS public.can_add_group_chat_member;
DROP POLICY IF EXISTS "Members can add other members" ON public.group_chat_members;

-- Create a much simpler policy that just allows:
-- 1. Group chat creators to add anyone
-- 2. Users to add themselves (for self-joining)
CREATE POLICY "Creators and self can add members" 
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
    -- Allow users to add themselves
    (auth.uid() = user_id)
  )
);
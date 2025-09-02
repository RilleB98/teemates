-- Fix issue where users can't be added to group chat when joining round suggestions
-- The problem is that only group creators can add members, but when someone joins a round
-- they should be able to add themselves to the group chat

-- Update the INSERT policy to allow users to add themselves to group chats
DROP POLICY IF EXISTS "Group creators can add members" ON public.group_chat_members;

CREATE POLICY "Group creators and round participants can add members"
ON public.group_chat_members
FOR INSERT
WITH CHECK (
  -- Group creators can add anyone
  group_chat_id IN (
    SELECT gc.id 
    FROM public.group_chats gc 
    WHERE gc.created_by = auth.uid()
  )
  OR
  -- Users can add themselves if the group chat is associated with a round suggestion
  (
    user_id = auth.uid() 
    AND group_chat_id IN (
      SELECT rs.group_chat_id 
      FROM public.round_suggestions rs 
      WHERE rs.group_chat_id IS NOT NULL
    )
  )
);
-- First drop the existing policy for group_chat_members INSERT
DROP POLICY IF EXISTS "Group creators and round participants can add members" ON public.group_chat_members;

-- Create a new policy that allows all group members to add new members
CREATE POLICY "Group members can add new members" ON public.group_chat_members
FOR INSERT
WITH CHECK (
  -- Group creators can always add members
  (group_chat_id IN (
    SELECT gc.id
    FROM group_chats gc
    WHERE gc.created_by = auth.uid()
  ))
  OR
  -- Current group members can add new members
  (added_by = auth.uid() AND group_chat_id IN (
    SELECT gcm.group_chat_id
    FROM group_chat_members gcm
    WHERE gcm.user_id = auth.uid()
  ))
  OR
  -- Users can join their own round suggestion group chats
  ((user_id = auth.uid()) AND (group_chat_id IN (
    SELECT rs.group_chat_id
    FROM round_suggestions rs
    WHERE rs.group_chat_id IS NOT NULL
  )))
);
-- Update INSERT policy for group_chat_members to allow all group members to add new members

-- Create a new policy that allows:
-- 1. Group creators to add members (existing functionality)  
-- 2. Current group members to add new members (new functionality)
-- 3. Round participants to join their round's group chat (existing functionality)
CREATE OR REPLACE POLICY "Group members can add new members" ON public.group_chat_members
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
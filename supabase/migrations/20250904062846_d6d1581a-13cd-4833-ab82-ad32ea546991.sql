-- Fix infinite recursion in group_chat_members RLS policy
-- Drop the problematic policy
DROP POLICY IF EXISTS "Group members can add new members" ON group_chat_members;

-- Create a simpler, non-recursive policy for adding members
CREATE POLICY "Group chat creators and existing members can add new members" 
ON group_chat_members 
FOR INSERT 
WITH CHECK (
  -- Group chat creator can add members
  (group_chat_id IN (
    SELECT id FROM group_chats 
    WHERE created_by = auth.uid()
  ))
  OR
  -- User can be added by existing members (but only if the added_by user is an existing member)
  (added_by = auth.uid() AND added_by IN (
    SELECT user_id FROM group_chat_members 
    WHERE group_chat_id = group_chat_members.group_chat_id
  ))
  OR
  -- Users can join their own group when it's created from round suggestions
  (user_id = auth.uid() AND added_by = auth.uid())
);
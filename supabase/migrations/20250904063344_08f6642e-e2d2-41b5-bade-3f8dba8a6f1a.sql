-- Fix the RLS policy issues for group_chat_members

-- First, let's create a security definer function to check group membership safely
CREATE OR REPLACE FUNCTION public.is_user_group_member(_group_chat_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_chat_members 
    WHERE group_chat_id = _group_chat_id 
    AND user_id = _user_id
  );
$$;

-- Drop the problematic policy again and create a new one
DROP POLICY IF EXISTS "Group chat creators and existing members can add new members" ON group_chat_members;

-- Create a simple policy for adding members that doesn't cause recursion
CREATE POLICY "Allow member insertion" 
ON group_chat_members 
FOR INSERT 
WITH CHECK (
  -- Group chat creator can always add members
  (group_chat_id IN (
    SELECT id FROM group_chats 
    WHERE created_by = auth.uid()
  ))
  OR
  -- Users can add themselves when creating round suggestions
  (user_id = auth.uid() AND added_by = auth.uid())
);

-- Fix the SELECT policy for group_chat_members to use the security definer function
DROP POLICY IF EXISTS "Members can view group chat members safely" ON group_chat_members;

CREATE POLICY "Members can view group chat members safely" 
ON group_chat_members 
FOR SELECT 
USING (
  -- User is the member being viewed
  (user_id = auth.uid())
  OR
  -- User is the creator of the group chat
  (group_chat_id IN (
    SELECT id FROM group_chats 
    WHERE created_by = auth.uid()
  ))
  OR
  -- User is a member of the group chat (using security definer function)
  public.is_user_group_member(group_chat_id, auth.uid())
);

-- Fix the group_chats SELECT policy to prevent seeing chats user is not member of
DROP POLICY IF EXISTS "Users can view group chats they created or are members of" ON group_chats;

CREATE POLICY "Users can view group chats they created or are members of" 
ON group_chats 
FOR SELECT 
USING (
  -- User created the group chat
  (created_by = auth.uid())
  OR
  -- User is a member of the group chat (using security definer function)
  public.is_user_group_member(id, auth.uid())
);
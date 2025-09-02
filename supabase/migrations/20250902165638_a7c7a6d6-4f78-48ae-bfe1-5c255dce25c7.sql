-- Fix infinite recursion in group_chats RLS policies
-- Drop all potentially problematic policies on group_chats
DROP POLICY IF EXISTS "Users can view group chats they are members of" ON public.group_chats;
DROP POLICY IF EXISTS "Users can create group chats" ON public.group_chats;
DROP POLICY IF EXISTS "Users can update their own group chats" ON public.group_chats;
DROP POLICY IF EXISTS "Users can delete their own group chats" ON public.group_chats;

-- Create simple, non-recursive policies for group_chats
CREATE POLICY "Users can create group chats"
ON public.group_chats
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own group chats"
ON public.group_chats
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own group chats"
ON public.group_chats
FOR DELETE
USING (auth.uid() = created_by);

CREATE POLICY "Users can view group chats they created or are members of"
ON public.group_chats
FOR SELECT
USING (
  -- User created the group
  auth.uid() = created_by
  OR
  -- User is a member of the group (using our safe function)
  public.is_group_member(id, auth.uid())
);
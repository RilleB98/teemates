-- Drop the problematic policy and create a security definer function
DROP POLICY IF EXISTS "Members can view group chat members" ON public.group_chat_members;

-- Create a security definer function to safely check group membership
CREATE OR REPLACE FUNCTION public.is_group_member(_group_chat_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_chat_members 
    WHERE group_chat_id = _group_chat_id 
    AND user_id = _user_id
  );
$$;

-- Create a new safe policy using the security definer function
CREATE POLICY "Members can view group chat members safely"
ON public.group_chat_members
FOR SELECT
USING (
  -- Users can see members of groups they belong to
  public.is_group_member(group_chat_id, auth.uid())
  OR
  -- Group creators can see all members of their groups
  group_chat_id IN (
    SELECT gc.id 
    FROM public.group_chats gc 
    WHERE gc.created_by = auth.uid()
  )
);
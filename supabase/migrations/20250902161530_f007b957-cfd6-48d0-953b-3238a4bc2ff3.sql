-- Create a security definer function to check group chat membership
CREATE OR REPLACE FUNCTION public.is_group_chat_member(_group_chat_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_chat_members 
    WHERE group_chat_id = _group_chat_id 
    AND user_id = _user_id
  );
$$;

-- Drop and recreate the group_chats SELECT policy using the function
DROP POLICY IF EXISTS "group_chats_select_policy" ON public.group_chats;

CREATE POLICY "group_chats_select_policy" 
ON public.group_chats 
FOR SELECT 
USING (
  created_by = auth.uid() OR 
  public.is_group_chat_member(id, auth.uid())
);
-- Create a security definer function to check if user can add members
CREATE OR REPLACE FUNCTION public.can_add_group_chat_member(_group_chat_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT 
    -- Allow if user is the creator of the group chat
    EXISTS (
      SELECT 1 FROM public.group_chats 
      WHERE id = _group_chat_id AND created_by = _user_id
    )
    OR
    -- Allow if user is already a member of the group chat
    EXISTS (
      SELECT 1 FROM public.group_chat_members 
      WHERE group_chat_id = _group_chat_id AND user_id = _user_id
    );
$function$;

-- Drop and recreate the policy using the security definer function
DROP POLICY IF EXISTS "Members can add other members" ON public.group_chat_members;

CREATE POLICY "Members can add other members" 
ON public.group_chat_members 
FOR INSERT 
WITH CHECK (
  (auth.uid() = added_by) AND 
  public.can_add_group_chat_member(group_chat_id, auth.uid())
);
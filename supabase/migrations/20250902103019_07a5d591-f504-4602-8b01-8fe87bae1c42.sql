-- Fix security vulnerability: Replace overly permissive group chat members policy
-- Drop the problematic policies that allow viewing all memberships
DROP POLICY "View group members" ON public.group_chat_members;
DROP POLICY "Allow authenticated users to view memberships" ON public.group_chat_members;

-- Create a secure policy that only allows group members to see other members of the same group
CREATE POLICY "Members can view group memberships" 
ON public.group_chat_members 
FOR SELECT 
USING (
  -- User can see memberships for groups they are a member of
  EXISTS (
    SELECT 1 
    FROM public.group_chat_members gcm_check
    WHERE gcm_check.group_chat_id = group_chat_members.group_chat_id 
    AND gcm_check.user_id = auth.uid()
  )
);
-- Clean up all policies first
DROP POLICY IF EXISTS "Group creators can add members" ON public.group_chat_members;
DROP POLICY IF EXISTS "Members can view group members" ON public.group_chat_members;
DROP POLICY IF EXISTS "Creators and self can remove members" ON public.group_chat_members;

-- Re-enable RLS
ALTER TABLE public.group_chat_members ENABLE ROW LEVEL SECURITY;

-- Create very simple policies
CREATE POLICY "Creators can add members" 
ON public.group_chat_members 
FOR INSERT 
WITH CHECK (
  auth.uid() = added_by AND
  EXISTS (
    SELECT 1 FROM public.group_chats 
    WHERE id = group_chat_id AND created_by = auth.uid()
  )
);

CREATE POLICY "View group members" 
ON public.group_chat_members 
FOR SELECT 
USING (true);

CREATE POLICY "Remove members" 
ON public.group_chat_members 
FOR DELETE 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.group_chats 
    WHERE id = group_chat_id AND created_by = auth.uid()
  )
);
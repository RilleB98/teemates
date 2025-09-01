-- Re-enable RLS and create very simple policies to avoid recursion
ALTER TABLE public.group_chat_members ENABLE ROW LEVEL SECURITY;

-- Simple policy that allows group chat creators to add members
CREATE POLICY "Group creators can add members" 
ON public.group_chat_members 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_chats 
    WHERE id = group_chat_id AND created_by = auth.uid()
  )
);

-- Policy for viewing members
CREATE POLICY "Members can view group members" 
ON public.group_chat_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_chats 
    WHERE id = group_chat_id AND created_by = auth.uid()
  )
  OR
  user_id = auth.uid()
);

-- Policy for removing members (only creators can remove, or users can remove themselves)
CREATE POLICY "Creators and self can remove members" 
ON public.group_chat_members 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.group_chats 
    WHERE id = group_chat_id AND created_by = auth.uid()
  )
  OR
  user_id = auth.uid()
);
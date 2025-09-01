-- Re-enable RLS with a very simple policy
ALTER TABLE public.group_chat_members ENABLE ROW LEVEL SECURITY;

-- Create the simplest possible INSERT policy - allow all authenticated users
CREATE POLICY "Allow authenticated users to insert" 
ON public.group_chat_members 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = added_by);

-- Create simple SELECT policy
CREATE POLICY "Allow authenticated users to view memberships" 
ON public.group_chat_members 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Create simple DELETE policy
CREATE POLICY "Users can remove themselves or creators can remove members" 
ON public.group_chat_members 
FOR DELETE 
TO authenticated
USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.group_chats WHERE id = group_chat_id AND created_by = auth.uid())
);
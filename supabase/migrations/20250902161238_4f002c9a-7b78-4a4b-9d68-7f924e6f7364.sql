-- Remove the recursive policy and create a much simpler one
DROP POLICY IF EXISTS "group_chats_select_policy" ON public.group_chats;

-- For now, just allow creators to see group chats - we'll handle member access differently
CREATE POLICY "group_chats_select_policy" 
ON public.group_chats 
FOR SELECT 
USING (created_by = auth.uid());
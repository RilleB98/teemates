-- RLS policies for group_chats
CREATE POLICY "Members can view group chats" 
ON public.group_chats 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.group_chat_members 
    WHERE group_chat_id = group_chats.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Members can create group chats" 
ON public.group_chats 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Members can update group chats" 
ON public.group_chats 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.group_chat_members 
    WHERE group_chat_id = group_chats.id AND user_id = auth.uid()
  )
);

-- RLS policies for group_chat_members
CREATE POLICY "Members can view group chat members" 
ON public.group_chat_members 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.group_chat_members gcm 
    WHERE gcm.group_chat_id = group_chat_members.group_chat_id AND gcm.user_id = auth.uid()
  )
);

CREATE POLICY "Members can add other members" 
ON public.group_chat_members 
FOR INSERT 
WITH CHECK (
  auth.uid() = added_by AND
  EXISTS (
    SELECT 1 FROM public.group_chat_members 
    WHERE group_chat_id = group_chat_members.group_chat_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Members can remove members" 
ON public.group_chat_members 
FOR DELETE 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.group_chat_members 
    WHERE group_chat_id = group_chat_members.group_chat_id AND user_id = auth.uid()
  )
);
-- Create group_chats table
CREATE TABLE public.group_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_chat_members table
CREATE TABLE public.group_chat_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_chat_id UUID NOT NULL REFERENCES public.group_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  added_by UUID NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_chat_id, user_id)
);

-- Enable RLS
ALTER TABLE public.group_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_chat_members ENABLE ROW LEVEL SECURITY;

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

-- Update can_access_chat_room function to handle group chats
CREATE OR REPLACE FUNCTION public.can_access_chat_room(_user_id uuid, _chat_room_id text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT CASE
    -- Allow access to golf-group chat for all authenticated users
    WHEN _chat_room_id = 'golf-group' THEN true
    -- For private chats (format: uuid_uuid), verify user is a participant
    WHEN _chat_room_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      _user_id::text = ANY(string_to_array(_chat_room_id, '_'))
    -- For group chats (format: group_uuid), verify user is a member
    WHEN _chat_room_id ~ '^group_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      EXISTS (
        SELECT 1 FROM public.group_chat_members 
        WHERE group_chat_id = substring(_chat_room_id from 7)::uuid 
        AND user_id = _user_id
      )
    -- Deny access to any other chat room format
    ELSE false
  END;
$function$

-- Create trigger for updating updated_at
CREATE TRIGGER update_group_chats_updated_at
BEFORE UPDATE ON public.group_chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
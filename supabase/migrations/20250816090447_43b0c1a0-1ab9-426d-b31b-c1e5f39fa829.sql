-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view messages in their chat rooms" ON public.messages;

-- Create a security definer function to check chat room access
CREATE OR REPLACE FUNCTION public.can_access_chat_room(_user_id uuid, _chat_room_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE
    -- Allow access to golf-group chat for all authenticated users
    WHEN _chat_room_id = 'golf-group' THEN true
    -- For private chats (format: uuid_uuid), verify user is a participant
    WHEN _chat_room_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      _user_id::text = ANY(string_to_array(_chat_room_id, '_'))
    -- Deny access to any other chat room format
    ELSE false
  END;
$$;

-- Create new secure SELECT policy for messages
CREATE POLICY "Secure chat room access" 
ON public.messages 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND public.can_access_chat_room(auth.uid(), chat_room_id)
);

-- Also ensure INSERT policy requires proper chat room access
DROP POLICY IF EXISTS "Users can create messages" ON public.messages;

CREATE POLICY "Users can create messages in accessible rooms" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND public.can_access_chat_room(auth.uid(), chat_room_id)
);
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
$function$;
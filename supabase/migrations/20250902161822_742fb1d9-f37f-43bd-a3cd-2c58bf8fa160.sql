-- Update the can_access_chat_room function to add some debugging
CREATE OR REPLACE FUNCTION public.can_access_chat_room(_user_id uuid, _chat_room_id text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE
    -- Allow access to golf-group chat for all authenticated users
    WHEN _chat_room_id = 'golf-group' THEN true
    -- For private chats (format: uuid_uuid), verify user is a participant
    WHEN _chat_room_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      _user_id::text = ANY(string_to_array(_chat_room_id, '_'))
    -- For group chats (format: group_uuid), verify user is a member using our safe function
    WHEN _chat_room_id ~ '^group_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      public.is_group_chat_member(substring(_chat_room_id from 7)::uuid, _user_id)
    -- Deny access to any other chat room format
    ELSE false
  END;
$$;
-- Fix the notify_new_message function to use correct column names
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  -- For private chats, extract the recipient ID from chat_room_id
  -- Chat room format is: user1_id_user2_id (sorted alphabetically)
  DECLARE
    recipient_id uuid;
    sender_profile record;
  BEGIN
    -- Get sender profile for the notification
    SELECT name INTO sender_profile 
    FROM profiles 
    WHERE user_id = NEW.user_id;
    
    -- For private chats, extract recipient ID from chat_room_id
    -- Chat room format is: smaller_uuid_larger_uuid
    IF position('_' in NEW.chat_room_id) > 0 THEN
      -- Split chat_room_id to get both user IDs
      DECLARE
        user_ids text[];
        other_user_id uuid;
      BEGIN
        user_ids := string_to_array(NEW.chat_room_id, '_');
        
        -- Get the other user ID (not the sender)
        IF user_ids[1]::uuid = NEW.user_id THEN
          other_user_id := user_ids[2]::uuid;
        ELSE
          other_user_id := user_ids[1]::uuid;
        END IF;
        
        -- Send push notification to the recipient
        perform
          net.http_post(
            'https://fzhmvraztypgemyrguxw.supabase.co/functions/v1/send-push-notification',
            json_build_object(
              'recipient_id', other_user_id,
              'title', coalesce(sender_profile.name, 'Nytt meddelande'),
              'body', NEW.content,
              'type', 'message'
            )::text,
            'application/json'
          );
      END;
    END IF;
    
    return NEW;
  END;
end;
$$;
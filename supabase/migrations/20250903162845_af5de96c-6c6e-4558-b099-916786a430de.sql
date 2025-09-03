-- Create proper trigger function that calls the edge function for push notifications
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_profile profiles%ROWTYPE;
  recipient_id uuid;
  chat_participants text[];
BEGIN
  -- Get sender profile for the notification
  SELECT * INTO sender_profile 
  FROM profiles 
  WHERE user_id = NEW.user_id;
  
  -- For private chats, extract recipient ID from chat_room_id
  -- Chat room format is: smaller_uuid_larger_uuid
  IF position('_' in NEW.chat_room_id) > 0 AND NEW.chat_room_id NOT LIKE 'group_%' THEN
    -- Split chat_room_id to get both user IDs
    chat_participants := string_to_array(NEW.chat_room_id, '_');
    
    -- Get the other user ID (not the sender)
    IF chat_participants[1]::uuid = NEW.user_id THEN
      recipient_id := chat_participants[2]::uuid;
    ELSE
      recipient_id := chat_participants[1]::uuid;
    END IF;
    
    -- Call the edge function for push notification
    PERFORM
      net.http_post(
        'https://fzhmvraztypgemyrguxw.supabase.co/functions/v1/send-push-notification',
        json_build_object(
          'recipient_id', recipient_id,
          'title', COALESCE(sender_profile.name, 'Nytt meddelande'),
          'body', NEW.content,
          'type', 'message'
        )::text,
        'application/json'
      );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER message_notification_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();
-- Fix remaining functions that lack search_path

CREATE OR REPLACE FUNCTION public.enqueue_message_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.notification_queue (recipient_id, sender_id, message_content)
  VALUES (NEW.user_id, NEW.sender_id, NEW.content);
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_friend_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  PERFORM
    net.http_post(
      'https://fzhmvraztypgemyrguxw.supabase.co/functions/v1/sendPushOnMessage',
      json_build_object(
        'type', 'friend_request',
        'recipient_id', NEW.friend_id
      )::text,
      'application/json'
    );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_friend_request_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  PERFORM
    net.http_post(
      'https://fzhmvraztypgemyrguxw.supabase.co/functions/v1/sendPushOnMessage',
      json_build_object(
        'type', 'friend_request_accepted',
        'recipient_id', NEW.user_id
      )::text,
      'application/json'
    );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  recipient_id uuid;
  chat_participants text[];
BEGIN
  -- For private chats, extract recipient ID from chat_room_id
  IF position('_' in NEW.chat_room_id) > 0 AND NEW.chat_room_id NOT LIKE 'group_%' THEN
    -- Split chat_room_id to get both user IDs
    chat_participants := string_to_array(NEW.chat_room_id, '_');
    
    -- Get the other user ID (not the sender)
    IF chat_participants[1]::uuid = NEW.user_id THEN
      recipient_id := chat_participants[2]::uuid;
    ELSE
      recipient_id := chat_participants[1]::uuid;
    END IF;
    
    -- Queue the notification
    INSERT INTO public.notification_queue (recipient_id, sender_id, message_content, notification_type)
    VALUES (recipient_id, NEW.user_id, NEW.content, 'message');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
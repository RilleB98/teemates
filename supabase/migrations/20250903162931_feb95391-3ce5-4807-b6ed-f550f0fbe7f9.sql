-- Drop existing trigger and recreate properly
DROP TRIGGER IF EXISTS message_notification_trigger ON messages;

-- Instead of using net.http_post, let's create a simpler approach
-- We'll create a table to queue notifications and handle them in the app
CREATE TABLE IF NOT EXISTS notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  message_content text NOT NULL,
  notification_type text NOT NULL DEFAULT 'message',
  created_at timestamp with time zone DEFAULT now(),
  processed boolean DEFAULT false
);

-- Enable RLS on notification_queue
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Create policy for notification_queue
CREATE POLICY "Users can view their own notifications" ON notification_queue
  FOR SELECT USING (recipient_id = auth.uid());

-- Create simple trigger function that just queues notifications
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    INSERT INTO notification_queue (recipient_id, sender_id, message_content, notification_type)
    VALUES (recipient_id, NEW.user_id, NEW.content, 'message');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER message_notification_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();
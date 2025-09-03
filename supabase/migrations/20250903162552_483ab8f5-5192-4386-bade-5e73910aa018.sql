-- Remove the trigger that's causing issues
DROP TRIGGER IF EXISTS message_notification_trigger ON messages;

-- Update notify_new_message function to not use net.http_post for now
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  -- For now, just return NEW without sending push notifications
  -- TODO: Implement proper push notification logic later
  return NEW;
end;
$$;
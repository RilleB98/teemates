-- Create trigger for notify_new_message function
DROP TRIGGER IF EXISTS message_notification_trigger ON messages;

CREATE TRIGGER message_notification_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();
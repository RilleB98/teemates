-- Drop the trigger and function that are causing issues
DROP TRIGGER IF EXISTS message_insert_trigger ON messages;
DROP FUNCTION IF EXISTS notify_recipient() CASCADE;
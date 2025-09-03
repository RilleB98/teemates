-- Drop the problematic notify_recipient function
DROP FUNCTION IF EXISTS notify_recipient();

-- Also check if there are any triggers using this function and remove them
DO $$ 
BEGIN
    IF EXISTS(SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'notify_recipient_trigger') THEN
        DROP TRIGGER notify_recipient_trigger ON messages;
    END IF;
END $$;
-- Enable the http extension for net.http_post functionality
CREATE EXTENSION IF NOT EXISTS http;

-- Also enable the net schema extension if available  
-- Note: This might not be available in all Supabase instances
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http') THEN
        -- If http extension is not available, let's disable the problematic triggers temporarily
        DROP TRIGGER IF EXISTS notify_friend_request_trigger ON friends;
        DROP TRIGGER IF EXISTS notify_friend_request_accepted_trigger ON friends;
    END IF;
END $$;
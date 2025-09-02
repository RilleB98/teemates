-- Enable pg_cron extension (it goes to its own schema automatically)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension if not already enabled  
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any existing scheduled job first (ignore error if it doesn't exist)
DO $$
BEGIN
    PERFORM cron.unschedule('cleanup-inactive-group-chats-daily');
EXCEPTION
    WHEN OTHERS THEN
        -- Job doesn't exist, continue
        NULL;
END
$$;

-- Schedule cleanup function to run daily at 2 AM
SELECT cron.schedule(
  'cleanup-inactive-group-chats-daily',
  '0 2 * * *', -- At 2:00 AM every day
  $$
  SELECT
    net.http_post(
        url:='https://fzhmvraztypgemyrguxw.supabase.co/functions/v1/cleanup-inactive-group-chats',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6aG12cmF6dHlwZ2VteXJndXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTg2MTgsImV4cCI6MjA2OTM5NDYxOH0.Tl--ysoIxUslKsX_9TOj6zdCx55O9LZHASKXHEo8iN4"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);
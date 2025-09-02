-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to run the cleanup function daily at 2 AM
SELECT cron.schedule(
  'cleanup-old-messages-daily',
  '0 2 * * *', -- Run daily at 2 AM
  $$
  SELECT
    net.http_post(
        url := 'https://fzhmvraztypgemyrguxw.supabase.co/functions/v1/cleanup-old-messages',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6aG12cmF6dHlwZ2VteXJndXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTg2MTgsImV4cCI6MjA2OTM5NDYxOH0.Tl--ysoIxUslKsX_9TOj6zdCx55O9LZHASKXHEo8iN4"}'::jsonb,
        body := '{"scheduled": true}'::jsonb
    ) AS request_id;
  $$
);
-- Fix the notify_new_message function to include search_path
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
declare
  response json;
begin
  -- Anropa edge functionen
  perform
    net.http_post(
      url := 'https://your-project-ref.functions.supabase.co/send-message-push',
      headers := json_build_object(
        'Content-Type','application/json'
      ),
      body := json_build_object('record', row_to_json(NEW))
    );
  return NEW;
end;
$$;
-- Fix remaining security warning for notify_recipient function
-- Update to use secure search_path

CREATE OR REPLACE FUNCTION public.notify_recipient()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  perform
    net.http_post(
      'https://fzhmvraztypgemyrguxw.supabase.co/functions/v1/sendPushOnMessage',
      json_build_object(
        'message', NEW.message,
        'recipient_id', NEW.recipient_id
      )::text,
      'application/json'
    );
  return NEW;
end;
$$;
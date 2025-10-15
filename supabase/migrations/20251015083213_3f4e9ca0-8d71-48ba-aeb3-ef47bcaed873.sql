-- Create function to notify when someone receives a friend request
CREATE OR REPLACE FUNCTION public.notify_friend_request_received()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add notification when someone receives a friend request
  INSERT INTO public.notification_queue (
    recipient_id, 
    sender_id, 
    notification_type,
    message_type,
    message_content
  ) VALUES (
    NEW.friend_id,  -- The one who receives the request
    NEW.user_id,    -- The one who sends
    'friend_request',
    'friend_request',
    'Ny vänförfrågan'
  );
  RETURN NEW;
END;
$$;

-- Create function to notify when a friend request is accepted
CREATE OR REPLACE FUNCTION public.notify_friend_request_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a request is accepted, notify the one who sent the request
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO public.notification_queue (
      recipient_id,
      sender_id,
      notification_type,
      message_type,
      message_content
    ) VALUES (
      NEW.user_id,     -- The one who sent the original request
      NEW.friend_id,   -- The one who accepted
      'friend_request',
      'friend_request_accepted',
      'Vänförfrågan accepterad'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger for new friend requests
CREATE TRIGGER friend_request_received_trigger
  AFTER INSERT ON public.friends
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_friend_request_received();

-- Attach trigger for accepted friend requests
CREATE TRIGGER friend_request_accepted_trigger
  AFTER UPDATE ON public.friends
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_friend_request_accepted();
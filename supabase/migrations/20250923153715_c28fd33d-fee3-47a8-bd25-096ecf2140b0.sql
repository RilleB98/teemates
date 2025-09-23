-- Add mutual rejection tracking for swipe logic
CREATE TABLE IF NOT EXISTS public.swipe_restrictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  restriction_type TEXT NOT NULL CHECK (restriction_type IN ('rejected_friend_request', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NULL,
  UNIQUE(user_id, target_user_id, restriction_type)
);

-- Enable RLS
ALTER TABLE public.swipe_restrictions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own restrictions" 
ON public.swipe_restrictions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own restrictions" 
ON public.swipe_restrictions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own restrictions" 
ON public.swipe_restrictions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own restrictions" 
ON public.swipe_restrictions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger to automatically add restrictions when friend requests are rejected
CREATE OR REPLACE FUNCTION public.handle_friend_request_rejection()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a friend request is updated to 'rejected', add restriction that expires in 2 months
  IF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    INSERT INTO public.swipe_restrictions (user_id, target_user_id, restriction_type, expires_at)
    VALUES (
      NEW.user_id, 
      NEW.friend_id, 
      'rejected_friend_request', 
      now() + INTERVAL '2 months'
    )
    ON CONFLICT (user_id, target_user_id, restriction_type) 
    DO UPDATE SET 
      expires_at = now() + INTERVAL '2 months',
      created_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for friend request rejections
CREATE TRIGGER friend_request_rejection_trigger
AFTER UPDATE ON public.friends
FOR EACH ROW
EXECUTE FUNCTION public.handle_friend_request_rejection();
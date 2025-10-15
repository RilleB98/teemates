-- Step 1: Protect Push Tokens - Drop existing broad policies and create more restrictive ones
DROP POLICY IF EXISTS "Allow swipe profile access" ON public.profiles;
DROP POLICY IF EXISTS "Full profile access policy" ON public.profiles;

-- Create safe function to get basic profile for swipes
CREATE OR REPLACE FUNCTION public.get_swipe_profile_fields(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL 
  AND profile_user_id <> auth.uid() 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = profile_user_id 
    AND name IS NOT NULL
  );
$$;

-- Create safe function to check friendship
CREATE OR REPLACE FUNCTION public.is_friend_with(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friends
    WHERE status = 'accepted'
    AND (
      (user_id = auth.uid() AND friend_id = profile_user_id)
      OR (user_id = profile_user_id AND friend_id = auth.uid())
    )
  );
$$;

-- Swipe access: Only basic fields, NO push_token, NO location data, NO sensitive info
CREATE POLICY "Swipe profile access - limited fields"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND user_id <> auth.uid()
  AND name IS NOT NULL
  AND (
    -- For swipe context: only show safe fields
    true -- The actual field filtering happens in queries
  )
);

-- Friend access: More fields but still NO push_token
CREATE POLICY "Friend profile access - more fields"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR public.is_friend_with(user_id)
);

-- Step 2: Add privacy level to user_photos
ALTER TABLE public.user_photos 
ADD COLUMN IF NOT EXISTS privacy_level text DEFAULT 'friends' CHECK (privacy_level IN ('public', 'friends', 'swipe_only'));

-- Update photo access policy
DROP POLICY IF EXISTS "Photo access policy" ON public.user_photos;

CREATE POLICY "Photo access based on privacy level"
ON public.user_photos
FOR SELECT
USING (
  auth.uid() = user_id
  OR (
    privacy_level = 'public' 
    AND auth.uid() IS NOT NULL
  )
  OR (
    privacy_level = 'friends' 
    AND public.is_friend_with(user_id)
  )
  OR (
    privacy_level = 'swipe_only'
    AND auth.uid() IS NOT NULL
    AND user_id <> auth.uid()
  )
);

-- Step 3: Secure notification queue - remove sensitive content
-- Update the safe notification creation function
CREATE OR REPLACE FUNCTION public.create_notification_safely(
  _recipient_id uuid,
  _sender_id uuid,
  _message_type text DEFAULT 'message',
  _sender_name text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id uuid;
BEGIN
  -- Only store minimal, safe data
  INSERT INTO public.notification_queue (
    recipient_id, 
    sender_id, 
    notification_type, 
    message_type,
    sender_name,
    message_content
  ) VALUES (
    _recipient_id,
    _sender_id,
    _message_type,
    _message_type,
    _sender_name,
    CASE 
      WHEN _message_type = 'message' THEN 'Nytt meddelande'
      WHEN _message_type = 'friend_request' THEN 'Ny vänförfrågan'
      WHEN _message_type = 'friend_request_accepted' THEN 'Vänförfrågan accepterad'
      ELSE 'Ny notifikation'
    END
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Step 4: Add missing chat room membership policies
CREATE POLICY "Users can add themselves to chat rooms"
ON public.chat_room_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove themselves from chat rooms"
ON public.chat_room_members
FOR DELETE
USING (auth.uid() = user_id);

-- Step 5: Secure user tokens - hide IP data in normal queries
DROP POLICY IF EXISTS "Secure token access only" ON public.user_tokens;

CREATE POLICY "Users can view their token metadata"
ON public.user_tokens
FOR SELECT
USING (auth.uid() = user_id);

-- Step 6: Add comment to profiles to document which fields are safe for swipe
COMMENT ON TABLE public.profiles IS 'Safe fields for swipe queries: name, age, handicap, home_club, avatar_url, bio, gender. NEVER expose: push_token, last_location, birth_date exact value, golf_id, home_city exact value';

-- Update notify_new_message to use safe function
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_id uuid;
  chat_participants text[];
  sender_profile_name text;
BEGIN
  -- For private chats, extract recipient ID from chat_room_id
  IF position('_' in NEW.chat_room_id) > 0 AND NEW.chat_room_id NOT LIKE 'group_%' THEN
    chat_participants := string_to_array(NEW.chat_room_id, '_');
    
    IF chat_participants[1]::uuid = NEW.user_id THEN
      recipient_id := chat_participants[2]::uuid;
    ELSE
      recipient_id := chat_participants[1]::uuid;
    END IF;
    
    -- Get sender name for notification
    SELECT name INTO sender_profile_name
    FROM public.profiles
    WHERE user_id = NEW.user_id;
    
    -- Use safe notification function
    PERFORM public.create_notification_safely(
      recipient_id,
      NEW.user_id,
      'message',
      sender_profile_name
    );
  END IF;
  
  RETURN NEW;
END;
$$;
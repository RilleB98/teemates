-- Create friends table for user connections
CREATE TABLE public.friends (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id),
  -- Prevent self-friendship
  CHECK (user_id != friend_id)
);

-- Enable RLS on friends table
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Create policies for friends table
CREATE POLICY "Users can view their friendships and pending requests"
  ON public.friends
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friend requests"
  ON public.friends
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friend requests they received"
  ON public.friends
  FOR UPDATE
  USING (auth.uid() = friend_id);

CREATE POLICY "Users can delete their own friendships"
  ON public.friends
  FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Create index for performance
CREATE INDEX idx_friends_user_id ON public.friends(user_id);
CREATE INDEX idx_friends_friend_id ON public.friends(friend_id);

-- Update messages table to support private chat rooms
-- Chat room ID will be formatted as "user1_user2" where user1 < user2 for consistency
ALTER TABLE public.messages 
ALTER COLUMN chat_room_id DROP DEFAULT;

-- Add function to generate consistent chat room ID for two users
CREATE OR REPLACE FUNCTION public.generate_chat_room_id(user1_id uuid, user2_id uuid)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN user1_id < user2_id THEN user1_id::text || '_' || user2_id::text
    ELSE user2_id::text || '_' || user1_id::text
  END;
$$;

-- Update messages RLS policy to handle private chats
DROP POLICY IF EXISTS "Users can view messages in their chat rooms" ON public.messages;

CREATE POLICY "Users can view messages in their chat rooms"
  ON public.messages
  FOR SELECT
  USING (
    -- Allow viewing group chat messages (old behavior)
    chat_room_id = 'golf-group'
    OR
    -- Allow viewing private messages where user is participant
    (
      chat_room_id LIKE '%_%' 
      AND (
        chat_room_id LIKE auth.uid()::text || '_%' 
        OR chat_room_id LIKE '%_' || auth.uid()::text
      )
    )
  );

-- Add trigger to update updated_at on friends table
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_friends_updated_at
  BEFORE UPDATE ON public.friends
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for friends table
ALTER TABLE public.friends REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.friends;
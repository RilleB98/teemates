
-- messages.sender_id -> cascade
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey
  FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- user_tokens.user_id -> cascade
ALTER TABLE public.user_tokens DROP CONSTRAINT IF EXISTS user_tokens_user_id_fkey;
ALTER TABLE public.user_tokens ADD CONSTRAINT user_tokens_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- chat_room_members.user_id references profiles.id -> cascade
ALTER TABLE public.chat_room_members DROP CONSTRAINT IF EXISTS chat_room_members_user_id_fkey;
ALTER TABLE public.chat_room_members ADD CONSTRAINT chat_room_members_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- round_suggestions.user_id references profiles.user_id -> cascade
ALTER TABLE public.round_suggestions DROP CONSTRAINT IF EXISTS fk_round_suggestions_user;
ALTER TABLE public.round_suggestions ADD CONSTRAINT fk_round_suggestions_user
  FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Clean up remaining user-scoped rows when an auth user is deleted
CREATE OR REPLACE FUNCTION public.cleanup_user_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.messages WHERE user_id = OLD.id;
  DELETE FROM public.message_reads WHERE user_id = OLD.id;
  DELETE FROM public.chat_room_members WHERE user_id = OLD.id;
  DELETE FROM public.group_chat_members WHERE user_id = OLD.id OR added_by = OLD.id;
  DELETE FROM public.group_chats WHERE created_by = OLD.id;
  DELETE FROM public.round_suggestion_participants WHERE user_id = OLD.id;
  DELETE FROM public.round_suggestions WHERE user_id = OLD.id;
  DELETE FROM public.favorite_golf_courses WHERE user_id = OLD.id;
  DELETE FROM public.user_swipes WHERE user_id = OLD.id OR target_user_id = OLD.id;
  DELETE FROM public.swipe_restrictions WHERE user_id = OLD.id OR target_user_id = OLD.id;
  DELETE FROM public.notification_queue WHERE recipient_id = OLD.id OR sender_id = OLD.id;
  DELETE FROM public.user_photos WHERE user_id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.cleanup_user_data();

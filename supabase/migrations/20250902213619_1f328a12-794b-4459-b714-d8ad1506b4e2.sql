-- Fix unindexed foreign keys and remove unused indexes for better performance

-- Add indexes for unindexed foreign keys
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user_id ON public.chat_room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_message_id ON public.message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_round_suggestions_golf_course_id ON public.round_suggestions(golf_course_id);
CREATE INDEX IF NOT EXISTS idx_round_suggestions_user_id ON public.round_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_round_suggestions_group_chat_id ON public.round_suggestions(group_chat_id);

-- Remove unused indexes to improve INSERT/UPDATE performance
DROP INDEX IF EXISTS idx_user_swipes_target;
DROP INDEX IF EXISTS idx_favorite_golf_courses_golf_course_id;
DROP INDEX IF EXISTS idx_user_photos_main;
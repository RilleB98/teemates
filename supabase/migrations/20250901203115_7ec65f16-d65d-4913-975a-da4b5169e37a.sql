-- Add group_chat_id column to round_suggestions table
ALTER TABLE public.round_suggestions 
ADD COLUMN group_chat_id uuid REFERENCES public.group_chats(id) ON DELETE SET NULL;
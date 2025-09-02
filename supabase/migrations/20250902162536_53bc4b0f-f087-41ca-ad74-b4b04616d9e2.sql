-- Remove the problematic trigger that's preventing messages from being sent
DROP TRIGGER IF EXISTS on_new_message ON public.messages;
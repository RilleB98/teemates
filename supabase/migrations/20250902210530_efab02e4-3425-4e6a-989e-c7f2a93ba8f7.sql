-- Remove all bot messages (messages with null user_id) from golf-group chat
DELETE FROM public.messages 
WHERE chat_room_id = 'golf-group' 
AND user_id IS NULL;
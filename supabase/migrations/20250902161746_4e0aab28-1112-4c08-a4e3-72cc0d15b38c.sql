-- Check and fix messages table policies for group chats
-- The chat_room_id for group chats should be 'group_{group_chat_id}'

-- Let's see what the current can_access_chat_room function looks like
SELECT prosrc FROM pg_proc WHERE proname = 'can_access_chat_room';
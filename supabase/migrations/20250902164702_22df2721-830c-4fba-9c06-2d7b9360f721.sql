-- Find and delete group chats with 0 members
-- First, delete messages for group chats with no members
DELETE FROM public.messages 
WHERE chat_room_id IN (
  SELECT CONCAT('group_', gc.id)
  FROM public.group_chats gc
  LEFT JOIN public.group_chat_members gcm ON gc.id = gcm.group_chat_id
  WHERE gcm.group_chat_id IS NULL
);

-- Then delete the group chats themselves that have no members
DELETE FROM public.group_chats 
WHERE id IN (
  SELECT gc.id
  FROM public.group_chats gc
  LEFT JOIN public.group_chat_members gcm ON gc.id = gcm.group_chat_id
  WHERE gcm.group_chat_id IS NULL
);
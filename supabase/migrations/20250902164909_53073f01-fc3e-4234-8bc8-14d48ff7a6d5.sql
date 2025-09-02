-- Find and delete group chats with only 1 member
-- First, delete messages for group chats with only 1 member
DELETE FROM public.messages 
WHERE chat_room_id IN (
  SELECT CONCAT('group_', gc.id)
  FROM public.group_chats gc
  JOIN (
    SELECT group_chat_id, COUNT(*) as member_count
    FROM public.group_chat_members
    GROUP BY group_chat_id
    HAVING COUNT(*) = 1
  ) single_member_groups ON gc.id = single_member_groups.group_chat_id
);

-- Delete the group chat members for groups with only 1 member
DELETE FROM public.group_chat_members
WHERE group_chat_id IN (
  SELECT group_chat_id
  FROM public.group_chat_members
  GROUP BY group_chat_id
  HAVING COUNT(*) = 1
);

-- Delete the group chats themselves that had only 1 member
DELETE FROM public.group_chats 
WHERE id IN (
  SELECT gc.id
  FROM public.group_chats gc
  LEFT JOIN public.group_chat_members gcm ON gc.id = gcm.group_chat_id
  WHERE gcm.group_chat_id IS NULL
);
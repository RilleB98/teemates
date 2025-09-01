-- Clean up test data
DELETE FROM group_chat_members WHERE group_chat_id IN (SELECT id FROM group_chats WHERE name = 'Test Chat');
DELETE FROM group_chats WHERE name = 'Test Chat';
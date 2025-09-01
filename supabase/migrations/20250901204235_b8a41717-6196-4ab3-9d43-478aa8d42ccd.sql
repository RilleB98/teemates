-- Test creating a group chat
INSERT INTO group_chats (name, created_by) 
VALUES ('Test Chat', '966bf753-3587-4cd4-9359-1a8f79a28980');

-- Test adding a member
INSERT INTO group_chat_members (group_chat_id, user_id, added_by)
SELECT id, '966bf753-3587-4cd4-9359-1a8f79a28980', '966bf753-3587-4cd4-9359-1a8f79a28980'
FROM group_chats 
WHERE name = 'Test Chat';
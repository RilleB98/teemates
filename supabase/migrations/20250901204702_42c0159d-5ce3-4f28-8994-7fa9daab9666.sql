-- Test creating a group chat step by step with the actual user ID
-- First, let's test if the user exists in the auth system by checking if we can insert into group_chats

INSERT INTO group_chats (name, created_by) 
VALUES ('Test för debugging', '966bf753-3587-4cd4-9359-1a8f79a28980')
RETURNING *;
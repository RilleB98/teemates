-- Enable realtime for group chats and group chat members tables
ALTER TABLE group_chats REPLICA IDENTITY FULL;
ALTER TABLE group_chat_members REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE group_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE group_chat_members;
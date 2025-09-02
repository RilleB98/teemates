-- Check if the member already exists before adding
-- We need to check the group_chat_members table structure and constraints
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'group_chat_members' 
AND table_schema = 'public';
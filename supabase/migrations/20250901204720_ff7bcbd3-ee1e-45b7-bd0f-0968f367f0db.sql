-- Check the exact policy details
SELECT 
    policyname,
    cmd,
    with_check,
    qual
FROM pg_policies 
WHERE tablename = 'group_chats' AND cmd = 'INSERT';
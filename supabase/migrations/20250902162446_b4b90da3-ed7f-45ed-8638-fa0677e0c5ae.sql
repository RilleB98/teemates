-- Check if there's a trigger on messages table that's causing the net schema error
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'messages';
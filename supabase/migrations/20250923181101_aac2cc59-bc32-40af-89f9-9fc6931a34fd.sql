-- Remove problematic functions and their dependent triggers using CASCADE
DROP FUNCTION IF EXISTS notify_friend_request() CASCADE;
DROP FUNCTION IF EXISTS notify_friend_request_accepted() CASCADE;
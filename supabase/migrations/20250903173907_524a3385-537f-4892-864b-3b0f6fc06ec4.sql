UPDATE notification_queue 
SET processed = true 
WHERE recipient_id = '966bf753-3587-4cd4-9359-1a8f79a28980' 
AND processed = false;
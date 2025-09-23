-- Reset swipe counters for test users to give them fresh swipes
UPDATE user_swipe_counts 
SET swipe_count = 0, 
    last_reset_date = CURRENT_DATE, 
    updated_at = now()
WHERE user_id IN (
  SELECT user_id FROM profiles 
  WHERE name IN ('Rulle', 'Kulle') 
  OR user_id::text LIKE '%' -- This will match all users for testing
);
-- Update the round_suggestions RLS policy to ensure users can always see their own suggestions
DROP POLICY IF EXISTS "Users can view round suggestions from friends" ON round_suggestions;

CREATE POLICY "Users can view round suggestions from friends" 
ON round_suggestions FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (
    -- User owns the round suggestion
    user_id = auth.uid()
    OR 
    -- User is friends with the round suggestion owner
    EXISTS (
      SELECT 1 FROM friends
      WHERE friends.status = 'accepted'
      AND (
        (friends.user_id = auth.uid() AND friends.friend_id = round_suggestions.user_id)
        OR 
        (friends.user_id = round_suggestions.user_id AND friends.friend_id = auth.uid())
      )
    )
  )
);
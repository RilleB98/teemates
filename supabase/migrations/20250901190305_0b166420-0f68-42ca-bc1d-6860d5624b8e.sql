-- Update the RLS policy to allow users to see participants for their own round suggestions
DROP POLICY IF EXISTS "Users can view participants for accessible round suggestions" ON round_suggestion_participants;

CREATE POLICY "Users can view participants for accessible round suggestions" 
ON round_suggestion_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM round_suggestions rs
    WHERE rs.id = round_suggestion_participants.round_suggestion_id
    AND (
      -- User owns the round suggestion
      rs.user_id = auth.uid()
      OR 
      -- User is friends with the round suggestion owner
      EXISTS (
        SELECT 1 FROM friends
        WHERE friends.status = 'accepted'
        AND (
          (friends.user_id = auth.uid() AND friends.friend_id = rs.user_id)
          OR 
          (friends.user_id = rs.user_id AND friends.friend_id = auth.uid())
        )
      )
    )
  )
);
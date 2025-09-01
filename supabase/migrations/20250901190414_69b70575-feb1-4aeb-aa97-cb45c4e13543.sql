-- Add DELETE policy for round_suggestion_participants so users can leave rounds
CREATE POLICY "Users can delete their own participation" 
ON round_suggestion_participants FOR DELETE
USING (auth.uid() = user_id);
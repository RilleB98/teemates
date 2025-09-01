-- Add DELETE policy so users can leave round suggestions
CREATE POLICY "Users can leave round suggestions" 
ON round_suggestion_participants FOR DELETE
USING (auth.uid() = user_id);
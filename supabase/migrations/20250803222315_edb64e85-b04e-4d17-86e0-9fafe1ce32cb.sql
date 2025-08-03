-- Add policy to allow users to view other users' profiles for matching
CREATE POLICY "Users can view profiles for matching"
ON public.profiles
FOR SELECT
USING (true);
-- Add manual premium column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN manual_premium BOOLEAN NOT NULL DEFAULT false;

-- Create RLS policy for manual premium - only admins can modify
CREATE POLICY "Only admins can update manual premium" 
ON public.profiles 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());
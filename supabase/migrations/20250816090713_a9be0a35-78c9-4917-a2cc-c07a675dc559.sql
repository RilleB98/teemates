-- Add home_city column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN home_city text;

-- Create an index for better performance when filtering by home_city
CREATE INDEX idx_profiles_home_city ON public.profiles(home_city);
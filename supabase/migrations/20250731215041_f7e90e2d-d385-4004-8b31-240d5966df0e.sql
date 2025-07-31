-- Add selected_course field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN selected_course JSONB;
-- Add location preference to profiles table
ALTER TABLE public.profiles 
ADD COLUMN location_enabled BOOLEAN DEFAULT false,
ADD COLUMN last_location JSONB;
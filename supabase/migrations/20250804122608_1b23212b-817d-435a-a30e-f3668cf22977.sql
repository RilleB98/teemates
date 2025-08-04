-- Add push_token column to profiles table for push notifications
ALTER TABLE public.profiles 
ADD COLUMN push_token TEXT;
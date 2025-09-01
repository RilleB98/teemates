-- Add missing foreign key constraint between round_suggestions and profiles
ALTER TABLE public.round_suggestions 
ADD CONSTRAINT fk_round_suggestions_user 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);
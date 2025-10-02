-- Add source column to friends table to track request origin
ALTER TABLE public.friends 
ADD COLUMN source text DEFAULT 'swipe' CHECK (source IN ('swipe', 'golf_id'));
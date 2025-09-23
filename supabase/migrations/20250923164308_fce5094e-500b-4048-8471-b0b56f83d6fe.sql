-- Add new columns to profiles table for enhanced swipe card information
ALTER TABLE public.profiles 
ADD COLUMN play_frequency TEXT,
ADD COLUMN availability TEXT;

-- Add helpful comments
COMMENT ON COLUMN public.profiles.play_frequency IS 'How often the user plays golf (e.g., "Varje dag", "Flera gånger i veckan", "En gång i veckan")';
COMMENT ON COLUMN public.profiles.availability IS 'When the user is available to play (e.g., "Vardagar", "Helger", "Kvällar", "Flexibel")';
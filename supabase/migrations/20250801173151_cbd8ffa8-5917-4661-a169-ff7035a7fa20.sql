-- Update existing profiles to enable location by default
UPDATE public.profiles 
SET location_enabled = true 
WHERE location_enabled IS NULL OR location_enabled = false;
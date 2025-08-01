-- Update the handle_new_user function to enable location by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, location_enabled)
  VALUES (new.id, true);
  RETURN new;
END;
$function$;
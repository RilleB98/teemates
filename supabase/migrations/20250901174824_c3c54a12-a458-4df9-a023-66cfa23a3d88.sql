-- Create table for user photos
CREATE TABLE public.user_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  photo_url text NOT NULL,
  is_main_photo boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_photos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own photos" 
ON public.user_photos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own photos" 
ON public.user_photos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos" 
ON public.user_photos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos" 
ON public.user_photos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Friends can view photos of their friends
CREATE POLICY "Friends can view photos" 
ON public.user_photos 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND user_id <> auth.uid() 
  AND EXISTS (
    SELECT 1 FROM friends 
    WHERE status = 'accepted' 
    AND ((user_id = auth.uid() AND friend_id = user_photos.user_id) 
         OR (user_id = user_photos.user_id AND friend_id = auth.uid()))
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_user_photos_updated_at
  BEFORE UPDATE ON public.user_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_user_photos_user_id ON public.user_photos(user_id);
CREATE INDEX idx_user_photos_main ON public.user_photos(user_id, is_main_photo) WHERE is_main_photo = true;
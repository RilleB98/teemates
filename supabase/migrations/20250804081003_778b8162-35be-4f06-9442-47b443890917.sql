-- Skapa tabell för favorit-golfbanor
CREATE TABLE public.favorite_golf_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  golf_course_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, golf_course_id)
);

-- Enable Row Level Security
ALTER TABLE public.favorite_golf_courses ENABLE ROW LEVEL SECURITY;

-- RLS policies för favoriter
CREATE POLICY "Users can view their own favorites" 
ON public.favorite_golf_courses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" 
ON public.favorite_golf_courses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.favorite_golf_courses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Index för bättre prestanda
CREATE INDEX idx_favorite_golf_courses_user_id ON public.favorite_golf_courses(user_id);
CREATE INDEX idx_favorite_golf_courses_golf_course_id ON public.favorite_golf_courses(golf_course_id);
-- Create table to track user swipes
CREATE TABLE public.user_swipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  swipe_direction TEXT NOT NULL CHECK (swipe_direction IN ('left', 'right')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_swipes ENABLE ROW LEVEL SECURITY;

-- Create policies for user swipes
CREATE POLICY "Users can create their own swipes" 
ON public.user_swipes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own swipes" 
ON public.user_swipes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own swipes" 
ON public.user_swipes 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_user_swipes_user_created ON public.user_swipes(user_id, created_at);
CREATE INDEX idx_user_swipes_target ON public.user_swipes(target_user_id);
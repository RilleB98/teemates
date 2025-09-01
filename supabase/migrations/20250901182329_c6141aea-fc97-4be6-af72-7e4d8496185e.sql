-- Create table for round suggestions
CREATE TABLE public.round_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  golf_course_id UUID NOT NULL,
  suggested_date DATE NOT NULL,
  suggested_time TIME NOT NULL,
  message TEXT,
  max_players INTEGER DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.round_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policies for round suggestions
CREATE POLICY "Users can create their own round suggestions" 
ON public.round_suggestions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view round suggestions from friends" 
ON public.round_suggestions 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM friends 
      WHERE status = 'accepted' 
      AND ((user_id = auth.uid() AND friend_id = round_suggestions.user_id) 
           OR (user_id = round_suggestions.user_id AND friend_id = auth.uid()))
    )
  )
);

CREATE POLICY "Users can update their own round suggestions" 
ON public.round_suggestions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own round suggestions" 
ON public.round_suggestions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_round_suggestions_updated_at
BEFORE UPDATE ON public.round_suggestions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key reference to golf_courses
ALTER TABLE public.round_suggestions 
ADD CONSTRAINT fk_round_suggestions_golf_course 
FOREIGN KEY (golf_course_id) REFERENCES public.golf_courses(id);

-- Create table for round suggestion participants
CREATE TABLE public.round_suggestion_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_suggestion_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, declined
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(round_suggestion_id, user_id)
);

-- Enable Row Level Security for participants
ALTER TABLE public.round_suggestion_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for participants
CREATE POLICY "Users can join round suggestions from friends" 
ON public.round_suggestion_participants 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM round_suggestions rs
    JOIN friends f ON (
      (f.user_id = auth.uid() AND f.friend_id = rs.user_id) OR
      (f.user_id = rs.user_id AND f.friend_id = auth.uid())
    )
    WHERE rs.id = round_suggestion_id AND f.status = 'accepted'
  )
);

CREATE POLICY "Users can view participants for accessible round suggestions" 
ON public.round_suggestion_participants 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM round_suggestions rs
    WHERE rs.id = round_suggestion_id 
    AND (
      rs.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM friends 
        WHERE status = 'accepted' 
        AND ((user_id = auth.uid() AND friend_id = rs.user_id) 
             OR (user_id = rs.user_id AND friend_id = auth.uid()))
      )
    )
  )
);

CREATE POLICY "Users can update their own participation status" 
ON public.round_suggestion_participants 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add foreign key references
ALTER TABLE public.round_suggestion_participants 
ADD CONSTRAINT fk_round_participants_suggestion 
FOREIGN KEY (round_suggestion_id) REFERENCES public.round_suggestions(id) ON DELETE CASCADE;
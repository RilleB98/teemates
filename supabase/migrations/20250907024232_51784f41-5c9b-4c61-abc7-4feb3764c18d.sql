-- Enable Row Level Security on user_tokens table
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their own tokens
CREATE POLICY "Users can view their own tokens" 
ON public.user_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own tokens
CREATE POLICY "Users can insert their own tokens" 
ON public.user_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own tokens
CREATE POLICY "Users can update their own tokens" 
ON public.user_tokens 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own tokens
CREATE POLICY "Users can delete their own tokens" 
ON public.user_tokens 
FOR DELETE 
USING (auth.uid() = user_id);
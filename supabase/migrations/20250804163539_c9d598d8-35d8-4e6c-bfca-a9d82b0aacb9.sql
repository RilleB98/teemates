-- Create a table to track read messages
CREATE TABLE public.message_reads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  message_id uuid NOT NULL,
  read_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, message_id)
);

-- Enable RLS
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

-- Create policies for message reads
CREATE POLICY "Users can view their own read status"
ON public.message_reads
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can mark messages as read"
ON public.message_reads
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own read status"
ON public.message_reads
FOR UPDATE
USING (auth.uid() = user_id);

-- Add foreign key constraint to messages
ALTER TABLE public.message_reads
ADD CONSTRAINT message_reads_message_id_fkey
FOREIGN KEY (message_id) REFERENCES public.messages(id)
ON DELETE CASCADE;
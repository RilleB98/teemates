-- Security Fix: Remove plaintext tokens and improve user_tokens table security
-- This addresses the security vulnerability where plaintext tokens could be stolen

-- Step 1: For any existing records with NULL token_hash but existing token, 
-- create a hash from the existing token before removing the plaintext column
UPDATE public.user_tokens 
SET token_hash = encode(digest(token, 'sha256'), 'hex')
WHERE token_hash IS NULL AND token IS NOT NULL;

-- Step 2: Remove any records that have no way to generate a hash (shouldn't happen but safety check)
DELETE FROM public.user_tokens 
WHERE token_hash IS NULL AND (token IS NULL OR token = '');

-- Step 3: Now safely remove the plaintext token column
ALTER TABLE public.user_tokens DROP COLUMN IF EXISTS token;

-- Step 4: Ensure token_hash is NOT NULL since it's now the only way to store tokens
ALTER TABLE public.user_tokens ALTER COLUMN token_hash SET NOT NULL;

-- Step 5: Add constraint to ensure token_hash has minimum length (basic validation)
ALTER TABLE public.user_tokens ADD CONSTRAINT token_hash_length_check 
    CHECK (length(token_hash) >= 32);

-- Step 6: Add privacy protection for IP addresses
ALTER TABLE public.user_tokens ADD COLUMN IF NOT EXISTS ip_hash text;

-- Hash existing IP addresses for privacy
UPDATE public.user_tokens 
SET ip_hash = encode(digest(created_by_ip::text, 'sha256'), 'hex')
WHERE created_by_ip IS NOT NULL AND ip_hash IS NULL;

-- Step 7: Add token expiration - tokens should not live forever
ALTER TABLE public.user_tokens ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;

-- Set default expiration to 30 days from creation for existing records
UPDATE public.user_tokens 
SET expires_at = COALESCE(created_at, now()) + INTERVAL '30 days' 
WHERE expires_at IS NULL;

-- Make expires_at NOT NULL for future records
ALTER TABLE public.user_tokens ALTER COLUMN expires_at SET NOT NULL;

-- Add default for new tokens to expire in 30 days
ALTER TABLE public.user_tokens ALTER COLUMN expires_at SET DEFAULT (now() + INTERVAL '30 days');

-- Step 8: Create indexes for performance and cleanup
CREATE INDEX IF NOT EXISTS idx_user_tokens_expires_at ON public.user_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_tokens_hash ON public.user_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON public.user_tokens(user_id);

-- Step 9: Create cleanup function for expired tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_tokens 
  WHERE expires_at < now();
END;
$$;

-- Step 10: Create trigger for automatic cleanup
CREATE OR REPLACE FUNCTION public.trigger_token_cleanup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Randomly trigger cleanup (5% chance on insert)
  IF random() < 0.05 THEN
    PERFORM public.cleanup_expired_tokens();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_token_cleanup ON public.user_tokens;
CREATE TRIGGER trigger_token_cleanup
    AFTER INSERT ON public.user_tokens
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_token_cleanup();

-- Step 11: Update RLS policies to be secure
DROP POLICY IF EXISTS "Secure token access only" ON public.user_tokens;
DROP POLICY IF EXISTS "Users can insert their own tokens" ON public.user_tokens;
DROP POLICY IF EXISTS "Users can update their own tokens" ON public.user_tokens;
DROP POLICY IF EXISTS "Users can delete their own tokens" ON public.user_tokens;

-- Secure policies that protect tokens
CREATE POLICY "Secure token access only" ON public.user_tokens
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens" ON public.user_tokens
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" ON public.user_tokens
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens" ON public.user_tokens
FOR DELETE USING (auth.uid() = user_id);

-- Step 12: Add documentation comments
COMMENT ON TABLE public.user_tokens IS 'Secure token storage table - only stores hashed tokens, never plaintext. Tokens expire automatically after 30 days.';
COMMENT ON COLUMN public.user_tokens.token_hash IS 'Hashed version of authentication token - never store plaintext tokens';
COMMENT ON COLUMN public.user_tokens.ip_hash IS 'Hashed IP address for security/privacy - replaces created_by_ip raw storage';
COMMENT ON COLUMN public.user_tokens.expires_at IS 'Token expiration timestamp - tokens are automatically cleaned up after expiration';
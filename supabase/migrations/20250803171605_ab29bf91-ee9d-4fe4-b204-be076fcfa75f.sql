-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public';

-- Update auth configuration for OTP expiry (set to 30 minutes instead of default)
UPDATE auth.config 
SET 
  otp_exp = 1800,  -- 30 minutes in seconds
  password_min_length = 8,
  enable_signup = true,
  enable_confirmations = true,
  enable_recoveries = true,
  enable_email_change_confirmations = true,
  enable_phone_change_confirmations = true
WHERE TRUE;

-- Enable leaked password protection
INSERT INTO auth.config (enable_pwned_check) 
VALUES (true)
ON CONFLICT DO UPDATE SET enable_pwned_check = true;
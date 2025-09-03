-- Fix critical security vulnerability in subscribers table RLS policies
-- Current policies allow anyone to insert/update any subscription record
-- This exposes sensitive payment data and allows privilege escalation

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create secure INSERT policy - users can only create subscriptions for themselves
CREATE POLICY "users_can_insert_own_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND auth.email() = email
);

-- Create secure UPDATE policy - users can only update their own subscriptions  
CREATE POLICY "users_can_update_own_subscription" ON public.subscribers
FOR UPDATE
USING (
  auth.uid() = user_id 
  AND auth.email() = email
);

-- The SELECT policy is already secure, keeping it as is:
-- "select_own_subscription" USING ((user_id = auth.uid()) OR (email = auth.email()))
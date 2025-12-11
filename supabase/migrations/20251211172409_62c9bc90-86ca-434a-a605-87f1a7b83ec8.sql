-- FIX 1: Restrict profiles - Remove permissive SELECT policies and use functions for controlled access
-- Drop the overly permissive swipe policy
DROP POLICY IF EXISTS "Swipe profile access - limited fields" ON public.profiles;

-- Create a function to get safe swipe profile data (only essential fields)
CREATE OR REPLACE FUNCTION public.get_swipe_profiles()
RETURNS TABLE (
  user_id uuid,
  name text,
  avatar_url text,
  age integer,
  handicap numeric,
  gender text,
  home_club text,
  bio text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.name,
    p.avatar_url,
    p.age,
    p.handicap,
    p.gender,
    p.home_club,
    p.bio
  FROM public.profiles p
  WHERE p.user_id <> auth.uid()
    AND p.name IS NOT NULL
    AND auth.uid() IS NOT NULL;
$$;

-- Create a function to get friend profile data (more fields but still protected)
CREATE OR REPLACE FUNCTION public.get_friend_profile(target_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  name text,
  avatar_url text,
  age integer,
  handicap numeric,
  gender text,
  home_club text,
  bio text,
  home_city text,
  play_frequency text,
  availability text,
  golf_id text,
  birth_date date,
  selected_course jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.name,
    p.avatar_url,
    p.age,
    p.handicap,
    p.gender,
    p.home_club,
    p.bio,
    p.home_city,
    p.play_frequency,
    p.availability,
    p.golf_id,
    p.birth_date,
    p.selected_course
  FROM public.profiles p
  WHERE p.user_id = target_user_id
    AND auth.uid() IS NOT NULL
    AND (
      p.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.friends f
        WHERE f.status = 'accepted'
        AND (
          (f.user_id = auth.uid() AND f.friend_id = target_user_id)
          OR (f.user_id = target_user_id AND f.friend_id = auth.uid())
        )
      )
    );
$$;

-- FIX 2: Lock down notification_queue - explicitly deny all write operations from clients
-- The table should only be written to by triggers/functions with SECURITY DEFINER

-- Add explicit DENY policies for INSERT, UPDATE, DELETE (these block all client writes)
CREATE POLICY "No direct inserts allowed" ON public.notification_queue
FOR INSERT TO authenticated, anon
WITH CHECK (false);

CREATE POLICY "No direct updates allowed" ON public.notification_queue
FOR UPDATE TO authenticated, anon
USING (false);

CREATE POLICY "No direct deletes allowed" ON public.notification_queue
FOR DELETE TO authenticated, anon
USING (false);

-- Add comment explaining the security model
COMMENT ON TABLE public.notification_queue IS 'Notifications are created only via SECURITY DEFINER triggers/functions. Direct client access is blocked.';
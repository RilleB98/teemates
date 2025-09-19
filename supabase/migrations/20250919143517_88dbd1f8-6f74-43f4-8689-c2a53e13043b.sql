-- Fix search_path issues for all functions

-- Fix the new search function
DROP FUNCTION IF EXISTS public.search_profiles_by_golf_id(text);

CREATE OR REPLACE FUNCTION public.search_profiles_by_golf_id(search_golf_id text)
RETURNS TABLE (
  user_id uuid,
  name text,
  golf_id text,
  handicap numeric,
  home_club text,
  avatar_url text
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT 
    p.user_id,
    p.name,
    p.golf_id,
    p.handicap,
    p.home_club,
    p.avatar_url
  FROM public.profiles p
  WHERE 
    p.golf_id = search_golf_id
    AND p.user_id != COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
    AND p.name IS NOT NULL
    AND p.golf_id IS NOT NULL
  LIMIT 10;
$$;

-- Update existing functions to have proper search_path
CREATE OR REPLACE FUNCTION public.is_group_chat_member(_group_chat_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_chat_members 
    WHERE group_chat_id = _group_chat_id 
    AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_user_group_member(_group_chat_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_chat_members 
    WHERE group_chat_id = _group_chat_id 
    AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_chat_room(_user_id uuid, _chat_room_id text)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE
    -- Allow access to golf-group chat for all authenticated users
    WHEN _chat_room_id = 'golf-group' THEN true
    -- For private chats (format: uuid_uuid), verify user is a participant
    WHEN _chat_room_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      _user_id::text = ANY(string_to_array(_chat_room_id, '_'))
    -- For group chats (format: group_uuid), verify user is a member using our safe function
    WHEN _chat_room_id ~ '^group_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      public.is_group_chat_member(substring(_chat_room_id from 7)::uuid, _user_id)
    -- Deny access to any other chat room format
    ELSE false
  END;
$$;

CREATE OR REPLACE FUNCTION public.generate_chat_room_id(user1_id uuid, user2_id uuid)
RETURNS text
LANGUAGE sql
IMMUTABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE 
    WHEN user1_id < user2_id THEN user1_id::text || '_' || user2_id::text
    ELSE user2_id::text || '_' || user1_id::text
  END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;
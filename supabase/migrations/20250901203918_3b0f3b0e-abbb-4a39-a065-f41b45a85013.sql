-- Temporarily disable RLS on group_chat_members and remove all policies
ALTER TABLE public.group_chat_members DISABLE ROW LEVEL SECURITY;

-- Remove all existing policies
DROP POLICY IF EXISTS "Creators and self can add members" ON public.group_chat_members;
DROP POLICY IF EXISTS "Members can remove members" ON public.group_chat_members;
DROP POLICY IF EXISTS "Members can view group chat members" ON public.group_chat_members;
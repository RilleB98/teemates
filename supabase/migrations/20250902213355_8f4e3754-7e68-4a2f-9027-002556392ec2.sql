-- Fix remaining multiple permissive policies issue for user_roles
-- The problem is having both an "ALL" policy and a separate "SELECT" policy

-- Drop all user_roles policies
DROP POLICY IF EXISTS "Role access policy" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;

-- Create single comprehensive policy that handles all access patterns
CREATE POLICY "User roles access policy" ON public.user_roles
FOR SELECT USING (
  -- Users can view their own roles
  ((SELECT auth.uid()) = user_id) OR
  -- Admins can view all roles
  has_role((SELECT auth.uid()), 'admin'::app_role)
);

-- Create separate policies for admin management operations
CREATE POLICY "Admins can insert user roles" ON public.user_roles
FOR INSERT WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can update user roles" ON public.user_roles
FOR UPDATE USING (has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can delete user roles" ON public.user_roles
FOR DELETE USING (has_role((SELECT auth.uid()), 'admin'::app_role));
-- Make another user admin
INSERT INTO public.user_roles (user_id, role) 
VALUES ('966bf753-3587-4cd4-9359-1a8f79a28980', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
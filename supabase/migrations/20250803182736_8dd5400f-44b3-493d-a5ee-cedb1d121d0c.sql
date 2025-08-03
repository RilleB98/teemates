-- Make user admin
INSERT INTO public.user_roles (user_id, role) 
VALUES ('7ede9c63-e867-42dd-b2df-6824c73f6e9d', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
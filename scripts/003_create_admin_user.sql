-- This script creates an admin user with the credentials:
-- Email: vmatthew727@gmail.com
-- Password: computer

-- First, create the auth user via SQL
-- Note: You'll need to run this in Supabase SQL Editor or via the admin API

-- Insert into admin_users table (after the auth user is created)
-- Get the user ID from the auth.users table first:
-- SELECT id FROM auth.users WHERE email = 'vmatthew727@gmail.com';

-- Then insert into admin_users:
INSERT INTO public.admin_users (id)
SELECT id FROM auth.users WHERE email = 'vmatthew727@gmail.com'
ON CONFLICT (id) DO NOTHING;

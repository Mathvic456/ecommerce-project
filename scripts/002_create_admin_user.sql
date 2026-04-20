-- This script creates the first admin user account
-- The auth user must be created first through the sign-up flow or manually in Supabase Auth dashboard
-- Then run this to grant admin privileges

-- After signing up with email: admin@example.com and your chosen password,
-- Get the user ID from the auth.users table and replace 'YOUR_USER_ID_HERE' below

-- INSERT INTO public.admin_users (id)
-- VALUES ('YOUR_USER_ID_HERE')
-- ON CONFLICT (id) DO NOTHING;

-- For testing purposes, you can use this query to view all users:
-- SELECT id, email FROM auth.users;

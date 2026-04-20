-- Fix admin_users RLS policies to allow admin user creation

-- First, allow authenticated users to check if they are admins (needed for login check)
DROP POLICY IF EXISTS "Allow admins to view admin list" ON public.admin_users;

-- Allow any authenticated user to check if they are an admin (only their own record)
CREATE POLICY "Allow users to check their own admin status"
  ON public.admin_users FOR SELECT
  USING (auth.uid() = id);

-- Allow service role to insert (for admin registration)
-- Note: The service role (admin client) bypasses RLS by default,
-- but we add this for completeness
CREATE POLICY "Allow service role to manage admin_users"
  ON public.admin_users FOR ALL
  USING (true)
  WITH CHECK (true);

-- Actually, the above policy is too permissive. Let's be more specific:
DROP POLICY IF EXISTS "Allow service role to manage admin_users" ON public.admin_users;

-- Admins can view all admin records
CREATE POLICY "Allow admins to view all admins"
  ON public.admin_users FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Fix RLS policy for admin_users table
-- Allow users to check if they themselves are admins (without seeing other admins)

DROP POLICY IF EXISTS "Allow admins to view admin list" ON public.admin_users;

CREATE POLICY "Allow users to check their own admin status"
  ON public.admin_users FOR SELECT
  USING (auth.uid() = id);

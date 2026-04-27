-- 013_fix_order_rls_policies.sql
-- Description: Removes the ability for normal users to arbitrarily update their own orders.
-- Modifying order statues, totals, or IDs should strictly be processed by the server-side via the Admin Client.

-- Drop the overly permissive UPDATE policy
DROP POLICY IF EXISTS "Allow users to update their own orders" ON public.orders;

-- Ensure that admin users can still update any order (though we use service role key primarily now):
-- (The existing "Allow admins to update orders" policy from 001 handles this, but let's confirm/recreate it for safety)
DROP POLICY IF EXISTS "Allow admins to update orders" ON public.orders;
CREATE POLICY "Allow admins to update orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

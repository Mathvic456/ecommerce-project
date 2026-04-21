-- Fix the status constraint to include 'pending' for orders awaiting payment
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'received', 'shipped', 'delivered', 'cancelled'));

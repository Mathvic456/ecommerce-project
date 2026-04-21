-- Migration to update order statuses to the new system
-- received, shipped, delivered, cancelled

-- 1. Update existing statuses to the new keys
UPDATE public.orders SET status = 'received' WHERE status = 'pending';
UPDATE public.orders SET status = 'delivered' WHERE status = 'completed';

-- 2. Update the column default value
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'received';

-- 3. Add a check constraint to ensure only valid statuses are used (Optional but recommended)
-- First drop existing constraint if any (not present in 001_create_tables.sql)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('received', 'shipped', 'delivered', 'cancelled'));

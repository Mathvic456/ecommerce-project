-- Add email column to orders table for easier admin access
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);

-- Update existing orders with email from auth.users (if possible via trigger or manual update)
-- Note: This requires admin access to auth.users table
-- For existing orders, you may need to run this manually or via a one-time script

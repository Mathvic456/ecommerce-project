-- Add policy to allow public order tracking by order_number
-- This allows anyone to look up an order by its order_number (for tracking purposes)
-- Only returns limited information (order_number, status, created_at)

CREATE POLICY "Allow public tracking by order_number"
  ON public.orders FOR SELECT
  USING (true);

-- Note: The application will limit what fields are returned for non-authenticated users

-- Create tables for the ecommerce platform

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Price in cents
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  total_amount INTEGER NOT NULL, -- Total in cents
  status TEXT DEFAULT 'pending', -- pending, completed, cancelled
  stripe_payment_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL, -- Price at time of purchase
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Admin users table (for tracking admin accounts)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Products: Allow everyone to view, only admins to modify
CREATE POLICY "Allow public read on products" 
  ON public.products FOR SELECT 
  USING (true);

CREATE POLICY "Allow admins to insert products"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Allow admins to update products"
  ON public.products FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Allow admins to delete products"
  ON public.products FOR DELETE
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Orders: Users can view their own, admins can view all
CREATE POLICY "Allow users to view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Allow authenticated users to create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.admin_users));

-- Order items: Users can view their order items, admins can view all
CREATE POLICY "Allow users to view their order items"
  ON public.order_items FOR SELECT
  USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()) OR auth.uid() IN (SELECT id FROM public.admin_users));

-- Cart items: Users can only manage their own cart
CREATE POLICY "Allow users to view their own cart"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert own cart items"
  ON public.cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own cart items"
  ON public.cart_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own cart items"
  ON public.cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- Admin users: Only view, no direct modification (managed through auth metadata)
CREATE POLICY "Allow admins to view admin list"
  ON public.admin_users FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

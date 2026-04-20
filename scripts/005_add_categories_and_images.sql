-- Add categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add category_id to products table and multi-currency pricing
ALTER TABLE public.products
ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
ADD COLUMN price_usd INTEGER,
ADD COLUMN price_gbp INTEGER,
ADD COLUMN price_ngn INTEGER;

-- Create product_images table for multiple images per product
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on categories and product_images
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Categories: Allow everyone to view, only admins to modify
CREATE POLICY "Allow public read on categories" 
  ON public.categories FOR SELECT 
  USING (true);

CREATE POLICY "Allow admins to insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Allow admins to update categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Allow admins to delete categories"
  ON public.categories FOR DELETE
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Product images: Allow public read, admins to modify
CREATE POLICY "Allow public read on product_images" 
  ON public.product_images FOR SELECT 
  USING (true);

CREATE POLICY "Allow admins to insert product images"
  ON public.product_images FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Allow admins to update product images"
  ON public.product_images FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Allow admins to delete product images"
  ON public.product_images FOR DELETE
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

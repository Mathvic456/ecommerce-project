-- Safely add price_ngn column to products if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'products'
    AND column_name = 'price_ngn'
  ) THEN
    ALTER TABLE public.products ADD COLUMN price_ngn INTEGER;
    RAISE NOTICE 'price_ngn column added successfully';
  ELSE
    RAISE NOTICE 'price_ngn column already exists';
  END IF;
END $$;

-- Also ensure price_usd and price_gbp exist (in case they are missing too)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'products'
    AND column_name = 'price_usd'
  ) THEN
    ALTER TABLE public.products ADD COLUMN price_usd INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'products'
    AND column_name = 'price_gbp'
  ) THEN
    ALTER TABLE public.products ADD COLUMN price_gbp INTEGER;
  END IF;
END $$;

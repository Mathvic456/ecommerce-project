-- Add shipping fields to orders table if they don't exist

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_method') THEN
        ALTER TABLE public.orders ADD COLUMN shipping_method TEXT DEFAULT 'standard';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_cost') THEN
        ALTER TABLE public.orders ADD COLUMN shipping_cost INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'subtotal_amount') THEN
        ALTER TABLE public.orders ADD COLUMN subtotal_amount INTEGER DEFAULT 0;
    END IF;
END $$;

-- Migration to fix orders table and add missing user tables

-- 1. Add shipping_address to orders table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_address') THEN
        ALTER TABLE public.orders ADD COLUMN shipping_address TEXT;
    END IF;
END $$;

-- 2. Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create user_addresses table
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- 5. Policies for user_profiles
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own profile' AND tablename = 'user_profiles') THEN
        CREATE POLICY "Users can view their own profile" ON public.user_profiles
            FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own profile' AND tablename = 'user_profiles') THEN
        CREATE POLICY "Users can insert their own profile" ON public.user_profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile' AND tablename = 'user_profiles') THEN
        CREATE POLICY "Users can update their own profile" ON public.user_profiles
            FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- 6. Policies for user_addresses
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own addresses' AND tablename = 'user_addresses') THEN
        CREATE POLICY "Users can view their own addresses" ON public.user_addresses
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own addresses' AND tablename = 'user_addresses') THEN
        CREATE POLICY "Users can insert their own addresses" ON public.user_addresses
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own addresses' AND tablename = 'user_addresses') THEN
        CREATE POLICY "Users can update their own addresses" ON public.user_addresses
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own addresses' AND tablename = 'user_addresses') THEN
        CREATE POLICY "Users can delete their own addresses" ON public.user_addresses
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

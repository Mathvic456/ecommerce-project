-- Create the product_images storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product_images',
  'product_images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "product_images_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "product_images_service_role" ON storage.objects;
DROP POLICY IF EXISTS "product_images_update" ON storage.objects;
DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;

-- Policy: Allow public read access to product images bucket only
CREATE POLICY "product_images_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product_images');

-- Policy: Allow anyone to upload to product_images bucket (service role handles auth)
CREATE POLICY "product_images_authenticated_insert"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'product_images');

-- Policy: Allow updates on product_images bucket
CREATE POLICY "product_images_update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'product_images')
WITH CHECK (bucket_id = 'product_images');

-- Policy: Allow deletes on product_images bucket
CREATE POLICY "product_images_delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'product_images');

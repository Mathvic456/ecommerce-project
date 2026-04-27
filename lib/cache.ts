import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

/**
 * Cached function to fetch all categories
 * React cache ensures this only runs once per request
 */
export const getCachedCategories = cache(async () => {
  const supabase = await createClient()
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name")
  return data || []
})

/**
 * Cached function to fetch featured products
 */
export const getCachedFeaturedProducts = cache(async (limit: number = 8) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*, product_images(image_url, display_order), categories(name)")
    .limit(limit)
    .order("created_at", { ascending: false })
  return data || []
})

/**
 * Cached function to fetch a single product with images
 */
export const getCachedProduct = cache(async (productId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*, product_images(image_url, display_order), categories(name)")
    .eq("id", productId)
    .single()
  return data
})

/**
 * Cached function to fetch products by category
 */
export const getCachedProductsByCategory = cache(async (categoryId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*, product_images(image_url, display_order), categories(name)")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false })
  return data || []
})

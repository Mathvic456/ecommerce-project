/**
 * Optimized database queries with proper typing
 * These functions can be used in both server and client components
 */

import { createClient as createBrowserClient } from "@/lib/supabase/client"
import { createClient as createServerClient } from "@/lib/supabase/server"

export interface ProductImage {
  id: string
  image_url: string
  display_order: number
}

export interface Product {
  id: string
  name: string
  description: string
  price_usd: number | null
  price_gbp: number | null
  price_ngn: number | null
  category_id: string
  created_at: string
  product_images?: ProductImage[]
  categories?: { name: string }
}

export interface Category {
  id: string
  name: string
  description: string
  image_url: string
}

/**
 * Fetch products with images (server-side)
 */
export async function getProductsServer(limit?: number) {
  const supabase = await createServerClient()
  let query = supabase
    .from("products")
    .select("*, product_images(id, image_url, display_order), categories(name)")
    .order("created_at", { ascending: false })
  
  if (limit) {
    query = query.limit(limit)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error("Error fetching products:", error)
    return []
  }
  
  return (data as Product[]) || []
}

/**
 * Fetch products with images (client-side)
 */
export async function getProductsClient(limit?: number) {
  const supabase = createBrowserClient()
  let query = supabase
    .from("products")
    .select("*, product_images(id, image_url, display_order), categories(name)")
    .order("created_at", { ascending: false })
  
  if (limit) {
    query = query.limit(limit)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error("Error fetching products:", error)
    return []
  }
  
  return (data as Product[]) || []
}

/**
 * Fetch single product by ID (server-side)
 */
export async function getProductByIdServer(productId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(id, image_url, display_order), categories(name)")
    .eq("id", productId)
    .single()
  
  if (error) {
    console.error("Error fetching product:", error)
    return null
  }
  
  return data as Product
}

/**
 * Fetch categories (server-side)
 */
export async function getCategoriesServer() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name")
  
  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }
  
  return (data as Category[]) || []
}

/**
 * Fetch products by category (server-side)
 */
export async function getProductsByCategoryServer(categoryId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(id, image_url, display_order), categories(name)")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false })
  
  if (error) {
    console.error("Error fetching products by category:", error)
    return []
  }
  
  return (data as Product[]) || []
}

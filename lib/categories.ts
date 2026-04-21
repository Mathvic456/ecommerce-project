export interface Category {
  id: string
  name: string
  description?: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  display_order: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  category_id?: string
  price_usd?: number
  price_gbp?: number
  price_ngn?: number
  image_url?: string
  imageUrl?: string
  created_at: string
  updated_at: string
}

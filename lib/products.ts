export interface Product {
  id: string
  name: string
  description: string
  category_id: string
  price_usd: number // Price in cents
  price_gbp: number // Price in cents
  price_ngn: number // Price in cents
  images?: ProductImage[]
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  display_order: number
  created_at?: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  product?: Product
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  total_amount: number
  status: "pending" | "received" | "shipped" | "delivered" | "cancelled"
  stripe_payment_id?: string
  shipping_address?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  created_at?: string
}

// Generate unique order number
export function generateOrderNumber(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `ORD-${timestamp}-${random}`
}

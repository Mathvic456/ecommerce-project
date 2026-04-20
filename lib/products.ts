export interface Product {
  id: string
  name: string
  description: string
  categoryId: string
  priceUsd: number // Price in cents
  priceGbp: number // Price in cents
  priceNgn: number // Price in cents
  images?: ProductImage[]
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  id: string
  productId: string
  imageUrl: string
  displayOrder: number
}

export interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  product?: Product
}

export interface Order {
  id: string
  userId: string
  orderNumber: string
  totalAmount: number
  status: "pending" | "completed" | "cancelled"
  stripePaymentId?: string
  createdAt: string
  updatedAt: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
}

// Generate unique order number
export function generateOrderNumber(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `ORD-${timestamp}-${random}`
}

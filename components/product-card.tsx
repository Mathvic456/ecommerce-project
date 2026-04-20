"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/categories"
import { ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatPrice, type Currency } from "@/lib/currency"

interface ProductImage {
  id: string
  image_url: string
  display_order: number
}

interface ProductCardProps {
  product: Product & { product_images?: ProductImage[] }
  currency: Currency
  price: number
  onAddToCart: (productId: string) => void
}

export function ProductCard({ product, currency, price, onAddToCart }: ProductCardProps) {
  const router = useRouter()
  const firstImage = (product.product_images || []).sort((a, b) => a.display_order - b.display_order)[0]

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return
    router.push(`/products/${product.id}`)
  }

  return (
    <div
      onClick={handleCardClick}
      className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
    >
      {firstImage && (
        <div className="w-full h-48 bg-muted overflow-hidden">
          <img
            src={firstImage.image_url || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition"
          />
        </div>
      )}
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">{formatPrice(price, currency)}</span>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart(product.id)
            }}
            className="flex items-center gap-2"
          >
            <ShoppingCart size={16} />
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"
import { createClient } from "@/lib/supabase/client"
import type { CartItem, Product } from "@/lib/products"
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatPrice, type Currency, getCurrencyFromStorage, getPriceForCurrency } from "@/lib/currency"

interface ProductImage {
  id: string
  image_url: string
  display_order: number
}

interface ProductWithImages extends Product {
  product_images?: ProductImage[]
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<(CartItem & { products?: ProductWithImages })[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState<Currency>("NGN")
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchCart = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        router.push("/auth/login")
        return
      }

      setUser(data.user)
      setCurrency(getCurrencyFromStorage())

      const { data: items } = await supabase
        .from("cart_items")
        .select(`
          id,
          user_id,
          product_id,
          quantity,
          created_at,
          updated_at,
          products:product_id (*, product_images(*))
        `)
        .eq("user_id", data.user.id)

      setCartItems(items || [])
      setLoading(false)
    }

    fetchCart()

    const handleStorageChange = () => {
      setCurrency(getCurrencyFromStorage())
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [supabase, router])

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await supabase.from("cart_items").delete().eq("id", cartItemId)
    } else {
      await supabase.from("cart_items").update({ quantity: newQuantity }).eq("id", cartItemId)
    }

    const updated = cartItems
      .map((item) => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item))
      .filter((item) => item.quantity > 0)
    setCartItems(updated)
  }

  const handleRemoveItem = async (cartItemId: string) => {
    await supabase.from("cart_items").delete().eq("id", cartItemId)
    setCartItems(cartItems.filter((item) => item.id !== cartItemId))
  }

  const totalAmount = cartItems.reduce((sum, item) => {
    const price = getPriceForCurrency(item.products || {}, currency) || 0
    return sum + price * item.quantity
  }, 0)

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-6 p-6 border border-border">
                <div className="w-24 h-32 bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted" />
                  <div className="h-6 w-48 bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-4xl font-serif">Shopping Cart</h1>
          {cartItems.length > 0 && (
            <p className="text-muted-foreground">
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center border border-border">
              <ShoppingBag size={32} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-serif mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added anything to your cart yet
            </p>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground text-sm tracking-wider uppercase"
            >
              Start Shopping
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="border-t border-border">
                {cartItems.map((item) => {
                  const price = getPriceForCurrency(item.products || {}, currency) || 0
                  const firstImage = item.products?.product_images?.[0]?.image_url
                  return (
                    <div key={item.id} className="flex gap-4 lg:gap-6 py-6 border-b border-border">
                      {/* Product Image */}
                      <Link 
                        href={`/products/${item.product_id}`}
                        className="relative w-24 h-32 lg:w-32 lg:h-40 flex-shrink-0 bg-secondary overflow-hidden"
                      >
                        <Image
                          src={firstImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"}
                          alt={item.products?.name || "Product"}
                          fill
                          className="object-cover"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <Link 
                            href={`/products/${item.product_id}`}
                            className="font-medium hover:opacity-60 transition-opacity"
                          >
                            {item.products?.name}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatPrice(price, currency)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-border">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-10 h-8 flex items-center justify-center text-sm border-x border-border">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Item Total - Desktop */}
                      <div className="hidden lg:block text-right w-24">
                        <p className="font-medium">{formatPrice(price * item.quantity, currency)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Continue Shopping */}
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 mt-8 text-sm hover:opacity-60 transition-opacity"
              >
                <ArrowRight size={16} className="rotate-180" />
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-40 lg:self-start">
              <div className="bg-secondary p-6 lg:p-8">
                <h2 className="text-lg font-serif mb-6">Order Summary</h2>
                
                <div className="space-y-4 pb-6 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(totalAmount, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{totalAmount >= 5000000 ? "Free" : "Calculated at checkout"}</span>
                  </div>
                </div>

                <div className="flex justify-between py-6 border-b border-border">
                  <span className="font-medium">Estimated Total</span>
                  <span className="font-medium text-lg">{formatPrice(totalAmount, currency)}</span>
                </div>

                <Link
                  href="/checkout"
                  className="flex items-center justify-center gap-2 w-full py-4 mt-6 bg-primary text-primary-foreground text-sm tracking-wider uppercase hover:opacity-90 transition-opacity"
                >
                  Checkout
                  <ArrowRight size={16} />
                </Link>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Lock size={12} />
                  Secure checkout powered by Stripe
                </div>

                {totalAmount < 5000000 && (
                  <p className="mt-6 text-xs text-center text-muted-foreground">
                    Free shipping on orders over {formatPrice(5000000, currency)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" />
    </main>
  )
}

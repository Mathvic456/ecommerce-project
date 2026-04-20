"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"
import { createClient } from "@/lib/supabase/client"
import { getCurrencyFromStorage, type Currency, getPriceForCurrency, formatPrice } from "@/lib/currency"
import { Grid3X3, LayoutList, Sparkles } from "lucide-react"

interface ProductImage {
  id: string
  image_url: string
  display_order: number
}

interface Product {
  id: string
  name: string
  description: string
  price_usd: number
  price_gbp: number
  price_eur: number
  category_id: string
  created_at: string
  product_images?: ProductImage[]
  categories?: { name: string }
}

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState<Currency>("NGN")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const supabase = createClient()

  useEffect(() => {
    const fetchNewArrivals = async () => {
      setCurrency(getCurrencyFromStorage())

      // Calculate the date 20 days ago
      const twentyDaysAgo = new Date()
      twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20)
      const twentyDaysAgoISO = twentyDaysAgo.toISOString()

      // Fetch products created within the last 20 days
      const { data: productsData } = await supabase
        .from("products")
        .select("*, product_images(*), categories(name)")
        .gte("created_at", twentyDaysAgoISO)
        .order("created_at", { ascending: false })

      setProducts(productsData || [])
      setLoading(false)
    }

    fetchNewArrivals()

    const handleStorageChange = () => {
      setCurrency(getCurrencyFromStorage())
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [supabase])

  // Calculate days since upload for each product
  const getDaysSinceUpload = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Page Header */}
      <div className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
            <h1 className="text-3xl lg:text-5xl font-serif text-center">New Arrivals</h1>
            <Sparkles className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-center max-w-xl mx-auto">
            Discover the latest additions to our collection, featuring products added within the last 20 days
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <p className="text-sm text-muted-foreground">
            {products.length} new {products.length === 1 ? "arrival" : "arrivals"}
          </p>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
              aria-label="Grid view"
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
              aria-label="List view"
            >
              <LayoutList size={18} />
            </button>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted mb-4" />
                <div className="h-3 w-20 bg-muted mb-2" />
                <div className="h-4 w-32 bg-muted mb-2" />
                <div className="h-4 w-16 bg-muted" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-serif mb-4">No new arrivals yet</h2>
            <p className="text-muted-foreground mb-8">
              Check back soon for the latest additions to our collection
            </p>
            <Link
              href="/categories"
              className="inline-block px-8 py-4 bg-primary text-primary-foreground text-sm tracking-wider uppercase"
            >
              Browse All Products
            </Link>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product) => {
              const firstImage = product.product_images?.[0]?.image_url
              const price = getPriceForCurrency(product, currency)
              const daysSince = getDaysSinceUpload(product.created_at)
              
              return (
                <Link key={product.id} href={`/products/${product.id}`} className="group">
                  <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-secondary">
                    <Image
                      src={firstImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* New Badge */}
                    <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium uppercase tracking-wider">
                      {daysSince <= 3 ? "Just In" : daysSince <= 7 ? "New" : `${daysSince}d ago`}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {product.categories?.name || "LuxuryByEsta"}
                    </p>
                    <h3 className="font-medium group-hover:opacity-60 transition-opacity line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm">{formatPrice(price, currency)}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="space-y-6">
            {products.map((product) => {
              const firstImage = product.product_images?.[0]?.image_url
              const price = getPriceForCurrency(product, currency)
              const daysSince = getDaysSinceUpload(product.created_at)
              
              return (
                <Link key={product.id} href={`/products/${product.id}`} className="group flex gap-6">
                  <div className="relative w-32 h-40 flex-shrink-0 overflow-hidden bg-secondary">
                    <Image
                      src={firstImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* New Badge */}
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-0.5 text-xs font-medium uppercase tracking-wider">
                      New
                    </div>
                  </div>
                  <div className="flex-1 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {product.categories?.name || "LuxuryByEsta"}
                      </p>
                      <span className="text-xs text-primary">
                        {daysSince <= 1 ? "Added today" : `Added ${daysSince} days ago`}
                      </span>
                    </div>
                    <h3 className="font-medium mb-2 group-hover:opacity-60 transition-opacity">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {product.description}
                    </p>
                    <p className="font-medium">{formatPrice(price, currency)}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" />
    </main>
  )
}

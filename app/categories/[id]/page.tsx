"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"
import { createClient } from "@/lib/supabase/client"
import { getCurrencyFromStorage, type Currency, getPriceForCurrency, formatPrice } from "@/lib/currency"
import { ChevronLeft, SlidersHorizontal, Grid3X3, LayoutList, X } from "lucide-react"

interface Category {
  id: string
  name: string
  description: string
  image_url: string
}

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
  product_images?: ProductImage[]
}

export default function CategoryDetailPage() {
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState<Currency>("USD")
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "newest">("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 })
  const [selectedPriceRange, setSelectedPriceRange] = useState({ min: 0, max: 10000 })
  const [showFilters, setShowFilters] = useState(false)
  const params = useParams()
  const categoryId = params.id as string
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setCurrency(getCurrencyFromStorage())

      const { data: categoryData } = await supabase
        .from("categories")
        .select("*")
        .eq("id", categoryId)
        .single()

      const { data: productsData } = await supabase
        .from("products")
        .select("*, product_images(*)")
        .eq("category_id", categoryId)
        .order("created_at", { ascending: false })

      setCategory(categoryData)
      setProducts(productsData || [])
      setFilteredProducts(productsData || [])

      // Calculate price range
      if (productsData && productsData.length > 0) {
        const prices = productsData.map((p) => p.price_usd || 0).filter((p) => p > 0)
        if (prices.length > 0) {
          const min = Math.min(...prices)
          const max = Math.max(...prices)
          setPriceRange({ min, max })
          setSelectedPriceRange({ min, max })
        }
      }

      setLoading(false)
    }

    fetchData()

    const handleStorageChange = () => {
      setCurrency(getCurrencyFromStorage())
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [supabase, categoryId])

  useEffect(() => {
    let filtered = products.filter((product) => {
      const price = product.price_usd || 0
      return price >= selectedPriceRange.min && price <= selectedPriceRange.max
    })

    // Sort products
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => (a.price_usd || 0) - (b.price_usd || 0))
        break
      case "price-desc":
        filtered.sort((a, b) => (b.price_usd || 0) - (a.price_usd || 0))
        break
      case "newest":
        // Already sorted by created_at desc
        break
      default:
        break
    }

    setFilteredProducts(filtered)
  }, [selectedPriceRange, sortBy, products])

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-muted mb-8" />
            <div className="h-8 w-48 bg-muted mb-4" />
            <div className="h-4 w-96 bg-muted" />
          </div>
        </div>
      </main>
    )
  }

  if (!category) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-serif mb-4">Category not found</h1>
          <p className="text-muted-foreground mb-8">The category you're looking for doesn't exist</p>
          <Link 
            href="/categories"
            className="inline-block px-8 py-4 bg-primary text-primary-foreground text-sm tracking-wider uppercase"
          >
            Browse All Categories
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Category Hero */}
      <div className="relative h-64 lg:h-80 overflow-hidden">
        <Image
          src={category.image_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80"}
          alt={category.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          <h1 className="text-4xl lg:text-6xl font-serif text-center mb-4">{category.name}</h1>
          {category.description && (
            <p className="text-lg text-white/80 text-center max-w-xl">{category.description}</p>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
              Shop
            </Link>
            <span className="text-muted-foreground">/</span>
            <span>{category.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-border text-sm"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
            <p className="text-sm text-muted-foreground hidden sm:block">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-border bg-background text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

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
        </div>

        {/* Mobile Filters Drawer */}
        {showFilters && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-serif text-lg">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="p-4 space-y-6">
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider mb-4">Price Range</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={selectedPriceRange.min}
                    onChange={(e) => setSelectedPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                    className="w-24 px-3 py-2 border border-border bg-background text-sm"
                    placeholder="Min"
                  />
                  <span className="text-muted-foreground">to</span>
                  <input
                    type="number"
                    value={selectedPriceRange.max}
                    onChange={(e) => setSelectedPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                    className="w-24 px-3 py-2 border border-border bg-background text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="w-full py-4 bg-primary text-primary-foreground text-sm tracking-wider uppercase"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block space-y-8">
            <Link 
              href="/categories"
              className="flex items-center gap-2 text-sm hover:opacity-60 transition-opacity"
            >
              <ChevronLeft size={16} />
              Back to All Products
            </Link>

            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider mb-4">Price Range</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={selectedPriceRange.min}
                    onChange={(e) => setSelectedPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-border bg-background text-sm"
                    placeholder="Min"
                  />
                  <span className="text-muted-foreground">-</span>
                  <input
                    type="number"
                    value={selectedPriceRange.max}
                    onChange={(e) => setSelectedPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-border bg-background text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Products */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <h2 className="text-2xl font-serif mb-4">No products found</h2>
                <p className="text-muted-foreground mb-8">
                  Try adjusting your filters
                </p>
                <button
                  onClick={() => setSelectedPriceRange(priceRange)}
                  className="px-8 py-4 bg-primary text-primary-foreground text-sm tracking-wider uppercase"
                >
                  Clear Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {filteredProducts.map((product) => {
                  const firstImage = product.product_images?.[0]?.image_url
                  const price = getPriceForCurrency(product, currency)
                  return (
                    <Link key={product.id} href={`/products/${product.id}`} className="group">
                      <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-secondary">
                        <Image
                          src={firstImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          {category.name}
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
                {filteredProducts.map((product) => {
                  const firstImage = product.product_images?.[0]?.image_url
                  const price = getPriceForCurrency(product, currency)
                  return (
                    <Link key={product.id} href={`/products/${product.id}`} className="group flex gap-6">
                      <div className="relative w-32 h-40 flex-shrink-0 overflow-hidden bg-secondary">
                        <Image
                          src={firstImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-1 py-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          {category.name}
                        </p>
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
        </div>
      </div>

      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" />
    </main>
  )
}

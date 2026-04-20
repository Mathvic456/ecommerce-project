"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"
import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/categories"
import { ShoppingBag, ChevronLeft, ChevronRight, Minus, Plus, Check, Truck, Shield, RotateCcw } from "lucide-react"
import { formatPrice, getCurrencyFromStorage, type Currency, getPriceForCurrency } from "@/lib/currency"

interface ProductImage {
  id: string
  image_url: string
  display_order: number
}

interface ProductWithImages extends Product {
  product_images?: ProductImage[]
  categories?: { name: string }
}

export default function ProductDetailPage() {
  const [product, setProduct] = useState<ProductWithImages | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState<Currency>("NGN")
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<ProductWithImages[]>([])
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const supabase = createClient()

  useEffect(() => {
    const fetchProduct = async () => {
      const { data: productData } = await supabase
        .from("products")
        .select("*, product_images(*), categories(name)")
        .eq("id", productId)
        .single()

      const { data } = await supabase.auth.getUser()
      setUser(data?.user || null)
      setCurrency(getCurrencyFromStorage())

      setProduct((productData as ProductWithImages) || null)

      // Fetch related products
      if (productData?.category_id) {
        const { data: related } = await supabase
          .from("products")
          .select("*, product_images(*), categories(name)")
          .eq("category_id", productData.category_id)
          .neq("id", productId)
          .limit(4)
        setRelatedProducts((related as ProductWithImages[]) || [])
      }

      setLoading(false)
    }

    fetchProduct()

    const handleStorageChange = () => {
      setCurrency(getCurrencyFromStorage())
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [supabase, productId])

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (!product) return

    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .single()

    if (existing) {
      await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id)
    } else {
      await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: product.id,
        quantity,
      })
    }

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-[3/4] bg-muted animate-pulse" />
            <div className="space-y-6">
              <div className="h-8 w-32 bg-muted animate-pulse" />
              <div className="h-12 w-3/4 bg-muted animate-pulse" />
              <div className="h-6 w-24 bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-serif mb-4">Product not found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist</p>
          <Link 
            href="/categories"
            className="inline-block px-8 py-4 bg-primary text-primary-foreground text-sm tracking-wider uppercase"
          >
            Continue Shopping
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const images = (product.product_images || []).sort((a, b) => a.display_order - b.display_order)
  const price = getPriceForCurrency(product, currency)
  const currentImage = images[selectedImageIndex]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

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
            {product.categories?.name && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">{product.categories.name}</span>
              </>
            )}
            <span className="text-muted-foreground">/</span>
            <span className="truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[3/4] bg-secondary overflow-hidden">
              {currentImage ? (
                <Image
                  src={currentImage.image_url || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}

              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 flex items-center justify-center hover:bg-background transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 flex items-center justify-center hover:bg-background transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 overflow-hidden transition-opacity ${
                      idx === selectedImageIndex ? "opacity-100 ring-2 ring-foreground" : "opacity-50 hover:opacity-75"
                    }`}
                  >
                    <Image
                      src={img.image_url || "/placeholder.svg"}
                      alt={`${product.name} ${idx + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="lg:sticky lg:top-40 lg:self-start space-y-6">
            {/* Category & Name */}
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                {product.categories?.name || "LuxuryByEsta"}
              </p>
              <h1 className="text-3xl lg:text-4xl font-serif mb-4">{product.name}</h1>
              <p className="text-2xl">{formatPrice(price, currency)}</p>
            </div>

            {/* Description */}
            <div className="border-t border-border pt-6">
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity Selector */}
            <div className="border-t border-border pt-6">
              <p className="text-sm uppercase tracking-wider mb-4">Quantity</p>
              <div className="flex items-center border border-border w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="w-16 h-12 flex items-center justify-center border-x border-border font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-4 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={addedToCart}
                className={`w-full py-4 flex items-center justify-center gap-3 text-sm tracking-wider uppercase transition-colors ${
                  addedToCart 
                    ? "bg-green-600 text-white" 
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check size={18} />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    Add to Cart
                  </>
                )}
              </button>

              <Link
                href="/cart"
                className="block w-full py-4 border border-border text-center text-sm tracking-wider uppercase hover:bg-secondary transition-colors"
              >
                View Cart
              </Link>
            </div>

            {/* Product Features */}
            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex items-center gap-4">
                <Truck size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">On orders over ₦50,000</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <RotateCcw size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">30-Day Returns</p>
                  <p className="text-xs text-muted-foreground">Hassle-free returns</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Shield size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Secure Checkout</p>
                  <p className="text-xs text-muted-foreground">Powered by Stripe</p>
                </div>
              </div>
            </div>

            {/* SKU */}
            <div className="border-t border-border pt-6">
              <p className="text-xs text-muted-foreground">
                SKU: {product.id.slice(0, 12).toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 lg:mt-32">
            <h2 className="text-2xl lg:text-3xl font-serif mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((item) => {
                const firstImage = item.product_images?.[0]?.image_url
                const itemPrice = getPriceForCurrency(item, currency)
                return (
                  <Link key={item.id} href={`/products/${item.id}`} className="group">
                    <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-secondary">
                      <Image
                        src={firstImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {item.categories?.name || "LuxuryByEsta"}
                      </p>
                      <h3 className="font-medium group-hover:opacity-60 transition-opacity line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-sm">{formatPrice(itemPrice, currency)}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>

      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" />
    </main>
  )
}

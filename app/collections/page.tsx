"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"
import { createClient } from "@/lib/supabase/client"
import { ArrowRight } from "lucide-react"

interface Category {
  id: string
  name: string
  description: string
  image_url: string
  product_count?: number
}

export default function CollectionsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchCategories = async () => {
      // Fetch categories with product count
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .order("name")

      if (categoriesData) {
        // Get product count for each category
        const categoriesWithCount = await Promise.all(
          categoriesData.map(async (category) => {
            const { count } = await supabase
              .from("products")
              .select("*", { count: "exact", head: true })
              .eq("category_id", category.id)
            return { ...category, product_count: count || 0 }
          })
        )
        setCategories(categoriesWithCount)
      }
      setLoading(false)
    }

    fetchCategories()
  }, [supabase])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Page Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
          <h1 className="text-3xl lg:text-5xl font-serif text-center mb-4">Our Collections</h1>
          <p className="text-muted-foreground text-center max-w-xl mx-auto">
            Browse our carefully curated collections of premium products
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-muted mb-4" />
                <div className="h-6 w-32 bg-muted mb-2" />
                <div className="h-4 w-48 bg-muted" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-serif mb-4">No collections available</h2>
            <p className="text-muted-foreground mb-8">Check back soon for new collections</p>
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-primary text-primary-foreground text-sm tracking-wider uppercase"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/categories/${category.id}`}
                className="group block"
              >
                <div className="relative aspect-[4/3] overflow-hidden mb-4 bg-secondary">
                  <Image
                    src={category.image_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  
                  {/* Category Label */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                    <h2 className="text-xl lg:text-2xl font-serif text-white mb-1">
                      {category.name}
                    </h2>
                    <p className="text-white/80 text-sm">
                      {category.product_count} {category.product_count === 1 ? "product" : "products"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground line-clamp-1 flex-1">
                    {category.description || "Explore this collection"}
                  </p>
                  <ArrowRight 
                    size={20} 
                    className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all flex-shrink-0 ml-4" 
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" />
    </main>
  )
}

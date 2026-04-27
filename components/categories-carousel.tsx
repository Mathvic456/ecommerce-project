"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface Category {
  id: string
  name: string
  image_url: string
}

export function CategoriesCarousel() {
  const [categories, setCategories] = useState<Category[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await supabase.from("categories").select("*").limit(6)
        setCategories(data || [])
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [supabase])

  const itemsPerView = typeof window !== "undefined" && window.innerWidth >= 1024 ? 3 : 1
  const maxIndex = Math.max(0, categories.length - itemsPerView)

  const handleNext = () => {
    setCurrentIndex(Math.min(currentIndex + 1, maxIndex))
  }

  const handlePrev = () => {
    setCurrentIndex(Math.max(currentIndex - 1, 0))
  }

  if (loading) {
    return <div className="h-96 bg-secondary rounded-lg animate-pulse" />
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex gap-6 transition-transform duration-300"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
          }}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="flex-shrink-0 w-full lg:w-1/3 group cursor-pointer"
            >
              <div className="relative h-80 bg-secondary rounded-lg overflow-hidden">
                <Image
                  src={category.image_url || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-end p-6">
                  <h3 className="text-white text-2xl font-bold text-balance">{category.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {maxIndex > 0 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-background"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={20} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-background"
            onClick={handleNext}
            disabled={currentIndex === maxIndex}
          >
            <ChevronRight size={20} />
          </Button>
        </>
      )}
    </div>
  )
}

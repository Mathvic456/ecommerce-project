"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { Currency } from "@/lib/currency"

interface Category {
  id: string
  name: string
}

interface FilterProps {
  categories: Category[]
  priceRange: { min: number; max: number }
  selectedCategories: string[]
  selectedPriceRange: { min: number; max: number }
  currency: Currency
  onCategoryChange: (categoryId: string, checked: boolean) => void
  onPriceRangeChange: (min: number, max: number) => void
}

export function ProductFilters({
  categories,
  priceRange,
  selectedCategories,
  selectedPriceRange,
  currency,
  onCategoryChange,
  onPriceRangeChange,
}: FilterProps) {
  const currencySymbols: Record<Currency, string> = {
    USD: "$",
    GBP: "£",
    EUR: "€",
  }

  return (
    <div className="space-y-4">
      {/* Categories Filter */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) => onCategoryChange(category.id, checked as boolean)}
                />
                <label htmlFor={`category-${category.id}`} className="text-sm cursor-pointer hover:text-foreground/80">
                  {category.name}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Price Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Min Price</label>
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={selectedPriceRange.min}
              onChange={(e) => {
                const newMin = Number(e.target.value)
                if (newMin <= selectedPriceRange.max) {
                  onPriceRangeChange(newMin, selectedPriceRange.max)
                }
              }}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground">
              {currencySymbols[currency]}
              {selectedPriceRange.min}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Max Price</label>
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={selectedPriceRange.max}
              onChange={(e) => {
                const newMax = Number(e.target.value)
                if (newMax >= selectedPriceRange.min) {
                  onPriceRangeChange(selectedPriceRange.min, newMax)
                }
              }}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground">
              {currencySymbols[currency]}
              {selectedPriceRange.max}
            </div>
          </div>

          <button
            onClick={() => onPriceRangeChange(priceRange.min, priceRange.max)}
            className="w-full text-sm text-blue-600 hover:text-blue-700"
          >
            Reset
          </button>
        </CardContent>
      </Card>
    </div>
  )
}

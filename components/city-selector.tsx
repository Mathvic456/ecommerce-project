"use client"

import { useState, useEffect, useRef } from "react"
import { Search, ChevronDown, Loader2 } from "lucide-react"

interface CitySelectorProps {
  countryName: string
  selectedCity: string
  onSelect: (city: string) => void
  disabled?: boolean
}

export function CitySelector({ countryName, selectedCity, onSelect, disabled }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!countryName) {
      setCities([])
      return
    }

    const fetchCities = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("https://countriesnow.space/api/v0.1/countries/cities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: countryName }),
        })

        const result = await response.json()
        if (result.error) {
          throw new Error(result.msg || "Failed to fetch cities")
        }
        setCities(result.data || [])
      } catch (err) {
        console.error("City fetch error:", err)
        setError("Could not load cities. You can type manually.")
        // Fallback: If API fails, we could potentially allow manual entry
      } finally {
        setLoading(false)
      }
    }

    fetchCities()
  }, [countryName])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 100) // Limit to 100 for performance

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className={`flex items-center justify-between h-12 px-4 border border-border bg-background cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-foreground/50"
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`text-sm ${!selectedCity ? "text-muted-foreground" : ""}`}>
          {loading ? "Loading cities..." : selectedCity || "Select city"}
        </span>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 z-50 w-full mt-1 bg-background border border-border shadow-lg rounded-md overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city..."
                className="w-full h-9 pl-8 pr-3 text-sm bg-muted/50 rounded-md focus:outline-none focus:ring-1 focus:ring-foreground"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {error ? (
              <div className="p-3 text-sm text-destructive text-center">{error}</div>
            ) : filteredCities.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground text-center">No cities found</div>
            ) : (
              filteredCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    onSelect(city)
                    setIsOpen(false)
                    setSearchQuery("")
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors ${
                    selectedCity === city ? "bg-muted" : ""
                  }`}
                >
                  {city}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

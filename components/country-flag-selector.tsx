"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { type CountryData } from "@/lib/countries"
import { ChevronDown, Search } from "lucide-react"

interface CountryFlagSelectorProps {
  countries: CountryData[]
  selectedCountry: CountryData | null
  onSelect: (countryCode: string) => void
  required?: boolean
}

export function CountryFlagSelector({ 
  countries, 
  selectedCountry, 
  onSelect,
  required 
}: CountryFlagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getFlagUrl = (countryCode: string) => {
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 h-12 px-4 w-full bg-transparent hover:bg-muted/50 transition-colors focus:outline-none"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selectedCountry ? (
          <div className="flex items-center gap-3 w-full">
            <Image
              src={getFlagUrl(selectedCountry.code) || "/placeholder.svg"}
              alt={selectedCountry.name}
              width={24}
              height={16}
              className="rounded-sm object-cover flex-shrink-0"
              unoptimized
            />
            <span className="text-sm font-medium truncate flex-1 text-left">
              {selectedCountry.name} ({selectedCountry.code})
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground">Select Country</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </button>

      {/* Hidden input for form validation */}
      {required && (
        <input
          type="hidden"
          name="country"
          value={selectedCountry?.code || ""}
          required
        />
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 max-h-80 bg-background border border-border rounded-md shadow-lg z-50 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search countries..."
                className="w-full h-9 pl-8 pr-3 text-sm bg-muted/50 rounded-md focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
          </div>

          {/* Country List */}
          <div className="overflow-y-auto max-h-60">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground text-center">
                No countries found
              </div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onSelect(country.code)
                    setIsOpen(false)
                    setSearchQuery("")
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors ${
                    selectedCountry?.code === country.code ? "bg-muted" : ""
                  }`}
                >
                  <Image
                    src={getFlagUrl(country.code) || "/placeholder.svg"}
                    alt={country.name}
                    width={24}
                    height={16}
                    className="rounded-sm object-cover flex-shrink-0"
                    unoptimized
                  />
                  <span className="text-sm flex-1 truncate">{country.name} ({country.code})</span>
                  <span className="text-xs text-muted-foreground">{country.dialCode}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

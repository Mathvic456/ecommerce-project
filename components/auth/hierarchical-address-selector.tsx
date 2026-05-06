"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CountryFlagSelector } from "@/components/country-flag-selector"
import { 
  getAllCountries,
  getStatesOfCountry,
  getCitiesOfState,
  type CountryData, 
  type StateData, 
  type CityData
} from "@/lib/locations"
import { City } from 'country-state-city'

interface HierarchicalAddressSelectorProps {
  selectedCountry: CountryData | null
  selectedState: StateData | null
  selectedCity: CityData | null
  streetAddress: string
  postalCode: string
  onCountryChange: (country: CountryData | null) => void
  onStateChange: (state: StateData | null) => void
  onCityChange: (city: CityData | null) => void
  onStreetChange: (street: string) => void
  onPostalCodeChange: (postalCode: string) => void
  errors?: Record<string, string>
}

export function HierarchicalAddressSelector({
  selectedCountry,
  selectedState,
  selectedCity,
  streetAddress,
  postalCode,
  onCountryChange,
  onStateChange,
  onCityChange,
  onStreetChange,
  onPostalCodeChange,
  errors = {}
}: HierarchicalAddressSelectorProps) {
  const [states, setStates] = useState<StateData[]>([])
  const [cities, setCities] = useState<CityData[]>([])

  // Update states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const countryStates = getStatesOfCountry(selectedCountry.isoCode)
      setStates(countryStates)
      setCities([])
    } else {
      setStates([])
      setCities([])
    }
  }, [selectedCountry])

  // Update cities when state changes OR when country changes (for countries without states)
  useEffect(() => {
    if (selectedCountry && selectedState) {
      // Get cities for the selected state
      const stateCities = getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode)
      setCities(stateCities)
    } else if (selectedCountry && states.length === 0) {
      // For countries without states, get all cities in the country
      const countryCities = City.getCitiesOfCountry(selectedCountry.isoCode)
      setCities(countryCities)
    } else {
      setCities([])
    }
  }, [selectedCountry, selectedState, states.length])

  const handleCountrySelect = (countryCode: string) => {
    const countries = getAllCountries()
    const country = countries.find(c => c.isoCode === countryCode) || null
    onCountryChange(country)
  }

  const handleStateSelect = (stateCode: string) => {
    const state = states.find(s => s.isoCode === stateCode) || null
    onStateChange(state)
  }

  const handleCitySelect = (cityName: string) => {
    const city = cities.find(c => c.name === cityName) || null
    onCityChange(city)
  }

  return (
    <div className="space-y-4">
      {/* Country Selection */}
      <div className="space-y-2">
        <Label htmlFor="country" className="text-xs uppercase tracking-wider text-muted-foreground">
          Country
        </Label>
        <div className="w-full border border-border bg-background">
          <CountryFlagSelector
            countries={getAllCountries() as any}
            selectedCountry={selectedCountry as any}
            onSelect={handleCountrySelect}
            required
          />
        </div>
        {errors.country && <p className="text-xs text-destructive">{errors.country}</p>}
      </div>

      {/* State Selection - only show if country has states */}
      {selectedCountry && states.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="state" className="text-xs uppercase tracking-wider text-muted-foreground">
            State/Region
          </Label>
          <select
            id="state"
            value={selectedState?.isoCode || ""}
            onChange={(e) => handleStateSelect(e.target.value)}
            className="h-12 w-full border border-border bg-background text-sm px-3 focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
            required
          >
            <option value="">Select a state/region</option>
            {states.map((state) => (
              <option key={state.isoCode} value={state.isoCode}>
                {state.name}
              </option>
            ))}
          </select>
          {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
        </div>
      )}

      {/* City Selection - show if state is selected OR if country has no states */}
      {selectedCountry && (states.length === 0 || selectedState) && cities.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="city" className="text-xs uppercase tracking-wider text-muted-foreground">
            City
          </Label>
          <select
            id="city"
            value={selectedCity?.name || ""}
            onChange={(e) => handleCitySelect(e.target.value)}
            className="h-12 w-full border border-border bg-background text-sm px-3 focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
            required
          >
            <option value="">Select a city</option>
            {cities.map((city, index) => (
              <option key={`${city.name}-${index}`} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
          {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
        </div>
      )}

      {/* Street Address - show after city is selected OR if no cities available */}
      {selectedCountry && (selectedCity || (cities.length === 0 && (states.length === 0 || selectedState))) && (
        <div className="space-y-2">
          <Label htmlFor="street" className="text-xs uppercase tracking-wider text-muted-foreground">
            Street Address
          </Label>
          <Input
            id="street"
            type="text"
            placeholder="Enter street address"
            value={streetAddress}
            onChange={(e) => onStreetChange(e.target.value)}
            className="h-12 border border-border bg-background"
            required
          />
          {errors.street && <p className="text-xs text-destructive">{errors.street}</p>}
        </div>
      )}

      {/* Postal Code Input - show after street address */}
      {selectedCountry && streetAddress && (
        <div className="space-y-2">
          <Label htmlFor="postalCode" className="text-xs uppercase tracking-wider text-muted-foreground">
            Postal Code
          </Label>
          <Input
            id="postalCode"
            type="text"
            placeholder="Enter postal code"
            value={postalCode}
            onChange={(e) => onPostalCodeChange(e.target.value)}
            className="h-12 border border-border bg-background"
            required
          />
          {errors.postalCode && <p className="text-xs text-destructive">{errors.postalCode}</p>}
        </div>
      )}

      {/* Address Summary Preview */}
      {selectedCountry && (
        <div className="mt-4 p-3 border border-border rounded bg-secondary/30">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Address Preview</p>
          <p className="text-sm">
            {[
              streetAddress,
              selectedCity?.name,
              selectedState?.name,
              selectedCountry?.name,
              postalCode
            ]
              .filter(Boolean)
              .join(", ") || "Start by selecting your country"}
          </p>
        </div>
      )}
    </div>
  )
}
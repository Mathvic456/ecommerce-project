"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { addUserAddress, deleteUserAddress, updateUserAddress, getUserAddresses } from "@/app/actions/user-profile"
import { countries, type CountryData, getCountryByName } from "@/lib/countries"
import Image from "next/image"
import { ChevronDown, Search, Plus, Loader2 } from "lucide-react"

interface AddressManagerProps {
  addresses: any[]
  onUpdate?: () => Promise<void> | void
}

export function AddressManager({ addresses, onUpdate }: AddressManagerProps) {
  const [localAddresses, setLocalAddresses] = useState<any[]>(addresses)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null)
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")
  const countryDropdownRef = useRef<HTMLDivElement>(null)

  // Sync local addresses with props when they change
  // Also deduplicate to prevent showing the same address twice
  useEffect(() => {
    const seen = new Set<string>()
    const deduplicatedAddresses = addresses.filter((address) => {
      const key = `${address.street_address}-${address.city}-${address.country}`
      if (seen.has(key)) {
        console.log("[v0] Filtering out duplicate address in component:", key)
        return false
      }
      seen.add(key)
      return true
    })
    setLocalAddresses(deduplicatedAddresses)
  }, [addresses])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false)
        setCountrySearch("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const [formData, setFormData] = useState({
    streetAddress: "",
    city: "",
    postalCode: "",
    isDefault: false,
  })

  const getFlagUrl = (countryCode: string) => {
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`
  }

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.toLowerCase().includes(countrySearch.toLowerCase())
  )

  // Update postal code when country changes
  const handleCountrySelect = (country: CountryData) => {
    setSelectedCountry(country)
    setIsCountryDropdownOpen(false)
    setCountrySearch("")
    // Set postal code placeholder as the default value
    if (country?.postalCodePlaceholder) {
      setFormData(prev => ({ ...prev, postalCode: country.postalCodePlaceholder || "" }))
    }
  }

  const resetForm = () => {
    setFormData({
      streetAddress: "",
      city: "",
      postalCode: "",
      isDefault: false,
    })
    setSelectedCountry(null)
    setEditingId(null)
    setShowForm(false)
    setIsCountryDropdownOpen(false)
    setCountrySearch("")
    setMessage(null)
  }

  const refreshAddresses = async () => {
    try {
      const updatedAddresses = await getUserAddresses()
      setLocalAddresses(updatedAddresses)
      await onUpdate?.()
    } catch (error) {
      console.error("Failed to refresh addresses:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!selectedCountry) {
      setMessage({ type: "error", text: "Please select a country" })
      return
    }

    if (!formData.streetAddress.trim()) {
      setMessage({ type: "error", text: "Please enter a street address" })
      return
    }

    if (!formData.city.trim()) {
      setMessage({ type: "error", text: "Please enter a city" })
      return
    }

    setIsLoading(true)
    console.log("[v0] Saving address:", { ...formData, country: selectedCountry.name })

    try {
      if (editingId) {
        console.log("[v0] Updating address:", editingId)
        await updateUserAddress(
          editingId,
          formData.streetAddress,
          formData.city,
          selectedCountry.name,
          formData.postalCode,
          formData.isDefault,
        )
        setMessage({ type: "success", text: "Address updated successfully!" })
      } else {
        console.log("[v0] Adding new address")
        const result = await addUserAddress(
          formData.streetAddress,
          formData.city,
          selectedCountry.name,
          formData.postalCode,
          formData.isDefault,
        )
        console.log("[v0] Address added:", result)
        setMessage({ type: "success", text: "Address added successfully!" })
      }
      
      // Refresh the addresses list
      console.log("[v0] Refreshing addresses...")
      await refreshAddresses()
      
      // Reset form after successful save
      setFormData({
        streetAddress: "",
        city: "",
        postalCode: "",
        isDefault: false,
      })
      setSelectedCountry(null)
      setEditingId(null)
      setShowForm(false)
      setIsCountryDropdownOpen(false)
      setCountrySearch("")
    } catch (error) {
      console.log("[v0] Error saving address:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save address",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return

    setIsLoading(true)
    try {
      await deleteUserAddress(id)
      setMessage({ type: "success", text: "Address deleted successfully!" })
      await refreshAddresses()
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to delete address",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Address List */}
      <div className="space-y-4">
        {localAddresses.length === 0 && !showForm && (
          <p className="text-muted-foreground text-center py-8">No addresses saved yet. Add your first address below.</p>
        )}
        {localAddresses.map((address) => (
          <Card key={address.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{address.street_address}</CardTitle>
                  <CardDescription>
                    {address.city}, {address.country} {address.postal_code}
                  </CardDescription>
                </div>
                {address.is_default && (
                  <span className="text-xs font-semibold bg-primary text-primary-foreground px-2 py-1 rounded">
                    Default
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-transparent"
                  onClick={() => {
                    // Find the country by name and set it
                    const country = getCountryByName(address.country)
                    setSelectedCountry(country || null)
                    setFormData({
                      streetAddress: address.street_address,
                      city: address.city,
                      postalCode: address.postal_code || country?.postalCodePlaceholder || "",
                      isDefault: address.is_default,
                    })
                    setEditingId(address.id)
                    setShowForm(true)
                  }}
                >
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(address.id)} disabled={isLoading}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Address" : "Add New Address"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="streetAddress">Street Address</Label>
                <Input
                  id="streetAddress"
                  value={formData.streetAddress}
                  onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                  placeholder="123 Main St"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="country">Country *</Label>
                <div className="relative" ref={countryDropdownRef}>
                  {/* Country Dropdown Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="w-full flex items-center justify-between h-10 px-3 border border-input rounded-md bg-background hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {selectedCountry ? (
                        <>
                          <Image
                            src={getFlagUrl(selectedCountry.code) || "/placeholder.svg"}
                            alt={selectedCountry.name}
                            width={24}
                            height={16}
                            className="rounded-sm object-cover"
                            unoptimized
                          />
                          <span className="text-sm">{selectedCountry.name}</span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">Select a country</span>
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Country Dropdown Menu */}
                  {isCountryDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-64 overflow-hidden">
                      {/* Search Input */}
                      <div className="p-2 border-b border-border">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder="Search countries..."
                            className="w-full h-9 pl-8 pr-3 text-sm bg-muted/50 rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Country List */}
                      <div className="overflow-y-auto max-h-48">
                        {filteredCountries.length === 0 ? (
                          <div className="p-3 text-sm text-muted-foreground text-center">
                            No countries found
                          </div>
                        ) : (
                          filteredCountries.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => handleCountrySelect(country)}
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
                              <span className="text-sm flex-1 truncate">{country.name}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="New York"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    readOnly
                    disabled
                    className="bg-muted"
                    placeholder={selectedCountry?.postalCodePlaceholder || "Select country first"}
                  />
                  <p className="text-xs text-muted-foreground">Auto-filled based on country</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isDefault" className="font-normal">
                  Set as default address
                </Label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isLoading || !selectedCountry} className="min-w-32">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Address"
                  )}
                </Button>
                <Button type="button" variant="outline" className="bg-transparent" onClick={resetForm} disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Address
        </Button>
      )}
    </div>
  )
}

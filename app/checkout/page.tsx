"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { MobileNav } from "@/components/mobile-nav"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { CartItem, Product } from "@/lib/products"
import { createCheckoutSession } from "@/app/actions/checkout"
import { formatPrice, type Currency, getCurrencyFromStorage, getPriceForCurrency } from "@/lib/currency"
import { getUserAddresses, addUserAddress } from "@/app/actions/user-profile"
import { ChevronLeft, Lock, MapPin, Plus, Check, CreditCard, Loader2, Truck } from "lucide-react"
import { countries, type CountryData } from "@/lib/countries"
import { CountryFlagSelector } from "@/components/country-flag-selector"
import { CitySelector } from "@/components/city-selector"
import { shippingOptions, calculateShippingCost } from "@/lib/shipping"

interface ProductImage {
  id: string
  image_url: string
  display_order: number
}

interface ProductWithImages extends Product {
  product_images?: ProductImage[]
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<(CartItem & { products?: ProductWithImages })[]>([])
  const [user, setUser] = useState<any>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [email, setEmail] = useState("")
  const [currency, setCurrency] = useState<Currency>("NGN")
  const [error, setError] = useState<string | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null)
  const [newAddress, setNewAddress] = useState({
    streetAddress: "",
    city: "",
    postalCode: "",
  })
  const [selectedShippingId, setSelectedShippingId] = useState<string>("standard")
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        router.push("/auth/login")
        return
      }

      setUser(data.user)
      setEmail(data.user.email || "")
      setCurrency(getCurrencyFromStorage())

      const { data: items } = await supabase
        .from("cart_items")
        .select(`
          id,
          user_id,
          product_id,
          quantity,
          created_at,
          updated_at,
          products:product_id (*, product_images(*))
        `)
        .eq("user_id", data.user.id)

      setCartItems(items || [])

      const userAddresses = await getUserAddresses()
      setAddresses(userAddresses)
      const defaultAddress = userAddresses.find((a) => a.is_default)
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id)
      }

      setLoading(false)
    }

    fetchData()

    const handleStorageChange = () => {
      setCurrency(getCurrencyFromStorage())
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [supabase, router])

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode)
    setSelectedCountry(country || null)
    if (country?.postalCodePlaceholder) {
      setNewAddress(prev => ({ 
        ...prev, 
        postalCode: country.postalCodePlaceholder || "",
        city: "" // Reset city on country change
      }))
    }
  }

  const subtotalAmount = cartItems.reduce((sum, item) => {
    const price = getPriceForCurrency(item.products || {}, currency) || 0
    return sum + price * item.quantity
  }, 0)

  const shippingCost = calculateShippingCost(selectedShippingId, subtotalAmount, currency)
  const totalAmount = subtotalAmount + shippingCost

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedCountry) {
      setError("Please select a country")
      return
    }

    try {
      await addUserAddress(
        newAddress.streetAddress, 
        newAddress.city, 
        selectedCountry.name, 
        newAddress.postalCode, 
        true
      )
      const updatedAddresses = await getUserAddresses()
      setAddresses(updatedAddresses)
      setNewAddress({ streetAddress: "", city: "", postalCode: "" })
      setSelectedCountry(null)
      setShowAddressForm(false)

      const newDefault = updatedAddresses.find((a) => a.is_default)
      if (newDefault) {
        setSelectedAddressId(newDefault.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add address")
    }
  }

  const handleCheckout = async () => {
    setError(null)

    if (!user || cartItems.length === 0) {
      setError("Cart is empty or user not authenticated")
      return
    }

    if (!email) {
      setError("Please enter a valid email address")
      return
    }

    if (!selectedAddressId) {
      setError("Please select or add a delivery address")
      return
    }

    setProcessing(true)

    try {
      const result = await createCheckoutSession(cartItems, email, user.id, currency, selectedAddressId || undefined, selectedShippingId)

      if (!result.success) {
        setError(result.error || "Checkout failed. Please try again.")
        setProcessing(false)
        return
      }

      if (result.sessionUrl) {
        window.location.href = result.sessionUrl
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      console.error("Checkout error:", err)
      setError(errorMessage)
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-muted-foreground" />
          </div>
        </div>
      </main>
    )
  }

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-serif mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Add some items to your cart to checkout</p>
          <Link
            href="/categories"
            className="inline-block px-8 py-4 bg-primary text-primary-foreground text-sm tracking-wider uppercase"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        {/* Back Link */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm mb-8 hover:opacity-60 transition-opacity"
        >
          <ChevronLeft size={16} />
          Back to Cart
        </Link>

        <h1 className="text-3xl lg:text-4xl font-serif mb-8 lg:mb-12">Checkout</h1>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 text-destructive">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left Column - Forms */}
          <div className="space-y-8">
            {/* Email Section */}
            <section>
              <h2 className="text-sm font-medium uppercase tracking-wider mb-4">Contact Information</h2>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-4 py-3 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </section>

            {/* Delivery Address Section */}
            <section>
              <h2 className="text-sm font-medium uppercase tracking-wider mb-4">Delivery Address</h2>
              
              {addresses.length > 0 && (
                <div className="space-y-3 mb-4">
                  {addresses.map((address) => (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => setSelectedAddressId(address.id)}
                      className={`w-full flex items-start gap-4 p-4 border text-left transition-colors ${
                        selectedAddressId === address.id 
                          ? "border-foreground bg-secondary" 
                          : "border-border hover:border-foreground/50"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        selectedAddressId === address.id 
                          ? "border-foreground bg-foreground" 
                          : "border-border"
                      }`}>
                        {selectedAddressId === address.id && (
                          <Check size={12} className="text-background" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{address.street_address}</p>
                        <p className="text-sm text-muted-foreground">
                          {address.city}, {address.country} {address.postal_code}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {showAddressForm ? (
                <form onSubmit={handleAddAddress} className="space-y-4 p-4 border border-border">
                  <input
                    type="text"
                    value={newAddress.streetAddress}
                    onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                    placeholder="Street address"
                    className="w-full px-4 py-3 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                  
                  {/* Country Selector */}
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Country</label>
                    <div className="w-full border border-border bg-background">
                      <CountryFlagSelector
                        countries={countries}
                        selectedCountry={selectedCountry}
                        onSelect={handleCountryChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <CitySelector
                      countryName={selectedCountry?.name || ""}
                      selectedCity={newAddress.city}
                      onSelect={(city) => setNewAddress({ ...newAddress, city })}
                      disabled={!selectedCountry}
                    />
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={newAddress.postalCode}
                        readOnly
                        disabled
                        placeholder={selectedCountry ? "Auto-filled" : "Select country"}
                        className="w-full px-4 py-3 border border-border bg-muted cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground">Auto-filled based on country</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={!selectedCountry}
                      className={`px-6 py-3 text-sm tracking-wider uppercase ${
                        selectedCountry 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false)
                        setSelectedCountry(null)
                        setNewAddress({ streetAddress: "", city: "", postalCode: "" })
                      }}
                      className="px-6 py-3 border border-border text-sm tracking-wider uppercase hover:bg-secondary transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-2 text-sm hover:opacity-60 transition-opacity"
                >
                  <Plus size={16} />
                  Add new address
                </button>
              )}
            </section>

            {/* Shipping Options Section */}
            <section>
              <h2 className="text-sm font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
                <Truck size={16} />
                Shipping Method
              </h2>
              <div className="space-y-3">
                {shippingOptions[currency]?.map((option) => {
                  const currentCost = calculateShippingCost(option.id, subtotalAmount, currency)
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedShippingId(option.id)}
                      className={`w-full flex items-start gap-4 p-4 border text-left transition-colors ${
                        selectedShippingId === option.id 
                          ? "border-foreground bg-secondary" 
                          : "border-border hover:border-foreground/50"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        selectedShippingId === option.id 
                          ? "border-foreground bg-foreground" 
                          : "border-border"
                      }`}>
                        {selectedShippingId === option.id && (
                          <Check size={12} className="text-background" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{option.name}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{option.estimatedDays}</p>
                      </div>
                      <div className="text-right flex-shrink-0 font-medium">
                        {currentCost === 0 ? "Free" : formatPrice(currentCost, currency)}
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>
            <section>
              <h2 className="text-sm font-medium uppercase tracking-wider mb-4">Payment</h2>
              <div className="p-4 border border-border bg-secondary flex items-center gap-4">
                <CreditCard size={20} />
                <div>
                  <p className="font-medium">Secure payment via Paystack</p>
                  <p className="text-sm text-muted-foreground">
                    You'll be redirected to Paystack to complete your purchase
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="lg:sticky lg:top-40 bg-secondary p-6 lg:p-8">
              <h2 className="text-lg font-serif mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 pb-6 border-b border-border">
                {cartItems.map((item) => {
                  const price = getPriceForCurrency(item.products || {}, currency) || 0
                  const firstImage = item.products?.product_images?.[0]?.image_url
                  return (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-16 h-20 flex-shrink-0 bg-background overflow-hidden">
                        <Image
                          src={firstImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"}
                          alt={item.products?.name || "Product"}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-foreground text-background text-xs flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-1">{item.products?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(price * item.quantity, currency)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Totals */}
              <div className="space-y-3 py-6 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                  <span>{formatPrice(subtotalAmount, currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost, currency)}</span>
                </div>
              </div>

              <div className="flex justify-between py-6 text-lg font-medium">
                <span>Total</span>
                <span>{formatPrice(totalAmount, currency)}</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={processing || !selectedAddressId}
                className={`w-full py-4 flex items-center justify-center gap-2 text-sm tracking-wider uppercase transition-opacity ${
                  processing || !selectedAddressId
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {processing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Pay {formatPrice(totalAmount, currency)}
                  </>
                )}
              </button>

              {!selectedAddressId && (
                <p className="mt-4 text-xs text-center text-muted-foreground">
                  Please select or add a delivery address to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <MobileNav />
      <div className="h-16 lg:hidden" />
    </main>
  )
}

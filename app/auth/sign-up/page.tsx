"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import Link from "next/link"
import { useState, useEffect } from "react"
import { saveUserProfile } from "@/app/actions/user-profile"
import { validateSignupForm, validateProfileForm } from "@/lib/validation"
import { 
  getAllCountries,
  getStatesOfCountry,
  type CountryData, 
  type StateData, 
  type CityData,
  validatePhoneForCountry, 
  formatPhoneWithCountryCode,
  getPhoneValidationInfo
} from "@/lib/locations"
import { CountryFlagSelector } from "@/components/country-flag-selector"
import { HierarchicalAddressSelector } from "@/components/auth/hierarchical-address-selector"

export default function SignUpPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  
  // Hierarchical address state
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null)
  const [selectedState, setSelectedState] = useState<StateData | null>(null)
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null)
  const [streetAddress, setStreetAddress] = useState("")
  const [postalCode, setPostalCode] = useState("")
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const supabase = createClient()

  // Handle country change - auto-populate postal code and reset phone
  const handleCountryChange = (countryCode: string) => {
    const countries = getAllCountries()
    const country = countries.find(c => c.isoCode === countryCode)
    setSelectedCountry(country || null)
    setSelectedState(null)
    setSelectedCity(null)
    setStreetAddress("")
    setPhoneNumber("")
    setPostalCode("")

    // Clear phone error when country changes
    if (fieldErrors.phone) {
      setFieldErrors(prev => {
        const { phone, ...rest } = prev
        return rest
      })
    }
  }

  // Handle state change
  const handleStateChange = (state: StateData | null) => {
    setSelectedState(state)
    setSelectedCity(null)
    setStreetAddress("")
  }

  // Handle city change
  const handleCityChange = (city: CityData | null) => {
    setSelectedCity(city)
    setStreetAddress("")
  }

  // Handle street change
  const handleStreetChange = (street: string) => {
    setStreetAddress(street)
  }

  // Handle postal code change
  const handlePostalCodeChange = (code: string) => {
    setPostalCode(code)
  }

  // Format phone number as user types (only digits)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, "")

    // Limit based on country max length
    if (selectedCountry) {
      const maxLength = Array.isArray(selectedCountry.phoneLength)
        ? selectedCountry.phoneLength[1]
        : selectedCountry.phoneLength
      setPhoneNumber(digitsOnly.slice(0, maxLength))
    } else {
      setPhoneNumber(digitsOnly.slice(0, 15))
    }
  }

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const validation = validateSignupForm({
      email,
      password,
      confirmPassword: repeatPassword,
    })

    if (!validation.isValid) {
      setFieldErrors(validation.errors)
      return
    }

    setIsLoading(true)

    try {
      // Use production site URL, fallback to window.location.origin for local dev
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

      console.log("[v0] SignUp - Using redirect URL:", `${siteUrl}/auth/confirm`)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/confirm`,
        },
      })

      if (error) {
        console.log("[v0] SignUp Error:", error.message)
        throw error
      }

      console.log("[v0] SignUp Success - user:", data.user?.id, "session:", !!data.session)

      // Check if email confirmation is disabled (user gets session immediately)
      if (data.session) {
        console.log("[v0] User confirmed immediately (email confirmation disabled)")
        // User is already logged in, redirect to account
        window.location.href = "/account"
        return
      }

      setStep(2)
    } catch (error: unknown) {
      setFieldErrors({ form: error instanceof Error ? error.message : "An error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    // Validate hierarchical address selection
    const validationErrors: Record<string, string> = {}
    
    if (!selectedCountry) {
      validationErrors.country = "Please select a country"
    }

    // Validate state selection if country has states
    const states = selectedCountry ? getStatesOfCountry(selectedCountry.isoCode) : []
    if (selectedCountry && states.length > 0 && !selectedState) {
      validationErrors.state = "Please select a state/region"
    }

    // Validate city selection
    if (!selectedCity) {
      validationErrors.city = "Please select a city"
    }

    // Validate street address
    if (!streetAddress.trim()) {
      validationErrors.street = "Please enter a street address"
    }

    // Validate postal code
    if (!postalCode.trim()) {
      validationErrors.postalCode = "Please enter a postal code"
    }

    // Validate phone for selected country
    if (selectedCountry) {
      const phoneError = validatePhoneForCountry(phoneNumber, selectedCountry.isoCode)
      if (phoneError) validationErrors.phone = phoneError
    } else {
      validationErrors.phone = "Please select a country first"
    }

    // Validate name fields
    if (!firstName.trim()) validationErrors.firstName = "First name is required"
    if (!lastName.trim()) validationErrors.lastName = "Last name is required"
    
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      return
    }

    setIsLoading(true)

    try {
      // Format phone with country code
      const dialCode = selectedCountry!.phonecode ? `+${selectedCountry!.phonecode}` : ""
      const fullPhoneNumber = formatPhoneWithCountryCode(phoneNumber, dialCode)

      // Store profile data in localStorage to be saved after email confirmation
      // The user is NOT authenticated until they confirm their email
      const pendingProfile = {
        firstName,
        lastName,
        phoneNumber: fullPhoneNumber,
        streetAddress: streetAddress,
        city: selectedCity!.name,
        country: selectedCountry!.name,
        state: selectedState?.name || null,
        postalCode,
        email, // Store email to match the profile to the user
      }
      localStorage.setItem("pendingUserProfile", JSON.stringify(pendingProfile))

      setShowSuccess(true)
    } catch (error: unknown) {
      setFieldErrors({ form: error instanceof Error ? error.message : "An error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light tracking-tight mb-2">Check your email</h1>
            <p className="text-muted-foreground">
              We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>
          <div className="border-t pt-6">
            <p className="text-sm text-muted-foreground text-center mb-6">
              Click the link in your email to activate your account. Don't forget to check your spam folder.
            </p>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Matthew's Mart
          </Link>
          <h1 className="text-3xl font-light tracking-tight mt-6 mb-2">
            {step === 1 ? "Create account" : "Complete profile"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {step === 1 ? "Join us to start shopping" : "Tell us about yourself"}
          </p>
        </div>

        {step === 1 && (
          <div className="mb-8">
            <OAuthButtons />
          </div>
        )}

        <form onSubmit={step === 1 ? handleStep1 : handleStep2} className="space-y-5">
          {step === 1 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`h-12 border-0 border-b rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-foreground transition-colors ${fieldErrors.email ? "border-destructive" : ""}`}
                />
                {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-12 border-0 border-b rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-foreground transition-colors ${fieldErrors.password ? "border-destructive" : ""}`}
                />
                {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="repeat-password" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Confirm Password
                </Label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className={`h-12 border-0 border-b rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-foreground transition-colors ${fieldErrors.confirmPassword ? "border-destructive" : ""}`}
                />
                {fieldErrors.confirmPassword && <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs uppercase tracking-wider text-muted-foreground">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    required
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`h-12 border-0 border-b rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-foreground transition-colors ${fieldErrors.firstName ? "border-destructive" : ""}`}
                  />
                  {fieldErrors.firstName && <p className="text-xs text-destructive">{fieldErrors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    required
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`h-12 border-0 border-b rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-foreground transition-colors ${fieldErrors.lastName ? "border-destructive" : ""}`}
                  />
                  {fieldErrors.lastName && <p className="text-xs text-destructive">{fieldErrors.lastName}</p>}
                </div>
              </div>

              {/* Phone Number with Flag Country Selector */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Phone Number
                </Label>
                <div className="flex items-center h-12 border-0 border-b border-border">
                  {/* Flag Dropdown */}
                  <CountryFlagSelector
                    countries={getAllCountries() as any}
                    selectedCountry={selectedCountry as any}
                    onSelect={handleCountryChange}
                    required
                  />

                  {/* Country Code Display */}
                  {selectedCountry && (
                    <span className="text-muted-foreground whitespace-nowrap px-2 border-r border-border text-sm">
                      +{selectedCountry.phonecode}
                    </span>
                  )}

                  {/* Phone Input */}
                  <Input
                    id="phoneNumber"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder={selectedCountry ? "Enter phone number" : "Select country first"}
                    required
                    disabled={!selectedCountry}
                    autoComplete="tel-national"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className={`h-12 border-0 rounded-none bg-transparent focus-visible:ring-0 flex-1 ${fieldErrors.phone ? "text-destructive" : ""}`}
                  />
                </div>
                {fieldErrors.country && <p className="text-xs text-destructive">{fieldErrors.country}</p>}
                {selectedCountry && (
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      const info = getPhoneValidationInfo(selectedCountry.isoCode)
                      return `${info.min}-${info.max} digits required`
                    })()}
                    {phoneNumber && ` (${phoneNumber.length} entered)`}
                  </p>
                )}
                {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
              </div>

              {/* Hierarchical Address Selector */}
              <HierarchicalAddressSelector
                selectedCountry={selectedCountry}
                selectedState={selectedState}
                selectedCity={selectedCity}
                streetAddress={streetAddress}
                postalCode={postalCode}
                onCountryChange={(country) => {
                  setSelectedCountry(country)
                  setSelectedState(null)
                  setSelectedCity(null)
                  setStreetAddress("")
                  setPhoneNumber("")
                  setPostalCode("")
                }}
                onStateChange={handleStateChange}
                onCityChange={handleCityChange}
                onStreetChange={handleStreetChange}
                onPostalCodeChange={handlePostalCodeChange}
                errors={fieldErrors}
              />
            </>
          )}

          {fieldErrors.form && (
            <p className="text-sm text-destructive text-center">{fieldErrors.form}</p>
          )}

          <Button type="submit" className="w-full h-12 mt-8" disabled={isLoading}>
            {isLoading ? "Please wait..." : step === 1 ? "Continue" : "Complete Sign Up"}
          </Button>

          {step === 2 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              disabled={isLoading}
              className="w-full h-12 bg-transparent"
            >
              Back
            </Button>
          )}

          {step === 1 && (
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-foreground hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

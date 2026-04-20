"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { saveUserProfile } from "@/app/actions/user-profile"
import { createClient } from "@/lib/supabase/client"
import { countries, type CountryData, validatePhoneForCountry, formatPhoneWithCountryCode, parsePhoneNumber } from "@/lib/countries"
import { CountryFlagSelector } from "@/components/country-flag-selector"

interface ProfileEditorProps {
  initialProfile?: {
    first_name?: string
    last_name?: string
    phone_number?: string
  } | null
  onUpdate?: (profile: any) => void
}

export function ProfileEditor({ initialProfile, onUpdate }: ProfileEditorProps) {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState(initialProfile?.first_name || "")
  const [lastName, setLastName] = useState(initialProfile?.last_name || "")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [phoneError, setPhoneError] = useState("")
  const supabase = createClient()

  // Parse existing phone number to extract country and local number
  useEffect(() => {
    if (initialProfile?.phone_number) {
      const { country, localNumber } = parsePhoneNumber(initialProfile.phone_number)
      setSelectedCountry(country)
      setPhoneNumber(localNumber)
    }
  }, [initialProfile])

  useEffect(() => {
    const fetchEmail = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user?.email) {
        setEmail(data.user.email)
      }
    }
    fetchEmail()
  }, [supabase])

  // Handle country change
  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode)
    setSelectedCountry(country || null)
    setPhoneNumber("")
    setPhoneError("")
  }

  // Handle phone input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const digitsOnly = value.replace(/\D/g, "")
    
    if (selectedCountry) {
      const maxLength = Array.isArray(selectedCountry.phoneLength) 
        ? selectedCountry.phoneLength[1] 
        : selectedCountry.phoneLength
      setPhoneNumber(digitsOnly.slice(0, maxLength))
    } else {
      setPhoneNumber(digitsOnly.slice(0, 15))
    }
    setPhoneError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setPhoneError("")

    // Validate phone if country is selected
    if (selectedCountry && phoneNumber) {
      const error = validatePhoneForCountry(phoneNumber, selectedCountry.code)
      if (error) {
        setPhoneError(error)
        return
      }
    }

    setIsLoading(true)

    try {
      // Format phone with country code
      const fullPhoneNumber = selectedCountry 
        ? formatPhoneWithCountryCode(phoneNumber, selectedCountry.dialCode)
        : phoneNumber

      await saveUserProfile(firstName, lastName, fullPhoneNumber)
      setMessage({ type: "success", text: "Profile updated successfully!" })
      onUpdate?.({ first_name: firstName, last_name: lastName, phone_number: fullPhoneNumber })
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update profile",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <Alert variant={message.type === "error" ? "destructive" : "default"}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="flex items-center h-10 border border-input rounded-md overflow-hidden">
                {/* Flag Dropdown */}
                <CountryFlagSelector
                  countries={countries}
                  selectedCountry={selectedCountry}
                  onSelect={handleCountryChange}
                />
                
                {/* Country Code Display */}
                {selectedCountry && (
                  <span className="text-muted-foreground whitespace-nowrap px-2 border-r border-input text-sm">
                    {selectedCountry.dialCode}
                  </span>
                )}
                
                {/* Phone Input */}
                <Input
                  id="phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={selectedCountry ? "Enter phone number" : "Select country first"}
                  disabled={!selectedCountry}
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="h-full border-0 rounded-none focus-visible:ring-0 flex-1"
                />
              </div>
              {selectedCountry && (
                <p className="text-xs text-muted-foreground">
                  {Array.isArray(selectedCountry.phoneLength) 
                    ? `${selectedCountry.phoneLength[0]}-${selectedCountry.phoneLength[1]} digits required`
                    : `${selectedCountry.phoneLength} digits required`}
                  {phoneNumber && ` (${phoneNumber.length} entered)`}
                </p>
              )}
              {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

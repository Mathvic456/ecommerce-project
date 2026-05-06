# Location API Quick Reference

Quick reference for using the location/address functionality in the application.

---

## 🚀 Quick Start

```typescript
import { 
  getAllCountries,
  getStatesOfCountry,
  getCitiesOfState,
  validatePhoneForCountry,
  formatPhoneWithCountryCode,
  type CountryData,
  type StateData,
  type CityData
} from "@/lib/locations"
```

---

## 📍 Get Location Data

### Get All Countries
```typescript
const countries = getAllCountries()
// Returns: ICountry[]
// Example: [{ isoCode: "US", name: "United States", phonecode: "1", ... }]
```

### Get States for a Country
```typescript
const states = getStatesOfCountry("US")
// Returns: IState[]
// Example: [{ isoCode: "CA", name: "California", countryCode: "US", ... }]
```

### Get Cities for a State
```typescript
const cities = getCitiesOfState("US", "CA")
// Returns: ICity[]
// Example: [{ name: "Los Angeles", stateCode: "CA", countryCode: "US", ... }]
```

### Get Country by Code
```typescript
const country = getCountryByCode("US")
// Returns: ICountry | undefined
```

---

## 📞 Phone Number Handling

### Validate Phone Number
```typescript
const error = validatePhoneForCountry("1234567890", "US")
// Returns: null (valid) or error message string
```

### Format Phone with Country Code
```typescript
const formatted = formatPhoneWithCountryCode("1234567890", "+1")
// Returns: "+11234567890"
```

### Get Phone Validation Info
```typescript
const info = getPhoneValidationInfo("US")
// Returns: { min: 10, max: 10 }
```

### Parse Phone Number
```typescript
const { countryCode, localNumber } = parsePhoneNumber("+11234567890")
// Returns: { countryCode: "US", localNumber: "1234567890" }
```

---

## 🏗️ Component Usage

### Hierarchical Address Selector
```tsx
import { HierarchicalAddressSelector } from "@/components/auth/hierarchical-address-selector"

<HierarchicalAddressSelector
  selectedCountry={selectedCountry}
  selectedState={selectedState}
  selectedCity={selectedCity}
  streetAddress={streetAddress}
  postalCode={postalCode}
  onCountryChange={setSelectedCountry}
  onStateChange={setSelectedState}
  onCityChange={setSelectedCity}
  onStreetChange={setStreetAddress}
  onPostalCodeChange={setPostalCode}
  errors={fieldErrors}
/>
```

### Country Flag Selector
```tsx
import { CountryFlagSelector } from "@/components/country-flag-selector"

<CountryFlagSelector
  countries={getAllCountries()}
  selectedCountry={selectedCountry}
  onSelect={(countryCode) => {
    const country = getCountryByCode(countryCode)
    setSelectedCountry(country || null)
  }}
  required
/>
```

---

## 🔑 Important Field Names

### Country Object (ICountry)
```typescript
{
  isoCode: string        // "US" (use this, not "code")
  name: string           // "United States"
  phonecode: string      // "1" (without +, use +${phonecode})
  flag: string           // "🇺🇸"
  currency: string       // "USD"
  latitude: string       // "38.00000000"
  longitude: string      // "77.00000000"
}
```

### State Object (IState)
```typescript
{
  isoCode: string        // "CA"
  name: string           // "California"
  countryCode: string    // "US"
  latitude: string       // "36.77826100"
  longitude: string      // "-119.41793240"
}
```

### City Object (ICity)
```typescript
{
  name: string           // "Los Angeles"
  stateCode: string      // "CA"
  countryCode: string    // "US"
  latitude: string       // "34.05223000"
  longitude: string      // "-118.24368000"
}
```

---

## ⚠️ Common Mistakes

### ❌ Wrong
```typescript
// Don't use .code
country.code

// Don't use .dialCode
country.dialCode

// Don't access phoneLength directly
country.phoneLength
```

### ✅ Correct
```typescript
// Use .isoCode
country.isoCode

// Use +${phonecode}
`+${country.phonecode}`

// Use helper function
getPhoneValidationInfo(country.isoCode)
```

---

## 💡 Tips

1. **Always use `isoCode`** for country/state identification
2. **Phone codes need `+` prefix**: Use `+${country.phonecode}`
3. **No street data**: Users must enter street addresses manually
4. **No postal code auto-fill**: Users must enter postal codes manually
5. **Check for states**: Not all countries have states, check `states.length > 0`

---

## 🔍 Example: Complete Address Form

```typescript
const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null)
const [selectedState, setSelectedState] = useState<StateData | null>(null)
const [selectedCity, setSelectedCity] = useState<CityData | null>(null)
const [streetAddress, setStreetAddress] = useState("")
const [postalCode, setPostalCode] = useState("")
const [phoneNumber, setPhoneNumber] = useState("")

// Validate before submit
const validateAddress = () => {
  const errors: Record<string, string> = {}
  
  if (!selectedCountry) {
    errors.country = "Please select a country"
  }
  
  // Check if country has states
  const states = selectedCountry ? getStatesOfCountry(selectedCountry.isoCode) : []
  if (states.length > 0 && !selectedState) {
    errors.state = "Please select a state"
  }
  
  if (!selectedCity) {
    errors.city = "Please select a city"
  }
  
  if (!streetAddress.trim()) {
    errors.street = "Please enter a street address"
  }
  
  if (!postalCode.trim()) {
    errors.postalCode = "Please enter a postal code"
  }
  
  if (selectedCountry) {
    const phoneError = validatePhoneForCountry(phoneNumber, selectedCountry.isoCode)
    if (phoneError) errors.phone = phoneError
  }
  
  return errors
}

// Format for submission
const formatAddressForSubmission = () => {
  const dialCode = selectedCountry?.phonecode ? `+${selectedCountry.phonecode}` : ""
  const fullPhone = formatPhoneWithCountryCode(phoneNumber, dialCode)
  
  return {
    streetAddress,
    city: selectedCity?.name || "",
    state: selectedState?.name || null,
    country: selectedCountry?.name || "",
    postalCode,
    phoneNumber: fullPhone
  }
}
```

---

## 📚 Related Files

- `lib/locations.ts` - Core wrapper functions
- `components/auth/hierarchical-address-selector.tsx` - Address form component
- `components/country-flag-selector.tsx` - Country dropdown with flags
- `app/auth/sign-up/page.tsx` - Example usage in signup

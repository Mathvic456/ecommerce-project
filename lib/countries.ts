export interface StateData {
  name: string
  code: string
  postalCodePlaceholder?: string
}

export interface CountryData {
  name: string
  code: string
  dialCode: string
  flag: string
  phoneLength: number | [number, number] // exact or range [min, max]
  postalCodeFormat?: string
  postalCodePlaceholder?: string
  states?: StateData[]
}

export const countries: CountryData[] = [
  { 
    name: "United States", 
    code: "US", 
    dialCode: "+1", 
    flag: "\u{1F1FA}\u{1F1F8}", 
    phoneLength: 10, 
    postalCodeFormat: "^\\d{5}(-\\d{4})?$", 
    postalCodePlaceholder: "12345",
    states: [
      { name: "California", code: "CA", postalCodePlaceholder: "90210" },
      { name: "New York", code: "NY", postalCodePlaceholder: "10001" },
      { name: "Texas", code: "TX", postalCodePlaceholder: "75001" },
      { name: "Florida", code: "FL", postalCodePlaceholder: "33101" },
      { name: "Illinois", code: "IL", postalCodePlaceholder: "60601" },
      // Add more as needed
    ]
  },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "\u{1F1EC}\u{1F1E7}", phoneLength: 10, postalCodeFormat: "^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$", postalCodePlaceholder: "SW1A 1AA" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "\u{1F1E8}\u{1F1E6}", phoneLength: 10, postalCodeFormat: "^[A-Z]\\d[A-Z] ?\\d[A-Z]\\d$", postalCodePlaceholder: "K1A 0B1" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "\u{1F1E6}\u{1F1FA}", phoneLength: 9, postalCodeFormat: "^\\d{4}$", postalCodePlaceholder: "2000" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "\u{1F1E9}\u{1F1EA}", phoneLength: [10, 11], postalCodeFormat: "^\\d{5}$", postalCodePlaceholder: "10115" },
  { name: "France", code: "FR", dialCode: "+33", flag: "\u{1F1EB}\u{1F1F7}", phoneLength: 9, postalCodeFormat: "^\\d{5}$", postalCodePlaceholder: "75001" },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "\u{1F1EE}\u{1F1F9}", phoneLength: [9, 10], postalCodeFormat: "^\\d{5}$", postalCodePlaceholder: "00100" },
  { name: "Spain", code: "ES", dialCode: "+34", flag: "\u{1F1EA}\u{1F1F8}", phoneLength: 9, postalCodeFormat: "^\\d{5}$", postalCodePlaceholder: "28001" },
  { name: "Netherlands", code: "NL", dialCode: "+31", flag: "\u{1F1F3}\u{1F1F1}", phoneLength: 9, postalCodeFormat: "^\\d{4} ?[A-Z]{2}$", postalCodePlaceholder: "1012 AB" },
  { name: "Belgium", code: "BE", dialCode: "+32", flag: "\u{1F1E7}\u{1F1EA}", phoneLength: 9, postalCodeFormat: "^\\d{4}$", postalCodePlaceholder: "1000" },
  { name: "Switzerland", code: "CH", dialCode: "+41", flag: "\u{1F1E8}\u{1F1ED}", phoneLength: 9, postalCodeFormat: "^\\d{4}$", postalCodePlaceholder: "8001" },
  { name: "Austria", code: "AT", dialCode: "+43", flag: "\u{1F1E6}\u{1F1F9}", phoneLength: [10, 11], postalCodeFormat: "^\\d{4}$", postalCodePlaceholder: "1010" },
  { name: "Sweden", code: "SE", dialCode: "+46", flag: "\u{1F1F8}\u{1F1EA}", phoneLength: 9, postalCodeFormat: "^\\d{3} ?\\d{2}$", postalCodePlaceholder: "111 22" },
  { name: "Norway", code: "NO", dialCode: "+47", flag: "\u{1F1F3}\u{1F1F4}", phoneLength: 8, postalCodeFormat: "^\\d{4}$", postalCodePlaceholder: "0150" },
  { name: "Denmark", code: "DK", dialCode: "+45", flag: "\u{1F1E9}\u{1F1F0}", phoneLength: 8, postalCodeFormat: "^\\d{4}$", postalCodePlaceholder: "1000" },
  { name: "Finland", code: "FI", dialCode: "+358", flag: "\u{1F1EB}\u{1F1EE}", phoneLength: [9, 10], postalCodeFormat: "^\\d{5}$", postalCodePlaceholder: "00100" },
  { name: "Ireland", code: "IE", dialCode: "+353", flag: "\u{1F1EE}\u{1F1EA}", phoneLength: 9, postalCodeFormat: "^[A-Z]\\d{2} ?[A-Z\\d]{4}$", postalCodePlaceholder: "D02 AF30" },
  { name: "Portugal", code: "PT", dialCode: "+351", flag: "\u{1F1F5}\u{1F1F9}", phoneLength: 9, postalCodeFormat: "^\\d{4}-\\d{3}$", postalCodePlaceholder: "1000-001" },
  { name: "Poland", code: "PL", dialCode: "+48", flag: "\u{1F1F5}\u{1F1F1}", phoneLength: 9, postalCodeFormat: "^\\d{2}-\\d{3}$", postalCodePlaceholder: "00-001" },
  { name: "Czech Republic", code: "CZ", dialCode: "+420", flag: "\u{1F1E8}\u{1F1FF}", phoneLength: 9, postalCodeFormat: "^\\d{3} ?\\d{2}$", postalCodePlaceholder: "100 00" },
  { name: "Greece", code: "GR", dialCode: "+30", flag: "\u{1F1EC}\u{1F1F7}", phoneLength: 10, postalCodeFormat: "^\\d{3} ?\\d{2}$", postalCodePlaceholder: "104 31" },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "\u{1F1EF}\u{1F1F5}", phoneLength: 10, postalCodeFormat: "^\\d{3}-\\d{4}$", postalCodePlaceholder: "100-0001" },
  { name: "South Korea", code: "KR", dialCode: "+82", flag: "\u{1F1F0}\u{1F1F7}", phoneLength: [9, 10], postalCodeFormat: "^\\d{5}$", postalCodePlaceholder: "03051" },
  { name: "China", code: "CN", dialCode: "+86", flag: "\u{1F1E8}\u{1F1F3}", phoneLength: 11, postalCodeFormat: "^\\d{6}$", postalCodePlaceholder: "100000" },
  { name: "India", code: "IN", dialCode: "+91", flag: "\u{1F1EE}\u{1F1F3}", phoneLength: 10, postalCodeFormat: "^\\d{6}$", postalCodePlaceholder: "110001" },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "\u{1F1F8}\u{1F1EC}", phoneLength: 8, postalCodeFormat: "^\\d{6}$", postalCodePlaceholder: "018956" },
  { name: "Hong Kong", code: "HK", dialCode: "+852", flag: "\u{1F1ED}\u{1F1F0}", phoneLength: 8 },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "\u{1F1E6}\u{1F1EA}", phoneLength: 9 },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "\u{1F1F8}\u{1F1E6}", phoneLength: 9, postalCodeFormat: "^\\d{5}$", postalCodePlaceholder: "11564" },
  { name: "Israel", code: "IL", dialCode: "+972", flag: "\u{1F1EE}\u{1F1F1}", phoneLength: 9, postalCodeFormat: "^\\d{7}$", postalCodePlaceholder: "1234567" },
  { name: "South Africa", code: "ZA", dialCode: "+27", flag: "\u{1F1FF}\u{1F1E6}", phoneLength: 9, postalCodeFormat: "^\\d{4}$", postalCodePlaceholder: "0001" },
  { 
    name: "Nigeria", 
    code: "NG", 
    dialCode: "+234", 
    flag: "\u{1F1F3}\u{1F1EC}", 
    phoneLength: 10, 
    postalCodeFormat: "^\\d{6}$", 
    postalCodePlaceholder: "100001",
    states: [
      { name: "Lagos", code: "LA", postalCodePlaceholder: "100001" },
      { name: "Abuja", code: "FC", postalCodePlaceholder: "900001" },
      { name: "Kano", code: "KN", postalCodePlaceholder: "700001" },
      { name: "Rivers", code: "RI", postalCodePlaceholder: "500001" },
      { name: "Oyo", code: "OY", postalCodePlaceholder: "200001" },
      // Add more as needed
    ]
  },
  { name: "Kenya", code: "KE", dialCode: "+254", flag: "\u{1F1F0}\u{1F1EA}", phoneLength: 9, postalCodeFormat: "^\\d{5}$", postalCodePlaceholder: "00100" },
  { name: "Egypt", code: "EG", dialCode: "+20", flag: "\u{1F1EA}\u{1F1EC}", phoneLength: 10, postalCodeFormat: "^\\d{5}$", postalCodePlaceholder: "11511" },
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "\u{1F1E7}\u{1F1F7}", phoneLength: [10, 11], postalCodeFormat: "^\\d{5}-\\d{3}$", postalCodePlaceholder: "01310-100" },
  { name: "Mexico", code: "MX", dialCode: "+52", flag: "\u{1F1F2}\u{1F1FD}", phoneLength: 10, postalCodeFormat: "^\\d{5}$", postalCodePlaceholder: "06600" },
  { name: "Argentina", code: "AR", dialCode: "+54", flag: "\u{1F1E6}\u{1F1F7}", phoneLength: 10, postalCodeFormat: "^[A-Z]\\d{4}[A-Z]{3}$", postalCodePlaceholder: "C1425ABC" },
  { name: "Chile", code: "CL", dialCode: "+56", flag: "\u{1F1E8}\u{1F1F1}", phoneLength: 9, postalCodeFormat: "^\\d{7}$", postalCodePlaceholder: "8320000" },
  { name: "Colombia", code: "CO", dialCode: "+57", flag: "\u{1F1E8}\u{1F1F4}", phoneLength: 10, postalCodeFormat: "^\\d{6}$", postalCodePlaceholder: "110111" },
  { name: "New Zealand", code: "NZ", dialCode: "+64", flag: "\u{1F1F3}\u{1F1FF}", phoneLength: 9, postalCodeFormat: "^\\d{4}$", postalCodePlaceholder: "1010" },
  { name: "Philippines", code: "PH", dialCode: "+63", flag: "\u{1F1F5}\u{1F1ED}", phoneLength: 10, postalCodeFormat: "^\\d{4}$", postalCodePlaceholder: "1000" },
  { name: "Thailand", code: "TH", dialCode: "+66", flag: "\u{1F1F9}\u{1F1ED}", phoneLength: 9, postalCodeFormat: "^\\d{5}$", postalCodePlaceholder: "10100" },
  { name: "Malaysia", code: "MY", dialCode: "+60", flag: "\u{1F1F2}\u{1F1FE}", phoneLength: [9, 10], postalCodeFormat: "^\\d{5}$", postalCodePlaceholder: "50000" },
  { name: "Indonesia", code: "ID", dialCode: "+62", flag: "\u{1F1EE}\u{1F1E9}", phoneLength: [10, 12], postalCodeFormat: "^\\d{5}$", postalCodePlaceholder: "10110" },
  { name: "Vietnam", code: "VN", dialCode: "+84", flag: "\u{1F1FB}\u{1F1F3}", phoneLength: 9, postalCodeFormat: "^\\d{6}$", postalCodePlaceholder: "100000" },
  { name: "Turkey", code: "TR", dialCode: "+90", flag: "\u{1F1F9}\u{1F1F7}", phoneLength: 10, postalCodeFormat: "^\\d{5}$", postalCodePlaceholder: "34000" },
  { name: "Russia", code: "RU", dialCode: "+7", flag: "\u{1F1F7}\u{1F1FA}", phoneLength: 10, postalCodeFormat: "^\\d{6}$", postalCodePlaceholder: "101000" },
  { name: "Ukraine", code: "UA", dialCode: "+380", flag: "\u{1F1FA}\u{1F1E6}", phoneLength: 9, postalCodeFormat: "^\\d{5}$", postalCodePlaceholder: "01001" },
  { name: "Romania", code: "RO", dialCode: "+40", flag: "\u{1F1F7}\u{1F1F4}", phoneLength: 9, postalCodeFormat: "^\\d{6}$", postalCodePlaceholder: "010011" },
  { name: "Hungary", code: "HU", dialCode: "+36", flag: "\u{1F1ED}\u{1F1FA}", phoneLength: 9, postalCodeFormat: "^\\d{4}$", postalCodePlaceholder: "1011" },
]

export function getCountryByCode(code: string): CountryData | undefined {
  return countries.find(c => c.code === code)
}

export function getCountryByName(name: string): CountryData | undefined {
  return countries.find(c => c.name.toLowerCase() === name.toLowerCase())
}

export function validatePhoneForCountry(phone: string, countryCode: string): string | null {
  const country = getCountryByCode(countryCode)
  if (!country) return null
  
  // Remove all non-digit characters for length check
  const digitsOnly = phone.replace(/\D/g, "")
  
  if (Array.isArray(country.phoneLength)) {
    const [min, max] = country.phoneLength
    if (digitsOnly.length < min) {
      return `Phone number must be at least ${min} digits for ${country.name}`
    }
    if (digitsOnly.length > max) {
      return `Phone number must be at most ${max} digits for ${country.name}`
    }
  } else {
    if (digitsOnly.length !== country.phoneLength) {
      return `Phone number must be ${country.phoneLength} digits for ${country.name}`
    }
  }
  
  return null
}

export function formatPhoneWithCountryCode(phone: string, dialCode: string): string {
  const digitsOnly = phone.replace(/\D/g, "")
  return `${dialCode}${digitsOnly}`
}

export function parsePhoneNumber(fullPhone: string): { country: CountryData | null; localNumber: string } {
  if (!fullPhone) return { country: null, localNumber: "" }
  
  // Sort countries by dial code length (longest first) to match most specific first
  const sortedCountries = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length)
  
  for (const country of sortedCountries) {
    if (fullPhone.startsWith(country.dialCode)) {
      return {
        country,
        localNumber: fullPhone.replace(country.dialCode, "")
      }
    }
  }
  
  return { country: null, localNumber: fullPhone.replace(/^\+/, "") }
}

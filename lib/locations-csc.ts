// Location data using country-state-city npm package
// Provides comprehensive country, state, and city data

import csc from 'country-state-city'
import type { ICountry, IState, ICity } from 'country-state-city'

// Re-export types from country-state-city for consistency
export type { ICountry as CountryData, IState as StateData, ICity as CityData }

// Custom interface for street data (not provided by country-state-city)
export interface StreetData {
  name: string
  postalCode: string
}

// Helper functions using country-state-city
export function getCountries(): ICountry[] {
  return csc.getAllCountries()
}

export function getCountryByCode(code: string): ICountry | undefined {
  return csc.getCountryByCode(code)
}

export function getStatesForCountry(countryCode: string): IState[] {
  return csc.getStatesOfCountry(countryCode)
}

export function getStateByCode(countryCode: string, stateCode: string): IState | undefined {
  const states = getStatesForCountry(countryCode)
  return states.find(s => s.isoCode === stateCode)
}

export function getCitiesForState(countryCode: string, stateCode: string): ICity[] {
  return csc.getCitiesOfState(countryCode, stateCode)
}

export function getCityByCode(countryCode: string, stateCode: string, cityCode: string): ICity | undefined {
  const cities = getCitiesForState(countryCode, stateCode)
  return cities.find(c => c.name === cityCode) // Note: cityCode is actually city name
}

// Note: country-state-city doesn't provide street-level data
// We'll keep our custom street data for now or implement a different approach
export function getStreetsForCity(countryCode: string, stateCode: string, cityCode: string): StreetData[] {
  // For now, return empty array since country-state-city doesn't have street data
  // In a real app, you might:
  // 1. Use a different API for street data
  // 2. Store custom street data in your database
  // 3. Use a geocoding service
  return []
}

export function getPostalCodeForCity(countryCode: string, stateCode: string, cityCode: string): string {
  const city = getCityByCode(countryCode, stateCode, cityCode)
  // country-state-city cities don't have postal codes in their data
  // We'll need to handle this differently
  return ""
}

// For backward compatibility with existing code
// We need to map country-state-city data to our expected format
export const enhancedCountries = getCountries()

// Helper to get phone info from country (country-state-city doesn't have phone data)
// We'll need to merge with our existing countries.ts data
export function getCountryPhoneInfo(countryCode: string) {
  // This would need to be implemented by merging with lib/countries.ts data
  return {
    dialCode: "+1", // Default
    phoneLength: 10,
    flag: "🇺🇸" // Default flag
  }
}
// Wrapper for country-state-city npm package
// Provides hierarchical address selection: Country → State → City

import { Country, State, City } from 'country-state-city';
import type { ICountry, IState, ICity } from 'country-state-city';

// Re-export types for compatibility
export type CountryData = ICountry;
export type StateData = IState;
export type CityData = ICity;

// Phone validation helpers (moved from lib/countries.ts for consolidation)
export interface PhoneValidationRule {
  minLength: number;
  maxLength: number;
  pattern?: RegExp;
}

// Country-specific phone validation rules
const phoneValidationRules: Record<string, PhoneValidationRule> = {
  US: { minLength: 10, maxLength: 10 },
  NG: { minLength: 10, maxLength: 10 },
  GB: { minLength: 10, maxLength: 11 },
  CA: { minLength: 10, maxLength: 10 },
  AU: { minLength: 9, maxLength: 9 },
  DE: { minLength: 10, maxLength: 11 },
  FR: { minLength: 9, maxLength: 9 },
  IT: { minLength: 9, maxLength: 10 },
  ES: { minLength: 9, maxLength: 9 },
  NL: { minLength: 9, maxLength: 9 },
  // Default for other countries
  default: { minLength: 7, maxLength: 15 },
};

// Get all countries with additional metadata
export function getAllCountries(): ICountry[] {
  return Country.getAllCountries();
}

// Get states for a specific country
export function getStatesOfCountry(countryCode: string): IState[] {
  return State.getStatesOfCountry(countryCode);
}

// Get cities for a specific state
export function getCitiesOfState(countryCode: string, stateCode: string): ICity[] {
  return City.getCitiesOfState(countryCode, stateCode);
}

// Get country by ISO code
export function getCountryByCode(countryCode: string): ICountry | undefined {
  return Country.getCountryByCode(countryCode);
}

// Get state by ISO code and country
export function getStateByCode(stateCode: string, countryCode: string): IState | undefined {
  return State.getStateByCodeAndCountry(stateCode, countryCode);
}

// Validate phone number for a specific country
export function validatePhoneForCountry(phone: string, countryCode: string): string | null {
  if (!phone) return "Phone number is required";
  
  const digitsOnly = phone.replace(/\D/g, "");
  const rules = phoneValidationRules[countryCode] || phoneValidationRules.default;
  
  if (digitsOnly.length < rules.minLength) {
    return `Phone number must be at least ${rules.minLength} digits`;
  }
  
  if (digitsOnly.length > rules.maxLength) {
    return `Phone number must not exceed ${rules.maxLength} digits`;
  }
  
  return null;
}

// Format phone number with country code
export function formatPhoneWithCountryCode(phone: string, dialCode: string): string {
  const digitsOnly = phone.replace(/\D/g, "");
  return `${dialCode}${digitsOnly}`;
}

// Get phone validation info for a country
export function getPhoneValidationInfo(countryCode: string): { min: number; max: number } {
  const rules = phoneValidationRules[countryCode] || phoneValidationRules.default;
  return { min: rules.minLength, max: rules.maxLength };
}

// Get dial code from country
export function getDialCode(countryCode: string): string {
  const country = getCountryByCode(countryCode);
  return country?.phonecode ? `+${country.phonecode}` : "";
}

// Parse phone number to extract country and local number
export function parsePhoneNumber(fullPhone: string): { countryCode: string | null; localNumber: string } {
  if (!fullPhone) return { countryCode: null, localNumber: "" };
  
  // Remove the + prefix if present
  const cleanPhone = fullPhone.startsWith('+') ? fullPhone.slice(1) : fullPhone;
  
  // Get all countries and sort by phonecode length (longest first)
  const countries = getAllCountries();
  const sortedCountries = [...countries].sort((a, b) => 
    (b.phonecode?.length || 0) - (a.phonecode?.length || 0)
  );
  
  for (const country of sortedCountries) {
    if (country.phonecode && cleanPhone.startsWith(country.phonecode)) {
      return {
        countryCode: country.isoCode,
        localNumber: cleanPhone.slice(country.phonecode.length)
      };
    }
  }
  
  return { countryCode: null, localNumber: cleanPhone };
}
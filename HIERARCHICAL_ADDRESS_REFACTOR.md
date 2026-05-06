# Hierarchical Address Refactoring

## Summary
Successfully refactored the signup component to implement hierarchical address selection using the `country-state-city` npm package:
1. Country → State → City → Street (manual input)
2. Comprehensive worldwide data for all countries

## Changes Made

### 1. Data Source - Using `country-state-city` npm package
- Replaced custom static data with `country-state-city` package (v3.2.1)
- Benefits:
  - Comprehensive worldwide data (all countries, states, cities)
  - Maintained and updated by the community
  - Tree-shakeable for optimized bundle size
  - No need to maintain our own location data

### 2. Wrapper Functions (`lib/locations.ts`)
- Created wrapper functions around the package API:
  - `getAllCountries()` - Get all countries
  - `getStatesOfCountry(countryCode)` - Get states for a country
  - `getCitiesOfState(countryCode, stateCode)` - Get cities for a state
  - `getCountryByCode(countryCode)` - Get country by ISO code
  - `validatePhoneForCountry(phone, countryCode)` - Validate phone for country
  - `formatPhoneWithCountryCode(phone, dialCode)` - Format phone with country code
  - `getPhoneValidationInfo(countryCode)` - Get phone validation rules
  - `parsePhoneNumber(fullPhone)` - Parse phone to extract country

### 3. Hierarchical Address Selector Component (`components/auth/hierarchical-address-selector.tsx`)
- Simplified component using the package data
- Features:
  - Country selection with flag dropdown
  - State/Region dropdown (only shows if country has states)
  - City dropdown (only shows if state is selected)
  - Street address (manual input - no predefined street data)
  - Postal code input (manual entry)
  - Address preview summary
- Cleaner API:
  - Removed `selectedStreet` and `manualStreet` states
  - Uses single `streetAddress` string
  - Postal code is manual entry (not auto-filled)

### 4. Updated Components
- `components/country-flag-selector.tsx` - Updated to use `isoCode` and `phonecode`
- `components/user/profile-editor.tsx` - Updated to use new data source
- `app/auth/sign-up/page.tsx` - Refactored to use simplified component

## Flow Description
1. User selects country from flag dropdown
2. If country has states, user selects state/region
3. User selects city from state's cities
4. User enters street address manually
5. User enters postal code manually
6. All selections are validated before proceeding

## Key Differences from Previous Implementation
- **No street data**: The `country-state-city` package doesn't include street-level data, so users enter street addresses manually
- **No auto-filled postal codes**: Users enter postal codes manually
- **Comprehensive data**: All countries, states, and cities worldwide are available
- **Simpler API**: Fewer state variables and props to manage

## Testing Notes
- Test with countries that have states (US, Nigeria, etc.)
- Test with countries without states (some small nations)
- Verify phone validation with selected country
- Test complete flow: signup → email confirmation → profile auto-save

## Files Modified
- `lib/locations.ts` - Wrapper for country-state-city package
- `components/auth/hierarchical-address-selector.tsx` - Simplified component
- `components/country-flag-selector.tsx` - Updated for new data types
- `components/user/profile-editor.tsx` - Updated imports and field references
- `app/auth/sign-up/page.tsx` - Refactored to use simplified component
- `HIERARCHICAL_ADDRESS_REFACTOR.md` - This documentation

## Package Information
- **Package**: `country-state-city`
- **Version**: ^3.2.1
- **Data Source**: https://github.com/dr5hn/countries-states-cities-database
- **Bundle Size**: ~8MB minified (tree-shakeable)
# Migration to `country-state-city` NPM Package

## ✅ Migration Complete

Successfully migrated from custom static location data to the `country-state-city` npm package for hierarchical address selection.

---

## 📦 Package Information

- **Package**: `country-state-city`
- **Version**: ^3.2.1 (already installed)
- **NPM**: https://www.npmjs.com/package/country-state-city
- **Data Source**: https://github.com/dr5hn/countries-states-cities-database
- **Bundle Size**: ~8MB minified (tree-shakeable)

---

## 🎯 Benefits

1. **Comprehensive Data**: All countries, states, and cities worldwide
2. **Maintained**: Community-maintained and regularly updated
3. **No Manual Updates**: No need to maintain our own location data
4. **Tree-Shakeable**: Optimized bundle size
5. **Type-Safe**: Includes TypeScript definitions

---

## 🔄 Key Changes

### Data Structure Changes

**Before (Custom)**:
```typescript
{
  code: "US",
  dialCode: "+1",
  phoneLength: 10,
  postalCodePlaceholder: "12345"
}
```

**After (country-state-city)**:
```typescript
{
  isoCode: "US",
  phonecode: "1",
  latitude: "38.00000000",
  longitude: "-97.00000000"
}
```

### API Changes

| Old API | New API |
|---------|---------|
| `enhancedCountries` | `getAllCountries()` |
| `country.code` | `country.isoCode` |
| `country.dialCode` | `+${country.phonecode}` |
| `country.phoneLength` | `getPhoneValidationInfo(isoCode)` |
| `country.postalCodePlaceholder` | _(removed - manual entry)_ |

---

## 📝 Files Modified

### Core Library Files
- ✅ `lib/locations.ts` - Wrapper for country-state-city package
  - Added helper functions for phone validation
  - Added `parsePhoneNumber()` function
  - Added `getPhoneValidationInfo()` function

### Components
- ✅ `components/auth/hierarchical-address-selector.tsx` - Simplified component
  - Removed street dropdown (manual entry only)
  - Removed auto-filled postal codes
  - Updated to use `isoCode` and `phonecode`

- ✅ `components/country-flag-selector.tsx` - Updated for new data types
  - Changed `code` → `isoCode`
  - Changed `dialCode` → `phonecode`

- ✅ `components/user/profile-editor.tsx` - Updated imports and references
  - Updated to use `lib/locations` instead of `lib/countries`
  - Updated field references to new API

- ✅ `components/user/address-manager.tsx` - Updated imports and references
  - Updated to use `getAllCountries()`
  - Updated field references to new API

### Pages
- ✅ `app/auth/sign-up/page.tsx` - Refactored signup flow
  - Updated to use new hierarchical component
  - Simplified state management
  - Updated validation logic

- ✅ `app/checkout/page.tsx` - Updated imports and references
  - Updated to use `getAllCountries()`
  - Updated field references to new API

---

## 🔧 Implementation Details

### Phone Validation
Phone validation rules are now maintained in `lib/locations.ts`:
```typescript
const phoneValidationRules: Record<string, PhoneValidationRule> = {
  US: { minLength: 10, maxLength: 10 },
  NG: { minLength: 10, maxLength: 10 },
  GB: { minLength: 10, maxLength: 11 },
  // ... more countries
  default: { minLength: 7, maxLength: 15 },
}
```

### Address Flow
1. **Country Selection** → User selects from all countries worldwide
2. **State Selection** → Shows states if country has them (e.g., US, Nigeria)
3. **City Selection** → Shows cities for selected state
4. **Street Entry** → Manual text input (no predefined streets)
5. **Postal Code** → Manual text input (no auto-fill)

---

## ⚠️ Breaking Changes

### Removed Features
1. **Street Dropdowns**: No predefined street data available
   - Users now enter street addresses manually
   
2. **Auto-filled Postal Codes**: No postal code data in package
   - Users now enter postal codes manually

3. **Phone Length from Country**: Not directly available
   - Now using custom validation rules in `lib/locations.ts`

### Field Name Changes
- `country.code` → `country.isoCode`
- `country.dialCode` → `+${country.phonecode}`
- `country.phoneLength` → Use `getPhoneValidationInfo(isoCode)`

---

## 🧪 Testing Checklist

- [ ] Test signup flow with different countries
- [ ] Test countries with states (US, Nigeria, India)
- [ ] Test countries without states (Singapore, Monaco)
- [ ] Test phone validation for different countries
- [ ] Test profile editor with existing phone numbers
- [ ] Test address manager with existing addresses
- [ ] Test checkout flow with new address entry
- [ ] Verify email confirmation and profile auto-save
- [ ] Check that existing user data still works

---

## 📚 Usage Examples

### Get All Countries
```typescript
import { getAllCountries } from "@/lib/locations"

const countries = getAllCountries()
// Returns: ICountry[] with all countries worldwide
```

### Get States for Country
```typescript
import { getStatesOfCountry } from "@/lib/locations"

const states = getStatesOfCountry("US")
// Returns: IState[] with all US states
```

### Get Cities for State
```typescript
import { getCitiesOfState } from "@/lib/locations"

const cities = getCitiesOfState("US", "CA")
// Returns: ICity[] with all California cities
```

### Validate Phone Number
```typescript
import { validatePhoneForCountry } from "@/lib/locations"

const error = validatePhoneForCountry("1234567890", "US")
// Returns: null if valid, error message if invalid
```

---

## 🔮 Future Enhancements

1. **Add More Phone Validation Rules**: Expand the `phoneValidationRules` object
2. **Postal Code Validation**: Add country-specific postal code validation
3. **Street Autocomplete**: Integrate with Google Places API for street suggestions
4. **Caching**: Cache country/state/city data in localStorage for performance
5. **Lazy Loading**: Load city data on-demand to reduce initial bundle size

---

## 📖 Documentation

- **Package Docs**: https://www.npmjs.com/package/country-state-city
- **Data Source**: https://github.com/dr5hn/countries-states-cities-database
- **Our Implementation**: See `lib/locations.ts` for wrapper functions

---

## ✨ Summary

The migration to `country-state-city` package provides:
- ✅ Comprehensive worldwide location data
- ✅ No manual data maintenance required
- ✅ Community-maintained and updated
- ✅ Type-safe TypeScript support
- ✅ Optimized bundle size with tree-shaking

All components have been successfully updated and the application is ready for testing!

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function validateEmail(email: string): string | null {
  if (!email) return "Email is required"
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return "Please enter a valid email address"
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required"
  if (password.length < 8) return "Password must be at least 8 characters"
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter"
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter"
  if (!/[0-9]/.test(password)) return "Password must contain at least one number"
  return null
}

export function validatePasswordMatch(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) return "Please confirm your password"
  if (password !== confirmPassword) return "Passwords do not match"
  return null
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim() === "") return `${fieldName} is required`
  return null
}

export function validatePhone(phone: string, countryCode?: string): string | null {
  if (!phone) return "Phone number is required"
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/
  if (!phoneRegex.test(phone)) return "Please enter a valid phone number"
  
  const digitsOnly = phone.replace(/\D/g, "")
  if (digitsOnly.length < 7) return "Phone number is too short"
  if (digitsOnly.length > 15) return "Phone number is too long"
  
  return null
}

export function validateSignupForm(data: {
  email: string
  password: string
  confirmPassword: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  const emailError = validateEmail(data.email)
  if (emailError) errors.email = emailError

  const passwordError = validatePassword(data.password)
  if (passwordError) errors.password = passwordError

  const confirmError = validatePasswordMatch(data.password, data.confirmPassword)
  if (confirmError) errors.confirmPassword = confirmError

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateLoginForm(data: { email: string; password: string }): ValidationResult {
  const errors: Record<string, string> = {}

  const emailError = validateEmail(data.email)
  if (emailError) errors.email = emailError

  if (!data.password) errors.password = "Password is required"

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateProfileForm(data: {
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  country: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  const firstNameError = validateRequired(data.firstName, "First name")
  if (firstNameError) errors.firstName = firstNameError

  const lastNameError = validateRequired(data.lastName, "Last name")
  if (lastNameError) errors.lastName = lastNameError

  const phoneError = validatePhone(data.phone)
  if (phoneError) errors.phone = phoneError

  const addressError = validateRequired(data.address, "Address")
  if (addressError) errors.address = addressError

  const cityError = validateRequired(data.city, "City")
  if (cityError) errors.city = cityError

  const countryError = validateRequired(data.country, "Country")
  if (countryError) errors.country = countryError

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

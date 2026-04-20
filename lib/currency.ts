export type Currency = "NGN" | "USD" | "GBP" | "EUR"

export const currencySymbols: Record<Currency, string> = {
  NGN: "₦",
  USD: "₦", // Mapping USD to Naira as requested to handle existing data
  GBP: "£",
  EUR: "€",
}

export function formatPrice(amount: number, currency: Currency): string {
  const symbol = currencySymbols[currency] || "₦"
  return `${symbol}${(amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function getCurrencyFromStorage(): Currency {
  if (typeof window === "undefined") return "NGN"
  const stored = localStorage.getItem("currency")
  
  // If no currency is stored, or if it was explicitly set to USD, default to NGN
  if (!stored) {
    return "NGN"
  }
  
  return (stored as Currency) || "NGN"
}

export function getPriceForCurrency(product: any, currency: Currency): number {
  if (!product) return 0
  
  // Try NGN first, fallback to USD (now Naira) or generic price
  if (currency === "NGN") {
    return product.price_ngn || product.price_usd || product.price || 0
  }
  
  const key = `price_${currency.toLowerCase()}` as keyof typeof product
  return product[key] || product.price || 0
}

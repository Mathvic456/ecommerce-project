import type { Currency } from "./currency"

export interface ShippingOption {
  id: string
  name: string
  description: string
  estimatedDays: string
  basePrice: number // in base currency units (kobo for NGN)
  freeThreshold?: number // If order subtotal exceeds this, shipping is free
}

// Shipping options for different currencies
export const shippingOptions: Record<Currency, ShippingOption[]> = {
  NGN: [
    {
      id: "standard",
      name: "Standard Delivery",
      description: "Free for orders over ₦5,000",
      estimatedDays: "5-7 business days",
      basePrice: 500000, // 5,000 NGN in kobo
      freeThreshold: 5000000, // 50,000 NGN in kobo
    },
    {
      id: "express",
      name: "Express Delivery",
      description: "Fast delivery to your doorstep",
      estimatedDays: "2-3 business days",
      basePrice: 1500000, // 15,000 NGN in kobo
    },
    {
      id: "overnight",
      name: "Overnight Delivery",
      description: "Next day delivery (for orders before 2 PM)",
      estimatedDays: "1 business day",
      basePrice: 3000000, // 30,000 NGN in kobo
    },
  ],
  USD: [
    {
      id: "standard",
      name: "Standard Delivery",
      description: "Free for orders over $50",
      estimatedDays: "5-7 business days",
      basePrice: 500, // $5 in cents
      freeThreshold: 5000, // $50 in cents
    },
    {
      id: "express",
      name: "Express Delivery",
      description: "Fast delivery to your doorstep",
      estimatedDays: "2-3 business days",
      basePrice: 1500, // $15 in cents
    },
    {
      id: "overnight",
      name: "Overnight Delivery",
      description: "Next day delivery (for orders before 2 PM)",
      estimatedDays: "1 business day",
      basePrice: 3000, // $30 in cents
    },
  ],
  EUR: [
    {
      id: "standard",
      name: "Standard Delivery",
      description: "Free for orders over €50",
      estimatedDays: "5-7 business days",
      basePrice: 400, // €4 in cents
      freeThreshold: 5000, // €50 in cents
    },
    {
      id: "express",
      name: "Express Delivery",
      description: "Fast delivery to your doorstep",
      estimatedDays: "2-3 business days",
      basePrice: 1200, // €12 in cents
    },
    {
      id: "overnight",
      name: "Overnight Delivery",
      description: "Next day delivery (for orders before 2 PM)",
      estimatedDays: "1 business day",
      basePrice: 2500, // €25 in cents
    },
  ],
  GBP: [
    {
      id: "standard",
      name: "Standard Delivery",
      description: "Free for orders over £50",
      estimatedDays: "5-7 business days",
      basePrice: 400, // £4 in pence
      freeThreshold: 5000, // £50 in pence
    },
    {
      id: "express",
      name: "Express Delivery",
      description: "Fast delivery to your doorstep",
      estimatedDays: "2-3 business days",
      basePrice: 1200, // £12 in pence
    },
    {
      id: "overnight",
      name: "Overnight Delivery",
      description: "Next day delivery (for orders before 2 PM)",
      estimatedDays: "1 business day",
      basePrice: 2500, // £25 in pence
    },
  ],
}

/**
 * Get shipping options for a specific currency
 */
export function getShippingOptionsForCurrency(currency: Currency): ShippingOption[] {
  return shippingOptions[currency] || shippingOptions.NGN
}

/**
 * Calculate shipping cost based on selected option and subtotal
 */
export function calculateShippingCost(
  selectedShippingId: string,
  subtotal: number,
  currency: Currency
): number {
  const options = getShippingOptionsForCurrency(currency)
  const selected = options.find(opt => opt.id === selectedShippingId)

  if (!selected) {
    return 0
  }

  // Check if free shipping threshold is met
  if (selected.freeThreshold && subtotal >= selected.freeThreshold) {
    return 0
  }

  return selected.basePrice
}

/**
 * Get shipping option details
 */
export function getShippingOption(shippingId: string, currency: Currency): ShippingOption | undefined {
  const options = getShippingOptionsForCurrency(currency)
  return options.find(opt => opt.id === shippingId)
}

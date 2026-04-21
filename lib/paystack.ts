/**
 * Utility for interacting with the Paystack API.
 */
export const paystack = {
  /**
   * Initializes a transaction and returns an authorization URL.
   */
  async initializeTransaction({
    email,
    amount,
    metadata,
    callback_url,
  }: {
    email: string
    amount: number // in kobo (Naira * 100)
    metadata?: any
    callback_url?: string
  }) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY

    if (!secretKey) {
      throw new Error("Missing PAYSTACK_SECRET_KEY in environment variables")
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        metadata,
        callback_url,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.status) {
      console.error("Paystack Initialization Error:", data)
      throw new Error(data.message || "Failed to initialize Paystack transaction")
    }

    return data.data // Contains authorization_url and reference
  },

  /**
   * Verifies a transaction using its reference.
   */
  async verifyTransaction(reference: string) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY

    if (!secretKey) {
      throw new Error("Missing PAYSTACK_SECRET_KEY in environment variables")
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
      cache: "no-store",
    })

    const data = await response.json()

    if (!response.ok || !data.status) {
      console.error("Paystack Verification Error:", data)
      throw new Error(data.message || "Failed to verify Paystack transaction")
    }

    return data.data // Contains status, amount, metadata, etc.
  },
}

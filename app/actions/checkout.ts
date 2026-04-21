"use server"

import { createClient } from "@/lib/supabase/server"
import { getPriceForCurrency } from "@/lib/currency"
import { paystack } from "@/lib/paystack"
import type { Currency } from "@/lib/currency"

export async function createCheckoutSession(
  cartItems: any[],
  email: string,
  user_id: string,
  currency: Currency = "NGN",
  addressId?: string,
) {
  try {
    const supabase = await createClient()

    // 1. Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || user.id !== user_id) {
      throw new Error("Unauthorized")
    }

    // 2. Security: Fetch products directly from DB to verify prices
    const productIds = cartItems.map(item => item.product_id)
    const { data: dbProducts, error: dbError } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds)

    if (dbError || !dbProducts) {
      throw new Error("Failed to verify product prices")
    }

    // Create a lookup map for DB products
    const productMap = new Map(dbProducts.map(p => [p.id, p]))

    // 3. Calculate total securely
    let subtotal = cartItems.reduce((sum: number, item: any) => {
      const dbProduct = productMap.get(item.product_id)
      if (!dbProduct) throw new Error(`Product ${item.product_id} not found`)
      
      const price = getPriceForCurrency(dbProduct, currency) || 0
      return sum + price * item.quantity
    }, 0)

    // 4. Calculate Shipping
    // Free shipping over 50,000 NGN (5,000,000 kobo)
    let shippingFee = 0
    if (currency === "NGN" && subtotal < 5000000) {
      shippingFee = 500000 // 5,000 NGN
    }

    const totalAmount = subtotal + shippingFee

    // 5. Get Address string if provided
    let shippingAddress = ""
    if (addressId) {
      const { data: addr } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("id", addressId)
        .single()
      
      if (addr) {
        shippingAddress = `${addr.street_address}, ${addr.city}, ${addr.country} ${addr.postal_code}`
      }
    }

    const orderNumber = Math.random().toString(36).substring(7).toUpperCase()

    // 6. Create Order in Pending state
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        total_amount: totalAmount,
        status: "pending",
        shipping_address: shippingAddress,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // 7. Create Order Items
    const orderItems = cartItems.map((item: any) => {
      const dbProduct = productMap.get(item.product_id)
      return {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: getPriceForCurrency(dbProduct, currency) || 0,
      }
    })

    await supabase.from("order_items").insert(orderItems)

    // 8. Initialize Paystack Transaction
    // Priority: Custom domain → Vercel auto-URL → localhost (dev)
    const baseUrl = 
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      "http://localhost:3000"

    console.log("[Checkout] Using baseUrl for Paystack callback:", baseUrl)

    const paystackData = await paystack.initializeTransaction({
      email,
      amount: totalAmount, // already in kobo (base unit)
      callback_url: `${baseUrl}/verify-payment`,
      metadata: {
        order_id: order.id,
        order_number: orderNumber,
        user_id: user.id,
      },
    })

    // Update order with Paystack reference
    await supabase
      .from("orders")
      .update({ stripe_payment_id: paystackData.reference }) // Using existing column for reference
      .eq("id", order.id)

    return { 
      success: true, 
      sessionUrl: paystackData.authorization_url,
      reference: paystackData.reference 
    }
  } catch (error) {
    console.error("Checkout error:", error)
    return { success: false, error: String(error) }
  }
}


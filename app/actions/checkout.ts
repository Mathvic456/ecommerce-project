"use server"

import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"
import type { Currency } from "@/lib/currency"

export async function createCheckoutSession(
  cartItems: any[],
  email: string,
  user_id: string,
  currency: Currency = "USD",
) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || user.id !== user_id) {
      throw new Error("Unauthorized")
    }

    const totalAmount = cartItems.reduce((sum: number, item: any) => {
      const price = getPriceForCurrency(item.products || {}, currency) || 0
      return sum + price * item.quantity
    }, 0)

    const orderNumber = Math.random().toString(36).substring(7).toUpperCase()

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        total_amount: totalAmount,
        status: "pending",
      })
      .select()
      .single()

    if (orderError) throw orderError

    const orderItems = cartItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: getPriceForCurrency(item.products || {}, currency) || 0,
    }))

    await supabase.from("order_items").insert(orderItems)

    const stripeCurrencyMap: Record<Currency, string> = {
      USD: "usd",
      GBP: "gbp",
      EUR: "eur",
    }

    const stripeCurrency = stripeCurrencyMap[currency]

    const lineItems = cartItems.map((item: any) => ({
      price_data: {
        currency: stripeCurrency,
        product_data: {
          name: item.products?.name || "Product",
          description: item.products?.description || "",
        },
        unit_amount: getPriceForCurrency(item.products || {}, currency) || 0,
      },
      quantity: item.quantity,
    }))

    const session = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/order-success?order_id=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/checkout`,
      line_items: lineItems,
      mode: "payment",
      customer_email: email,
      metadata: {
        order_id: order.id,
        currency: currency,
      },
    })

    // Update order with Stripe payment ID
    await supabase.from("orders").update({ stripe_payment_id: session.id }).eq("id", order.id)

    return { success: true, sessionUrl: session.url }
  } catch (error) {
    console.error("Checkout error:", error)
    return { success: false, error: String(error) }
  }
}

// Helper function to get price for currency
function getPriceForCurrency(product: any, currency: Currency): number {
  if (!product) return 0
  const key = `price_${currency.toLowerCase()}` as keyof typeof product
  return product[key] || product.price || 0
}

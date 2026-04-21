import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("x-paystack-signature")

  if (!signature) {
    return new Response("Missing signature", { status: 400 })
  }

  // Verify Paystack Signature
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    return new Response("Paystack secret key not configured", { status: 500 })
  }

  const hash = crypto
    .createHmac("sha512", secret)
    .update(body)
    .digest("hex")

  if (hash !== signature) {
    console.error("Paystack Webhook signature verification failed")
    return new Response("Invalid signature", { status: 400 })
  }

  const event = JSON.parse(body)
  const supabase = await createClient()

  try {
    switch (event.event) {
      case "charge.success":
        const data = event.data
        console.log("[v0] Paystack Payment successful:", data.reference)

        // Update order status to completed
        if (data.metadata?.order_id) {
          const { error } = await supabase
            .from("orders")
            .update({ status: "completed" })
            .eq("id", data.metadata.order_id)
            .eq("status", "pending")

          if (error) {
            console.error("Error updating order in webhook:", error)
          }

          // Clear user's cart
          if (data.metadata?.user_id) {
            await supabase
              .from("cart_items")
              .delete()
              .eq("user_id", data.metadata.user_id)
          }
        }
        break

      case "transfer.success":
        // Handle payouts if applicable
        break

      case "transfer.failed":
        // Handle failed payouts
        break
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    console.error("Paystack Webhook processing error:", error)
    return new Response("Webhook processing failed", { status: 500 })
  }
}

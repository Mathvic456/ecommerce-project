import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import type Stripe from "stripe"

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return new Response("Missing signature", { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error) {
    console.error("Webhook verification failed:", error)
    return new Response("Invalid signature", { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session
        console.log("[v0] Payment successful:", session.id)

        // Update order status to completed
        if (session.metadata?.order_id) {
          await supabase.from("orders").update({ status: "completed" }).eq("id", session.metadata.order_id)
        }
        break

      case "checkout.session.expired":
        const expiredSession = event.data.object as Stripe.Checkout.Session
        console.log("[v0] Checkout expired:", expiredSession.id)

        // Update order status to cancelled
        if (expiredSession.metadata?.order_id) {
          await supabase.from("orders").update({ status: "cancelled" }).eq("id", expiredSession.metadata.order_id)
        }
        break

      case "charge.failed":
        const failedCharge = event.data.object as Stripe.Charge
        console.log("[v0] Charge failed:", failedCharge.id)

        // Find and update order by payment intent
        if (failedCharge.payment_intent) {
          const { data: session } = await supabase
            .from("orders")
            .select("*")
            .eq("stripe_payment_id", failedCharge.payment_intent)
            .single()

          if (session) {
            await supabase.from("orders").update({ status: "cancelled" }).eq("id", session.id)
          }
        }
        break
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return new Response("Webhook processing failed", { status: 500 })
  }
}

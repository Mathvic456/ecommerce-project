import { NextResponse } from "next/server"
import { paystack } from "@/lib/paystack"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get("reference")

  if (!reference) {
    return NextResponse.json({ success: false, error: "No reference provided" }, { status: 400 })
  }

  try {
    const data = await paystack.verifyTransaction(reference)
    const supabase = await createClient()

    if (data.status === "success") {
      const orderId = data.metadata?.order_id

      if (orderId) {
        // Update order status securely on server
        await supabase
          .from("orders")
          .update({ status: "completed" })
          .eq("id", orderId)
          .eq("status", "pending") // Only update if still pending
      }

      return NextResponse.json({ 
        success: true, 
        orderId: orderId,
        amount: data.amount 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: `Transaction status: ${data.status}` 
      })
    }
  } catch (error) {
    console.error("Paystack verification error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

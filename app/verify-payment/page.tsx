"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

function VerifyPaymentContent() {
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
  const [message, setMessage] = useState("Verifying your payment...")
  const searchParams = useSearchParams()
  const router = useRouter()
  const reference = searchParams.get("reference")
  const supabase = createClient()

  useEffect(() => {
    if (!reference) {
      setStatus("error")
      setMessage("No payment reference found.")
      return
    }

    const verifyTransaction = async () => {
      try {
        // We'll call a server action or API to verify directly
        const response = await fetch(`/api/verify-paystack?reference=${reference}`)
        const data = await response.json()

        if (data.success) {
          setStatus("success")
          setMessage("Payment successful! Redirecting to your order confirmation...")
          
          // Clear cart on success
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await supabase.from("cart_items").delete().eq("user_id", user.id)
          }

          setTimeout(() => {
            router.push(`/order-success?order_id=${data.orderId}`)
          }, 2000)
        } else {
          setStatus("error")
          setMessage(data.error || "Payment verification failed.")
        }
      } catch (err) {
        console.error("Verification error:", err)
        setStatus("error")
        setMessage("An error occurred during verification.")
      }
    }

    verifyTransaction()
  }, [reference, router, supabase])

  return (
    <div className="max-w-md mx-auto text-center space-y-6">
      {status === "verifying" && (
        <>
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <h1 className="text-2xl font-serif">{message}</h1>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
          <h1 className="text-2xl font-serif text-green-600">Payment Verified!</h1>
          <p className="text-muted-foreground">{message}</p>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="w-16 h-16 mx-auto text-destructive" />
          <h1 className="text-2xl font-serif text-destructive">Verification Failed</h1>
          <p className="text-muted-foreground">{message}</p>
          <button
            onClick={() => router.push("/checkout")}
            className="px-8 py-3 bg-primary text-primary-foreground text-sm tracking-wider uppercase hover:opacity-90 transition-opacity"
          >
            Back to Checkout
          </button>
        </>
      )}
    </div>
  )
}

export default function VerifyPaymentPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Initializing verification...</p>
          </div>
        }>
          <VerifyPaymentContent />
        </Suspense>
      </div>
    </main>
  )
}

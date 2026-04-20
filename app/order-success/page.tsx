"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import type { Order } from "@/lib/products"

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchOrder = async () => {
      const orderId = searchParams.get("order_id")
      if (!orderId) {
        router.push("/")
        return
      }

      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        router.push("/auth/login")
        return
      }

      const { data: orderData } = await supabase
        .from("orders")
        .select(
          `
          id,
          user_id,
          order_number,
          total_amount,
          status,
          stripe_payment_id,
          created_at,
          updated_at,
          order_items (*)
        `,
        )
        .eq("id", orderId)
        .eq("user_id", data.user.id)
        .single()

      if (orderData) {
        // Update order status to completed
        await supabase.from("orders").update({ status: "completed" }).eq("id", orderId)

        // Clear cart
        await supabase.from("cart_items").delete().eq("user_id", data.user.id)

        setOrder(orderData)
      }

      setLoading(false)
    }

    fetchOrder()
  }, [searchParams, supabase, router])

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p>Processing your order...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="text-green-500" size={64} />
            </div>
            <CardTitle className="text-3xl">Order Confirmed!</CardTitle>
            <CardDescription>Thank you for your purchase. Your order has been placed successfully.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {order && (
              <>
                <div className="border border-border rounded-lg p-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Number</p>
                    <p className="text-2xl font-bold font-mono">{order.order_number}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Total</p>
                      <p className="text-xl font-semibold">₦{(order.total_amount / 100).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-xl font-semibold capitalize">{order.status}</p>
                    </div>
                  </div>

                  {order.order_items && order.order_items.length > 0 && (
                    <div className="border-t border-border pt-4">
                      <h4 className="font-semibold mb-2">Items in Order:</h4>
                      <ul className="space-y-1">
                        {order.order_items.map((item: any) => (
                          <li key={item.id} className="text-sm">
                            Quantity: {item.quantity} × ₦{(item.price / 100).toFixed(2)} = ₦
                            {((item.quantity * item.price) / 100).toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  A confirmation email has been sent to your account. You can track your order status in your account
                  page.
                </p>

                <div className="flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <Link href="/account">View Order Status</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/search">Continue Shopping</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

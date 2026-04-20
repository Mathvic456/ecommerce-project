"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Order } from "@/lib/products"

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const { data } = await supabase
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
      .order("created_at", { ascending: false })

    setOrders(data || [])
    setLoading(false)
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await supabase.from("orders").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", orderId)

    fetchOrders()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders</p>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No orders yet</CardTitle>
            <CardDescription>Orders will appear here when customers place them</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.order_number}</CardTitle>
                    <CardDescription>{new Date(order.created_at).toLocaleDateString()}</CardDescription>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-semibold">Order Total:</span>
                  <span className="text-lg font-bold">₦{(order.total_amount / 100).toFixed(2)}</span>
                </div>

                {order.order_items && order.order_items.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <h4 className="font-semibold mb-2">Items:</h4>
                    <ul className="space-y-1">
                      {order.order_items.map((item: any) => (
                        <li key={item.id} className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × ₦{(item.price / 100).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <label className="text-sm font-semibold mb-2 block">Update Status:</label>
                  <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

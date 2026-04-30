"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Eye, ChevronRight } from "lucide-react"
import Link from "next/link"
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
        shipping_address,
        created_at,
        updated_at,
        order_items (*)
      `,
      )
      .order("created_at", { ascending: false })

    setOrders(data || [])
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500 hover:bg-green-600"
      case "shipped":
        return "bg-blue-500 hover:bg-blue-600"
      case "received":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "cancelled":
        return "bg-red-500 hover:bg-red-600"
      case "pending":
        return "bg-gray-500 hover:bg-gray-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Orders"
        description="Manage customer orders"
      />

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
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.order_number}</CardTitle>
                    <CardDescription>{new Date(order.created_at).toLocaleDateString()}</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Eye size={16} />
                        View Details
                        <ChevronRight size={16} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-muted-foreground">Order Total</span>
                    <p className="text-lg font-bold">₦{(order.total_amount / 100).toFixed(2)}</p>
                  </div>
                  
                  {order.order_items && order.order_items.length > 0 && (
                    <div className="text-right">
                      <span className="text-sm text-muted-foreground">Items</span>
                      <p className="font-medium">{order.order_items.length} item(s)</p>
                    </div>
                  )}
                </div>

                {order.shipping_address && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold mb-2">Shipping Address</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {order.shipping_address}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

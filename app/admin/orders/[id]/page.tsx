"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Loader2, Package, User, MapPin, CreditCard, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  price: number
  products?: {
    name: string
  }
}

interface Order {
  id: string
  user_id: string
  order_number: string
  total_amount: number
  status: string
  stripe_payment_id: string | null
  shipping_address: string | null
  shipping_method: string | null
  customer_email: string | null
  created_at: string
  updated_at: string
  order_items: OrderItem[]
}

interface UserProfile {
  first_name: string | null
  last_name: string | null
  phone_number: string | null
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      // Fetch order with items
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            price,
            products (name)
          )
        `)
        .eq("id", orderId)
        .single()

      if (orderError) throw orderError

      setOrder(orderData as Order)

      // Fetch user profile
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("first_name, last_name, phone_number")
        .eq("id", orderData.user_id)
        .single()

      setUserProfile(profileData)

    } catch (error) {
      console.error("Error fetching order details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return
    
    setUpdating(true)
    try {
      const { error } = await supabase
        .from("orders")
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", orderId)

      if (error) throw error

      setOrder({ ...order, status: newStatus })
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Failed to update order status")
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500"
      case "shipped":
        return "bg-blue-500"
      case "received":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      case "pending":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getShippingMethodLabel = (method: string | null) => {
    if (!method) return "Standard Shipping"
    
    switch (method) {
      case "standard":
        return "Standard Shipping (5-7 days)"
      case "express":
        return "Express Shipping (2-3 days)"
      case "overnight":
        return "Overnight Shipping (1 day)"
      default:
        return method
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-8">
        <AdminPageHeader
          title="Order Not Found"
          description="The order you're looking for doesn't exist"
        />
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              This order could not be found.
            </p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => router.push("/admin/orders")}>
                Back to Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const customerName = userProfile?.first_name && userProfile?.last_name
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : "Name not provided"

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={`Order #${order.order_number}`}
        description={`Placed on ${new Date(order.created_at).toLocaleDateString()}`}
        action={
          <Badge className={getStatusColor(order.status)}>
            {order.status}
          </Badge>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package size={20} />
                <CardTitle>Order Items</CardTitle>
              </div>
              <CardDescription>
                {order.order_items.length} item(s) in this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">{item.products?.name || "Product"}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ₦{(item.price / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>₦{(order.total_amount / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin size={20} />
                <CardTitle>Shipping Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Shipping Address</p>
                <p className="whitespace-pre-line">
                  {order.shipping_address || "No address provided"}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Shipping Method</p>
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-muted-foreground" />
                  <p>{getShippingMethodLabel(order.shipping_method)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User size={20} />
                <CardTitle>Customer</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{customerName}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium break-all">
                  {order.customer_email || "Email not available"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  User ID: {order.user_id.slice(0, 8)}...
                </p>
              </div>
              
              {userProfile?.phone_number && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{userProfile.phone_number}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard size={20} />
                <CardTitle>Payment</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Payment ID</p>
                <p className="font-mono text-xs break-all">
                  {order.stripe_payment_id || "N/A"}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold">
                  ₦{(order.total_amount / 100).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
              <CardDescription>Change the order status</CardDescription>
            </CardHeader>
            <CardContent>
              <Select 
                value={order.status} 
                onValueChange={handleStatusChange}
                disabled={updating}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending Payment</SelectItem>
                  <SelectItem value="received">Order Received</SelectItem>
                  <SelectItem value="shipped">Order Shipped</SelectItem>
                  <SelectItem value="delivered">Order Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              {updating && (
                <p className="text-sm text-muted-foreground mt-2">
                  Updating status...
                </p>
              )}
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm">
                    {new Date(order.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

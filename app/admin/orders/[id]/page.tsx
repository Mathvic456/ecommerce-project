"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Loader2, Package, User, Mail, MapPin, Truck, Calendar, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getUserEmail } from "@/app/actions/get-user-email"

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  price: number
  products?: {
    name: string
    product_images?: Array<{ image_url: string }>
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
  created_at: string
  updated_at: string
  order_items: OrderItem[]
  user_profiles?: {
    full_name: string | null
  }
  users?: {
    email: string
  }
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchOrderDetail()
  }, [orderId])

  const fetchOrderDetail = async () => {
    try {
      // Fetch order with all related data
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              product_images (image_url)
            )
          )
        `)
        .eq("id", orderId)
        .single()

      if (orderError) throw orderError

      if (orderData) {
        // Fetch user profile
        const { data: profileData } = await supabase
          .from("user_profiles")
          .select("full_name")
          .eq("id", orderData.user_id)
          .maybeSingle()

        // Get user email using server action
        const userEmail = await getUserEmail(orderData.user_id)

        setOrder({
          ...orderData,
          user_profiles: profileData,
          users: { email: userEmail },
        } as Order)
      }
    } catch (error) {
      console.error("Error fetching order:", error)
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

      // Update local state
      setOrder({ ...order, status: newStatus })
      
      // Show success message
      alert("Order status updated successfully!")
    } catch (error) {
      console.error("Error updating order:", error)
      alert("Failed to update order status")
    } finally {
      setUpdating(false)
    }
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
          backTo="/admin/orders"
        />
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">This order could not be found.</p>
            <Button onClick={() => router.push("/admin/orders")} className="mt-4">
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={`Order ${order.order_number}`}
        description={`Placed on ${new Date(order.created_at).toLocaleDateString()}`}
        backTo="/admin/orders"
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
              <CardTitle className="flex items-center gap-2">
                <Package size={20} />
                Order Items
              </CardTitle>
              <CardDescription>
                {order.order_items.length} item(s) in this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items.map((item) => {
                  const product = item.products
                  const imageUrl = product?.product_images?.[0]?.image_url
                  
                  return (
                    <div key={item.id} className="flex gap-4 p-4 border border-border rounded-lg">
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={product?.name || "Product"}
                          className="w-20 h-20 object-cover rounded border border-border"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{product?.name || "Unknown Product"}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm font-medium mt-2">
                          ₦{(item.price / 100).toFixed(2)} each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ₦{((item.price * item.quantity) / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Order Total */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Order Total</span>
                  <span className="text-2xl font-bold">
                    ₦{(order.total_amount / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck size={20} />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Shipping Method</label>
                <p className="mt-1">{getShippingMethodLabel(order.shipping_method)}</p>
              </div>
              
              {order.shipping_address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin size={16} />
                    Delivery Address
                  </label>
                  <p className="mt-1 whitespace-pre-line">{order.shipping_address}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="mt-1">{order.user_profiles?.full_name || "Not provided"}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </label>
                <p className="mt-1 text-sm break-all">{order.users?.email || "Not available"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
              <CardDescription>Change the order status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Updating status...
                </p>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <label className="text-muted-foreground flex items-center gap-2">
                  <Calendar size={16} />
                  Order Date
                </label>
                <p className="mt-1">{new Date(order.created_at).toLocaleString()}</p>
              </div>
              
              <div>
                <label className="text-muted-foreground">Last Updated</label>
                <p className="mt-1">{new Date(order.updated_at).toLocaleString()}</p>
              </div>
              
              {order.stripe_payment_id && (
                <div>
                  <label className="text-muted-foreground flex items-center gap-2">
                    <CreditCard size={16} />
                    Payment ID
                  </label>
                  <p className="mt-1 font-mono text-xs break-all">{order.stripe_payment_id}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

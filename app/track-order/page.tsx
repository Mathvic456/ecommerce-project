"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin,
  AlertCircle,
  XCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Order {
  id: string
  order_number: string
  status: string
  total: number
  created_at: string
  shipping_address: string
  items?: Array<{
    product_name: string
    quantity: number
    price: number
  }>
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle }
]

function getStatusIndex(status: string): number {
  const statusMap: Record<string, number> = {
    pending: 0,
    processing: 1,
    shipped: 2,
    delivered: 3,
    cancelled: -1
  }
  return statusMap[status] ?? 0
}

export default function TrackOrderPage() {
  const [loading, setLoading] = useState(true)
  const [orderNumber, setOrderNumber] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login?redirect=/track-order")
        return
      }
      setLoading(false)
    }
    checkAuth()
  }, [supabase, router])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim()) return

    setIsSearching(true)
    setError(null)
    setOrder(null)

    try {
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderNumber.trim().toUpperCase())
        .single()

      if (fetchError || !data) {
        setError("Order not found. Please check your order number and try again.")
      } else {
        setOrder(data)
      }
    } catch {
      setError("An error occurred while searching. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    )
  }

  const currentStatusIndex = order ? getStatusIndex(order.status) : -1

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <h1 className="text-4xl lg:text-5xl font-serif text-center mb-4">
            Track Your Order
          </h1>
          <p className="text-muted-foreground text-center max-w-xl mx-auto">
            Enter your order number to see the current status of your shipment.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-12">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="orderNumber" className="sr-only">Order Number</Label>
              <Input
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Enter your order number (e.g., ORD-ABC123)"
                className="h-12"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSearching || !orderNumber.trim()}
              className="h-12 px-8"
            >
              {isSearching ? (
                "Searching..."
              ) : (
                <>
                  <Search size={18} className="mr-2" />
                  Track Order
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 flex items-start gap-3">
            <AlertCircle className="text-destructive flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-destructive">Order Not Found</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-8">
            {/* Order Header */}
            <div className="bg-secondary/30 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="text-xl font-medium">{order.order_number}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Status - Cancelled */}
            {order.status === "cancelled" ? (
              <div className="p-6 border border-destructive/30 bg-destructive/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center bg-destructive text-white">
                    <XCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium text-destructive">Order Cancelled</h3>
                    <p className="text-sm text-muted-foreground">
                      This order has been cancelled. If you have questions, please contact support.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Status Progress */
              <div className="py-8">
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-6 right-6 h-0.5 bg-border">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${Math.max(0, currentStatusIndex) * 33.33}%` }}
                    />
                  </div>

                  {/* Status Steps */}
                  <div className="relative flex justify-between">
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon
                      const isActive = index <= currentStatusIndex
                      const isCurrent = index === currentStatusIndex

                      return (
                        <div key={step.key} className="flex flex-col items-center">
                          <div 
                            className={cn(
                              "w-12 h-12 flex items-center justify-center border-2 transition-colors",
                              isActive 
                                ? "bg-primary border-primary text-primary-foreground" 
                                : "bg-background border-border text-muted-foreground",
                              isCurrent && "ring-4 ring-primary/20"
                            )}
                          >
                            <Icon size={20} />
                          </div>
                          <p className={cn(
                            "mt-3 text-xs sm:text-sm font-medium text-center",
                            isActive ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {step.label}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Address */}
            {order.shipping_address && (
              <div className="border border-border p-6">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-2">Shipping Address</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {order.shipping_address}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="border border-border p-6">
              <h3 className="font-medium mb-4">Order Summary</h3>
              <div className="flex justify-between items-center py-3 border-t border-border">
                <span className="font-medium">Total</span>
                <span className="text-lg font-medium">
                  ${(order.total / 100).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Help Section */}
            <div className="text-center pt-6">
              <p className="text-muted-foreground text-sm mb-4">
                Need help with your order?
              </p>
              <a
                href="/contact"
                className="text-sm font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
              >
                Contact Customer Support
              </a>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!order && !error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-secondary">
              <Package size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Enter Your Order Number</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              You can find your order number in your order confirmation email or in your account order history.
            </p>
          </div>
        )}
      </div>

      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" />
    </main>
  )
}

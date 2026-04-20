"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Order } from "@/lib/products"
import { getUserProfile, getUserAddresses } from "@/app/actions/user-profile"
import { ProfileEditor } from "@/components/user/profile-editor"
import { AddressManager } from "@/components/user/address-manager"
import { Package, User, MapPin, LogOut, ChevronRight, ShoppingBag, Clock, Loader2 } from "lucide-react"
import { formatPrice, getCurrencyFromStorage, type Currency } from "@/lib/currency"

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "addresses">("orders")
  const [currency, setCurrency] = useState<Currency>("NGN")
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        router.push("/auth/login")
        return
      }

      setUser(data.user)
      setCurrency(getCurrencyFromStorage())

      try {
        const profileData = await getUserProfile()
        setProfile(profileData)
      } catch (error) {
        console.log("[v0] Error fetching profile:", error)
      }

      try {
        const addressesData = await getUserAddresses()
        console.log("[v0] Fetched addresses:", addressesData)
        setAddresses(addressesData)
      } catch (error) {
        console.log("[v0] Error fetching addresses:", error)
      }

      const { data: ordersData } = await supabase
        .from("orders")
        .select(`
          id,
          user_id,
          order_number,
          total_amount,
          status,
          stripe_payment_id,
          created_at,
          updated_at,
          order_items (*)
        `)
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false })

      setOrders(ordersData || [])
      setLoading(false)
    }

    fetchData()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-muted-foreground" />
          </div>
        </div>
      </main>
    )
  }

  const tabs = [
    { id: "orders", label: "Orders", icon: Package },
    { id: "profile", label: "Profile", icon: User },
    { id: "addresses", label: "Addresses", icon: MapPin },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 lg:mb-12">
          <div>
            <h1 className="text-3xl lg:text-4xl font-serif mb-2">My Account</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-secondary font-medium"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span>{tab.label}</span>
                    </div>
                    {activeTab === tab.id && <ChevronRight size={16} />}
                  </button>
                )
              })}
            </nav>

            {/* Quick Stats - Desktop */}
            <div className="hidden lg:block mt-8 p-4 bg-secondary">
              <p className="text-sm text-muted-foreground mb-2">Total Orders</p>
              <p className="text-2xl font-serif">{orders.length}</p>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div>
                <h2 className="text-xl font-serif mb-6">Order History</h2>

                {orders.length === 0 ? (
                  <div className="text-center py-16 border border-border">
                    <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-border">
                      <ShoppingBag size={28} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-serif mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-6">
                      When you place an order, it will appear here
                    </p>
                    <Link
                      href="/categories"
                      className="inline-block px-8 py-4 bg-primary text-primary-foreground text-sm tracking-wider uppercase"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-border p-4 lg:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium">Order #{order.order_number}</h3>
                              <span className={`px-2 py-1 text-xs uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock size={14} />
                              {new Date(order.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                          <div className="text-lg font-medium">
                            {formatPrice(order.total_amount, currency)}
                          </div>
                        </div>

                        {order.order_items && order.order_items.length > 0 && (
                          <div className="pt-4 border-t border-border">
                            <p className="text-sm text-muted-foreground">
                              {order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div>
                <h2 className="text-xl font-serif mb-6">Profile Information</h2>
                <ProfileEditor 
                  initialProfile={profile} 
                  onUpdate={(updatedProfile) => {
                    setProfile((prev: any) => ({ ...prev, ...updatedProfile }))
                  }} 
                />
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div>
                <h2 className="text-xl font-serif mb-6">Saved Addresses</h2>
                <AddressManager 
                  addresses={addresses} 
                  onUpdate={async () => {
                    const updatedAddresses = await getUserAddresses()
                    setAddresses(updatedAddresses)
                  }} 
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" />
    </main>
  )
}

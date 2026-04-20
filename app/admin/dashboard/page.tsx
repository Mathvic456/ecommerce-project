"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Package, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  ArrowUpRight, 
  PlusCircle, 
  ListOrdered,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          supabase.from("products").select("id", { count: "exact" }),
          supabase
            .from("orders")
            .select("id, total_amount, status, order_number, created_at")
            .order("created_at", { ascending: false })
        ])

        const totalProducts = productsRes.count || 0
        const orders = ordersRes.data || []
        const totalOrders = orders.length
        
        // Correcting the data mapping bug: using total_amount (cents)
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
        const pendingOrders = orders.filter((order) => order.status === "pending").length

        setStats({
          totalProducts,
          totalOrders,
          totalRevenue,
          pendingOrders,
        })
        
        setRecentOrders(orders.slice(0, 5))
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase])

  const quickActions = [
    { label: "Add Product", href: "/admin/products", icon: PlusCircle },
    { label: "View Orders", href: "/admin/orders", icon: ListOrdered },
    { label: "Manage Products", href: "/admin/products", icon: Package },
  ]

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif">Command Center</h1>
          <p className="text-muted-foreground mt-1 text-sm tracking-wide">
            Your store at a glance for {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {quickActions.map((action) => (
            <Button key={action.label} asChild variant="outline" size="sm" className="h-10">
              <Link href={action.href} className="flex items-center gap-2">
                <action.icon size={16} />
                <span className="hidden sm:inline">{action.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">₦{(stats.totalRevenue / 100).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime total earnings</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Inventory</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Products in catalog</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Customer purchases</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif text-yellow-600 dark:text-yellow-500">
              {stats.pendingOrders}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Orders awaiting fulfillment</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div>
              <CardTitle className="text-xl font-serif">Recent Business</CardTitle>
              <CardDescription>The latest orders from your store</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/orders" className="flex items-center gap-1">
                View All <ArrowUpRight size={14} />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-10 border border-dashed rounded-lg">
                <p className="text-muted-foreground text-sm">No orders recorded yet.</p>
              </div>
            ) : (
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                    <tr>
                      <th className="px-4 py-3 font-medium">Order ID</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-4 font-medium">{order.order_number}</td>
                        <td className="px-4 py-4">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4">
                          ₦{(order.total_amount / 100).toFixed(2)}
                        </td>
                        <td className="px-4 py-4">
                          <Badge 
                            variant="secondary" 
                            className={
                              order.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-muted'
                            }
                          >
                            {order.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Quick Inventory</CardTitle>
            <CardDescription>Overview of your catalog</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Catalog Health</span>
                 <span className="font-medium">Good</span>
               </div>
               <div className="h-2 bg-muted rounded-full overflow-hidden">
                 <div className="h-full bg-primary w-[85%] rounded-full" />
               </div>
            </div>
            
            <div className="pt-4 border-t space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <PlusCircle size={16} /> 
                Next Actions
              </h4>
              <ul className="space-y-3">
                <li className="text-xs p-3 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                  <p className="font-medium">Restock top sellers</p>
                  <p className="text-muted-foreground mt-1">3 items are running low on stock alerts.</p>
                </li>
                <li className="text-xs p-3 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                  <p className="font-medium">Seasonal updates</p>
                  <p className="text-muted-foreground mt-1">Review "Summer Collection" pricing.</p>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

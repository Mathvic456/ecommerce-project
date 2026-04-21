"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Order } from "@/lib/products"

export default function AdminPayments() {
  const [payments, setPayments] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    completedAmount: 0,
    pendingAmount: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

    const orders = data || []
    setPayments(orders)

    // Calculate stats
    const totalAmount = orders.reduce((sum, order) => sum + order.total_amount, 0)
    const completedAmount = orders
      .filter((order) => order.status === "completed")
      .reduce((sum, order) => sum + order.total_amount, 0)
    const pendingAmount = orders
      .filter((order) => order.status === "pending")
      .reduce((sum, order) => sum + order.total_amount, 0)

    setStats({
      totalPayments: orders.length,
      totalAmount,
      completedAmount,
      pendingAmount,
    })

    setLoading(false)
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
        <h1 className="text-4xl font-bold">Payment Tracking</h1>
        <p className="text-muted-foreground">Monitor all payments and transactions</p>
      </div>

      {loading ? (
        <p>Loading payment data...</p>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalPayments}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">₦{(stats.totalAmount / 100).toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">₦{(stats.completedAmount / 100).toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">₦{(stats.pendingAmount / 100).toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>All transactions tracked by order number</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Order Number</th>
                      <th className="px-4 py-3 text-left font-semibold">Amount</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-left font-semibold">Stripe ID</th>
                      <th className="px-4 py-3 text-left font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-border hover:bg-muted">
                        <td className="px-4 py-3 font-mono text-sm">{payment.order_number}</td>
                        <td className="px-4 py-3 font-semibold">₦{(payment.total_amount / 100).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {payment.stripe_payment_id || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"
import { formatPrice, type Currency } from "@/lib/currency"
import type { Order } from "@/lib/products"

interface ReceiptProps {
  order: Order
  currency: Currency
  userEmail: string
  showDownloadButton?: boolean
}

export function Receipt({ order, currency, userEmail, showDownloadButton = true }: ReceiptProps) {
  const handleDownloadPDF = () => {
    // Create a new window for printing
    const printWindow = window.open("", "", "width=800,height=600")
    if (printWindow) {
      printWindow.document.write(getReceiptHTML())
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getReceiptHTML = () => {
    const itemsHTML = order.order_items
      ?.map(
        (item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.products?.name || "Product"}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">x${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(item.price, currency)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(item.price * item.quantity, currency)}</td>
      </tr>
    `
      )
      .join("")

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Receipt - Order #${order.order_number}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #000;
            line-height: 1.6;
            padding: 20px;
          }
          .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 30px;
            background: #fff;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
          }
          .header p {
            margin: 5px 0;
            font-size: 12px;
            color: #666;
          }
          .order-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            font-size: 13px;
          }
          .order-info-item {
            padding: 10px;
            background: #f9f9f9;
          }
          .order-info-label {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          .items-table {
            width: 100%;
            margin: 30px 0;
            border-collapse: collapse;
          }
          .items-table th {
            background: #f9f9f9;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #000;
            font-size: 13px;
          }
          .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
          }
          .totals {
            margin: 20px 0;
            border-top: 2px solid #000;
            padding-top: 15px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 13px;
          }
          .total-row.grand-total {
            font-weight: bold;
            font-size: 16px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 11px;
            color: #666;
          }
          .status {
            text-align: center;
            padding: 10px;
            background: #e8f5e9;
            border-radius: 4px;
            margin: 15px 0;
            font-weight: bold;
            color: #2e7d32;
          }
          @media print {
            body {
              padding: 0;
            }
            .receipt-container {
              border: none;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>RECEIPT</h1>
            <p>Order #${order.order_number}</p>
            <p>${new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
          </div>

          <div class="status">
            Status: ${(order.status || "pending").toUpperCase()}
          </div>

          <div class="order-info">
            <div class="order-info-item">
              <div class="order-info-label">Customer Email</div>
              <div>${userEmail}</div>
            </div>
            <div class="order-info-item">
              <div class="order-info-label">Shipping Address</div>
              <div>${order.shipping_address || "Not provided"}</div>
            </div>
            <div class="order-info-item">
              <div class="order-info-label">Order Date</div>
              <div>${new Date(order.created_at).toLocaleDateString()}</div>
            </div>
            <div class="order-info-item">
              <div class="order-info-label">Shipping Method</div>
              <div>${order.shipping_method ? order.shipping_method.charAt(0).toUpperCase() + order.shipping_method.slice(1) : "Standard"}</div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>${formatPrice(order.subtotal_amount || order.total_amount, currency)}</span>
            </div>
            <div class="total-row">
              <span>Shipping</span>
              <span>${formatPrice(order.shipping_cost || 0, currency)}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total</span>
              <span>${formatPrice(order.total_amount, currency)}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p>For support, please contact us at support@apex.com</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2" style={{ display: showDownloadButton ? "flex" : "none" }}>
        <Button onClick={handleDownloadPDF} className="gap-2" variant="outline">
          <Download size={16} />
          Download Receipt
        </Button>
        <Button onClick={handlePrint} className="gap-2" variant="outline">
          <Printer size={16} />
          Print Receipt
        </Button>
      </div>

      {/* Printable Receipt */}
      <div
        className="border border-border p-6 sm:p-8 bg-white"
        style={{
          fontFamily: "Arial, sans-serif",
          color: "#000",
        }}
      >
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-6 mb-8">
          <h1 className="text-2xl font-bold">RECEIPT</h1>
          <p className="text-sm text-gray-600">Order #{order.order_number}</p>
          <p className="text-xs text-gray-600 mt-2">
            {new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Status */}
        <div className="text-center p-2 bg-green-100 text-green-800 rounded mb-6 font-semibold text-sm">
          Status: {(order.status || "pending").toUpperCase()}
        </div>

        {/* Order Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
          <div className="p-3 bg-gray-100 rounded">
            <div className="font-bold text-xs mb-1">CUSTOMER EMAIL</div>
            <div className="text-sm">{userEmail}</div>
          </div>
          <div className="p-3 bg-gray-100 rounded">
            <div className="font-bold text-xs mb-1">SHIPPING ADDRESS</div>
            <div className="text-sm">{order.shipping_address || "Not provided"}</div>
          </div>
          <div className="p-3 bg-gray-100 rounded">
            <div className="font-bold text-xs mb-1">ORDER DATE</div>
            <div className="text-sm">{new Date(order.created_at).toLocaleDateString()}</div>
          </div>
          <div className="p-3 bg-gray-100 rounded">
            <div className="font-bold text-xs mb-1">SHIPPING METHOD</div>
            <div className="text-sm">
              {order.shipping_method
                ? order.shipping_method.charAt(0).toUpperCase() + order.shipping_method.slice(1)
                : "Standard"}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="border-y border-gray-300 my-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-3 px-2 font-bold">Product</th>
                <th className="text-right py-3 px-2 font-bold">Qty</th>
                <th className="text-right py-3 px-2 font-bold">Price</th>
                <th className="text-right py-3 px-2 font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items?.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-3 px-2">{item.products?.name || "Product"}</td>
                  <td className="text-right py-3 px-2">x{item.quantity}</td>
                  <td className="text-right py-3 px-2">{formatPrice(item.price, currency)}</td>
                  <td className="text-right py-3 px-2">{formatPrice(item.price * item.quantity, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="space-y-2 mb-8">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal_amount || order.total_amount, currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>{formatPrice(order.shipping_cost || 0, currency)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t-2 border-black pt-3">
            <span>Total</span>
            <span>{formatPrice(order.total_amount, currency)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 border-t pt-4">
          <p>Thank you for your purchase!</p>
          <p>For support, please contact us at support@apex.com</p>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"
import { createClient } from "@/lib/supabase/client"
import { Truck, RotateCcw, Package, Clock, Globe, Shield } from "lucide-react"

export default function ShippingAndReturnsPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login?redirect=/shipping")
        return
      }
      setLoading(false)
    }
    checkAuth()
  }, [supabase, router])

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

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <h1 className="text-4xl lg:text-5xl font-serif text-center mb-4">
            Shipping & Returns
          </h1>
          <p className="text-muted-foreground text-center max-w-xl mx-auto">
            Everything you need to know about our shipping methods and return policies.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Shipping Options */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground">
              <Truck size={24} />
            </div>
            <h2 className="text-2xl font-serif">Shipping Options</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border border-border p-6">
              <div className="flex items-center gap-2 mb-3">
                <Package size={18} />
                <h3 className="font-medium">Standard Shipping</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Delivered within 5-7 business days
              </p>
              <p className="text-lg font-medium">₦5,000</p>
              <p className="text-xs text-muted-foreground mt-1">Free on orders over ₦50,000</p>
            </div>

            <div className="border border-border p-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={18} />
                <h3 className="font-medium">Express Shipping</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Delivered within 2-3 business days
              </p>
              <p className="text-lg font-medium">₦10,000</p>
              <p className="text-xs text-muted-foreground mt-1">Free on orders over ₦100,000</p>
            </div>

            <div className="border border-border p-6">
              <div className="flex items-center gap-2 mb-3">
                <Globe size={18} />
                <h3 className="font-medium">International Shipping</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Delivered within 7-14 business days
              </p>
              <p className="text-lg font-medium">From ₦25,000</p>
              <p className="text-xs text-muted-foreground mt-1">Varies by destination</p>
            </div>

            <div className="border border-border p-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={18} />
                <h3 className="font-medium">Signature Required</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Added protection for valuable items
              </p>
              <p className="text-lg font-medium">₦2,500</p>
              <p className="text-xs text-muted-foreground mt-1">Optional add-on</p>
            </div>
          </div>
        </section>

        {/* Shipping Details */}
        <section className="mb-16">
          <h3 className="text-xl font-serif mb-6">Shipping Details</h3>
          <div className="prose prose-neutral max-w-none text-muted-foreground">
            <ul className="space-y-3 list-disc list-inside">
              <li>Orders are processed within 1-2 business days (excluding weekends and holidays)</li>
              <li>You will receive a shipping confirmation email with tracking information once your order ships</li>
              <li>Delivery times are estimates and may vary due to carrier delays or weather conditions</li>
              <li>We ship to all 50 US states and over 100 countries worldwide</li>
              <li>PO Boxes and APO/FPO addresses are supported for standard shipping only</li>
              <li>International customers are responsible for any customs fees, duties, or taxes</li>
            </ul>
          </div>
        </section>

        {/* Returns Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground">
              <RotateCcw size={24} />
            </div>
            <h2 className="text-2xl font-serif">Return Policy</h2>
          </div>

          <div className="bg-secondary/30 p-8 mb-8">
            <h3 className="font-medium mb-4">30-Day Return Window</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We want you to be completely satisfied with your purchase. If you are not happy with your order, 
              you may return it within 30 days of delivery for a full refund or exchange.
            </p>
          </div>

          <h3 className="text-xl font-serif mb-6">Return Conditions</h3>
          <div className="space-y-4 text-muted-foreground">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 flex items-center justify-center bg-primary text-primary-foreground text-xs font-medium flex-shrink-0">1</span>
              <p className="text-sm">Items must be unworn, unwashed, and in their original condition with all tags attached</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 flex items-center justify-center bg-primary text-primary-foreground text-xs font-medium flex-shrink-0">2</span>
              <p className="text-sm">Items must be returned in their original packaging</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 flex items-center justify-center bg-primary text-primary-foreground text-xs font-medium flex-shrink-0">3</span>
              <p className="text-sm">Sale items and items marked as final sale are not eligible for returns</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 flex items-center justify-center bg-primary text-primary-foreground text-xs font-medium flex-shrink-0">4</span>
              <p className="text-sm">Intimate apparel and swimwear cannot be returned for hygiene reasons</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 flex items-center justify-center bg-primary text-primary-foreground text-xs font-medium flex-shrink-0">5</span>
              <p className="text-sm">Personalized or customized items cannot be returned unless defective</p>
            </div>
          </div>
        </section>

        {/* How to Return */}
        <section className="mb-16">
          <h3 className="text-xl font-serif mb-6">How to Return an Item</h3>
          <div className="space-y-6">
            <div className="border-l-2 border-primary pl-6">
              <h4 className="font-medium mb-2">Step 1: Initiate Your Return</h4>
              <p className="text-muted-foreground text-sm">
                Log into your account, go to Order History, and select the items you wish to return. 
                Follow the prompts to generate a return label.
              </p>
            </div>
            <div className="border-l-2 border-primary pl-6">
              <h4 className="font-medium mb-2">Step 2: Pack Your Items</h4>
              <p className="text-muted-foreground text-sm">
                Securely pack the items in their original packaging. Include the return form 
                printed from your return confirmation email.
              </p>
            </div>
            <div className="border-l-2 border-primary pl-6">
              <h4 className="font-medium mb-2">Step 3: Ship Your Return</h4>
              <p className="text-muted-foreground text-sm">
                Attach the prepaid return label to your package and drop it off at any authorized 
                shipping location. Keep your tracking receipt.
              </p>
            </div>
            <div className="border-l-2 border-primary pl-6">
              <h4 className="font-medium mb-2">Step 4: Receive Your Refund</h4>
              <p className="text-muted-foreground text-sm">
                Once we receive and inspect your return, we will process your refund within 5-7 business days. 
                You will receive an email confirmation when your refund is issued.
              </p>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <div className="text-center p-8 bg-secondary">
          <h2 className="text-xl font-serif mb-2">Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            Our customer support team is ready to assist you.
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 bg-primary text-primary-foreground text-sm tracking-wider uppercase hover:opacity-90 transition-opacity"
          >
            Contact Support
          </a>
        </div>
      </div>

      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" />
    </main>
  )
}

"use client"

import React from "react"

import Link from "next/link"
import { useState } from "react"
import { Instagram, Facebook, Twitter } from "lucide-react"

export function Footer() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail("")
    }
  }

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter Section */}
      <div className="border-b border-primary-foreground/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-2xl lg:text-3xl font-serif mb-4">Join Our Newsletter</h3>
            <p className="text-primary-foreground/70 mb-8">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            {subscribed ? (
              <p className="text-lg">Thank you for subscribing!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-transparent border border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-primary-foreground transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-primary-foreground text-primary font-medium tracking-wider uppercase hover:opacity-90 transition-opacity"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="text-2xl font-serif tracking-wider">
              LuxuryByEsta
            </Link>
            <p className="mt-4 text-primary-foreground/70 text-sm leading-relaxed">
              Curating premium quality products for the discerning customer. 
              Excellence in every detail.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="hover:opacity-60 transition-opacity" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:opacity-60 transition-opacity" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:opacity-60 transition-opacity" aria-label="Twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-medium tracking-wider uppercase mb-6">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/categories" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/new-arrivals" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/categories?category=bestsellers" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-sm font-medium tracking-wider uppercase mb-6">Help</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-medium tracking-wider uppercase mb-6">Account</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/auth/login" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/sign-up" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  View Cart
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/60 text-xs">
              &copy; {new Date().getFullYear()} LuxuryByEsta. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors text-xs">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors text-xs">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

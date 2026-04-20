"use client"

import type React from "react"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import Link from "next/link"

interface AdminSidebarProps {
  user: any
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/payments", label: "Payments" },
  ]

  return (
    <>
      {/* Sidebar for Desktop */}
      <div className={`${isMobileMenuOpen ? "block" : "hidden"} md:block w-64 border-r border-border bg-secondary p-6 h-screen sticky top-0`}>
        <div className="flex flex-col h-full">
          <Link href="/" className="text-xl font-serif mb-8 block hover:opacity-60 transition-opacity">
            LuxuryByEsta
          </Link>
          <nav className="space-y-1 flex-1">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2 text-sm tracking-wide transition-colors ${
                  pathname === link.href ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-6 border-t border-border">
            <div className="mb-4 px-4 overflow-hidden flex justify-between items-center">
               <div className="overflow-hidden">
                 <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
               </div>
               <ModeToggle />
            </div>
            <Button variant="ghost" className="w-full justify-start flex items-center gap-2 text-sm" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Top Bar for Mobile */}
      <div className="border-b border-border p-4 flex justify-between items-center md:hidden bg-secondary sticky top-0 z-50">
        <Link href="/" className="text-lg font-serif">LuxuryByEsta</Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

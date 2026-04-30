"use client"

import type React from "react"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, Home } from "lucide-react"
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
      {/* Desktop Sidebar - Always visible on desktop */}
      <aside className="hidden md:flex md:flex-col w-64 border-r border-border bg-secondary h-screen sticky top-0">
        <div className="flex flex-col h-full p-6">
          <Link href="/" className="text-xl font-serif mb-8 block hover:opacity-60 transition-opacity">
            Matthew's Mart
          </Link>
          <nav className="space-y-1 flex-1">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2 text-sm tracking-wide transition-colors rounded ${
                  pathname === link.href 
                    ? "bg-primary text-primary-foreground font-medium" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-6 border-t border-border space-y-4">
            <Link href="/" className="block">
              <Button variant="outline" className="w-full justify-start flex items-center gap-2 text-sm">
                <Home size={16} />
                Back to Store
              </Button>
            </Link>
            <div className="flex justify-between items-center px-2">
              <div className="overflow-hidden flex-1">
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <ModeToggle />
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start flex items-center gap-2 text-sm" 
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden border-b border-border p-4 flex justify-between items-center bg-secondary sticky top-0 z-50">
        <Link href="/" className="text-lg font-serif">
          Matthew's Mart
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-2 hover:bg-muted rounded transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar - Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <aside className="fixed top-0 left-0 bottom-0 w-64 bg-secondary border-r border-border z-50 md:hidden">
            <div className="flex flex-col h-full p-6">
              <div className="flex justify-between items-center mb-8">
                <Link 
                  href="/" 
                  className="text-xl font-serif hover:opacity-60 transition-opacity"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Matthew's Mart
                </Link>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="p-2 hover:bg-muted rounded transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              
              <nav className="space-y-1 flex-1">
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-2 text-sm tracking-wide transition-colors rounded ${
                      pathname === link.href 
                        ? "bg-primary text-primary-foreground font-medium" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              
              <div className="pt-6 border-t border-border space-y-4">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start flex items-center gap-2 text-sm">
                    <Home size={16} />
                    Back to Store
                  </Button>
                </Link>
                <div className="flex justify-between items-center px-2">
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <ModeToggle />
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start flex items-center gap-2 text-sm" 
                  onClick={() => {
                    handleLogout()
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <LogOut size={16} />
                  Logout
                </Button>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  )
}

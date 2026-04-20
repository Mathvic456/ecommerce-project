"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { ShoppingBag, Search, User, Menu, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user || null)

      if (data?.user) {
        const { count } = await supabase
          .from("cart_items")
          .select("*", { count: "exact" })
          .eq("user_id", data.user.id)
        setCartCount(count || 0)
      }
    }

    checkUser()
  }, [supabase])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const isHomePage = pathname === "/"

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-xs tracking-widest uppercase">
        Free shipping on orders over ₦50,000
      </div>

      {/* Main Navbar */}
      <nav 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-background/95 backdrop-blur-md shadow-sm" 
            : "bg-background"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Left - Menu & Search */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 -ml-2 hover:opacity-60 transition-opacity"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <Link 
                href="/search" 
                className="hidden sm:flex items-center gap-2 text-sm hover:opacity-60 transition-opacity"
              >
                <Search size={18} />
                <span className="hidden lg:inline">Search</span>
              </Link>
            </div>

            {/* Center - Logo */}
            <Link 
              href="/" 
              className="absolute left-1/2 -translate-x-1/2 text-2xl lg:text-3xl font-serif tracking-wider hover:opacity-60 transition-opacity"
            >
              LuxuryByEsta
            </Link>

            {/* Right - Account & Cart */}
            <div className="flex items-center gap-4 lg:gap-6">
              <Link 
                href="/search" 
                className="sm:hidden p-2 hover:opacity-60 transition-opacity"
                aria-label="Search"
              >
                <Search size={20} />
              </Link>
              <Link 
                href={user ? "/account" : "/auth/login"} 
                className="p-2 hover:opacity-60 transition-opacity"
                aria-label="Account"
              >
                <User size={20} />
              </Link>
              <Link 
                href="/cart" 
                className="relative p-2 hover:opacity-60 transition-opacity"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-medium rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:block border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center gap-12 py-4">
              <Link 
                href="/categories" 
                className="text-sm tracking-wider uppercase hover:opacity-60 transition-opacity"
              >
                Shop All
              </Link>
              <Link 
                href="/new-arrivals" 
                className="text-sm tracking-wider uppercase hover:opacity-60 transition-opacity"
              >
                New Arrivals
              </Link>
              <Link 
                href="/categories?category=bestsellers" 
                className="text-sm tracking-wider uppercase hover:opacity-60 transition-opacity"
              >
                Best Sellers
              </Link>
              <Link 
                href="/collections" 
                className="text-sm tracking-wider uppercase hover:opacity-60 transition-opacity"
              >
                Collections
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background animate-fade-in"
          style={{ top: "calc(2rem + 4rem)" }}
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            <nav className="flex flex-col gap-6">
              <Link 
                href="/"
                className="text-2xl font-serif tracking-wider hover:opacity-60 transition-opacity animate-fade-up"
              >
                Home
              </Link>
              <Link 
                href="/categories"
                className="text-2xl font-serif tracking-wider hover:opacity-60 transition-opacity animate-fade-up stagger-1"
              >
                Shop All
              </Link>
              <Link 
                href="/new-arrivals"
                className="text-2xl font-serif tracking-wider hover:opacity-60 transition-opacity animate-fade-up stagger-2"
              >
                New Arrivals
              </Link>
              <Link 
                href="/categories?category=bestsellers"
                className="text-2xl font-serif tracking-wider hover:opacity-60 transition-opacity animate-fade-up stagger-3"
              >
                Best Sellers
              </Link>
              <Link 
                href="/collections"
                className="text-2xl font-serif tracking-wider hover:opacity-60 transition-opacity animate-fade-up stagger-4"
              >
                Collections
              </Link>
              
              <div className="border-t border-border pt-6 mt-4">
                {user ? (
                  <>
                    <Link 
                      href="/account"
                      className="block text-lg mb-4 hover:opacity-60 transition-opacity"
                    >
                      My Account
                    </Link>
                    <button 
                      onClick={async () => {
                        await supabase.auth.signOut()
                        setUser(null)
                        router.push("/")
                      }}
                      className="text-lg text-muted-foreground hover:opacity-60 transition-opacity"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link 
                    href="/auth/login"
                    className="text-lg hover:opacity-60 transition-opacity"
                  >
                    Sign In / Create Account
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

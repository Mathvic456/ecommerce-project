"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { validateLoginForm } from "@/lib/validation"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const validation = validateLoginForm({ email, password })
    if (!validation.isValid) {
      setFieldErrors(validation.errors)
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/account")
    } catch (error: unknown) {
      setFieldErrors({ form: error instanceof Error ? error.message : "An error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <Link href="/" className="text-2xl font-serif tracking-wider hover:opacity-60 transition-opacity">
              Matthew's Mart
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-serif mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <div className="mb-8">
            <OAuthButtons />
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground tracking-wider">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                required
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full h-12 px-4 border bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow ${fieldErrors.email ? "border-destructive" : "border-border"
                  }`}
              />
              {fieldErrors.email && <p className="mt-2 text-xs text-destructive">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full h-12 px-4 border bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow ${fieldErrors.password ? "border-destructive" : "border-border"
                  }`}
              />
              {fieldErrors.password && <p className="mt-2 text-xs text-destructive">{fieldErrors.password}</p>}
            </div>

            {fieldErrors.form && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {fieldErrors.form}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary text-primary-foreground text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/auth/sign-up" className="text-foreground hover:opacity-60 transition-opacity">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Panel - Image (Desktop only) */}
      <div
        className="hidden lg:block lg:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80')" }}
      >
        <div className="w-full h-full bg-black/30 flex items-end p-12">
          <div className="text-white">
            <p className="text-sm tracking-wider uppercase mb-2">Premium Quality</p>
            <p className="text-2xl font-serif">Discover exceptional products curated just for you.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

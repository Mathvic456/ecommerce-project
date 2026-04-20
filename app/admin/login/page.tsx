"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { validateLoginForm } from "@/lib/validation"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData?.user) {
        throw new Error("Failed to get user information")
      }

      const userId = userData.user.id

      const { data: adminUser, error: queryError } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", userId)
        .single()

      if (queryError) {
        if (queryError.code !== "PGRST116") {
          throw new Error(`Admin verification failed: ${queryError.message}`)
        }
        throw new Error("This account does not have admin privileges")
      }

      if (!adminUser) {
        throw new Error("This account does not have admin privileges")
      }

      router.push("/admin/dashboard")
    } catch (error: unknown) {
      setFieldErrors({ form: error instanceof Error ? error.message : "Login failed" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            LuxuryByEsta
          </Link>
          <h1 className="text-3xl font-light tracking-tight mt-6 mb-2">Admin Portal</h1>
          <p className="text-muted-foreground text-sm">Sign in to manage your store</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className={`h-12 border-0 border-b rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-foreground transition-colors ${fieldErrors.email ? "border-destructive" : ""}`}
            />
            {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={`h-12 border-0 border-b rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-foreground transition-colors ${fieldErrors.password ? "border-destructive" : ""}`}
            />
            {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
          </div>

          {fieldErrors.form && (
            <p className="text-sm text-destructive text-center">{fieldErrors.form}</p>
          )}

          <Button type="submit" className="w-full h-12 mt-8" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t">
          <p className="text-center text-sm text-muted-foreground mb-4">
            Don't have an admin account?
          </p>
          <Button asChild variant="outline" className="w-full h-12 bg-transparent">
            <Link href="/admin/signup">Create Admin Account</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

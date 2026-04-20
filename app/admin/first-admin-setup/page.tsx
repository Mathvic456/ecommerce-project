"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { setupFirstAdmin } from "@/app/actions/admin-setup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ShieldCheck, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function FirstAdminSetupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [isAllowed, setIsAllowed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function checkAdmins() {
      try {
        const { count, error: countError } = await supabase
          .from("admin_users")
          .select("*", { count: "exact", head: true })

        if (countError) throw countError

        if (count === 0) {
          setIsAllowed(true)
        } else {
          setIsAllowed(false)
        }
      } catch (err) {
        console.error("Error checking admin status:", err)
        setError("Could not verify system status.")
      } finally {
        setIsChecking(false)
      }
    }

    checkAdmins()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setIsLoading(true)
    try {
      const result = await setupFirstAdmin(email, password)
      if (result.success) {
        setSuccess(result.message || "Setup complete!")
      } else {
        setError(result.error || "An error occurred.")
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    )
  }

  if (!isAllowed && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full text-center space-y-6">
          <AlertTriangle className="mx-auto text-destructive" size={48} />
          <h1 className="text-2xl font-serif">Setup Not Available</h1>
          <p className="text-muted-foreground">
            The system already has an admin account. If you need access, please contact an existing administrator.
          </p>
          <Button asChild variant="outline" className="w-full h-12">
            <Link href="/admin/login">Go to Admin Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full text-center space-y-6">
          <ShieldCheck className="mx-auto text-primary" size={48} />
          <h1 className="text-2xl font-serif">Initial Setup Successful</h1>
          <p className="text-muted-foreground">{success}</p>
          <Button asChild className="w-full h-12">
            <Link href="/admin/login">Log in as Admin</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <ShieldCheck className="mx-auto text-primary mb-4" size={40} />
          <h1 className="text-3xl font-serif mb-2">Initialize Admin</h1>
          <p className="text-muted-foreground">Create the system's first administrative account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-12"
            />
          </div>

          {error && (
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded">
                {error}
              </div>
              {error.includes("permissions") && (
                <p className="text-xs text-muted-foreground bg-secondary p-3 rounded">
                  Note: If you see a "foreign key" or "permissions" error, the database might just need a moment to sync. 
                  Try submitting the form again with the same credentials or wait a few seconds.
                </p>
              )}
            </div>
          )}

          <Button type="submit" className="w-full h-12" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                Creating Account...
              </>
            ) : (
              "Initialize System"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Caution: This route will be disabled immediately after the first admin is created.
          </p>
        </form>
      </div>
    </div>
  )
}

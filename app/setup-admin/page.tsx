"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { promoteUserToAdmin } from "@/app/actions/promote-to-admin"

export default function SetupAdminPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [signedUpEmail, setSignedUpEmail] = useState<string | null>(null)
  const [step, setStep] = useState<"instructions" | "signup" | "promote">("instructions")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [promoteSuccess, setPromoteSuccess] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Check if user is already an admin
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from("admin_users").select("id").eq("id", user.id).single()

        if (data) {
          setStep("instructions")
          setError("You are already an admin!")
        }
      }
    }
    checkAdmin()
  }, [supabase])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/setup-admin`,
        },
      })

      if (error) throw error
      if (!data.user) throw new Error("Signup failed")

      setSignedUpEmail(email)
      setSignupSuccess(true)
      setStep("promote")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePromoteToAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!signedUpEmail) {
        throw new Error("Email not found. Please sign up again.")
      }

      const result = await promoteUserToAdmin(signedUpEmail)

      if (result.error) {
        throw new Error(result.error)
      }

      console.log("[v0] Promotion result:", result)
      setPromoteSuccess(true)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to promote to admin"
      console.log("[v0] Promotion error:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-2xl">
        {/* Instructions Step */}
        {step === "instructions" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Admin Setup Guide</CardTitle>
              <CardDescription>Follow these steps to create your first admin account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-l-4 border-foreground pl-4">
                  <h3 className="font-semibold mb-2">Step 1: Create Account</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    You'll create a regular account with an email and password. This will be your admin login.
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    <strong>Test Email:</strong> admin@example.com
                    <br />
                    <strong>Test Password:</strong> Admin123!@#
                  </p>
                </div>

                <div className="border-l-4 border-foreground pl-4">
                  <h3 className="font-semibold mb-2">Step 2: Confirm Email</h3>
                  <p className="text-sm text-muted-foreground">
                    Check your email inbox for a confirmation link. Click it to activate your account.
                  </p>
                </div>

                <div className="border-l-4 border-foreground pl-4">
                  <h3 className="font-semibold mb-2">Step 3: Promote to Admin</h3>
                  <p className="text-sm text-muted-foreground">
                    After confirming your email, come back to this page and follow the admin promotion steps.
                  </p>
                </div>

                <div className="border-l-4 border-foreground pl-4">
                  <h3 className="font-semibold mb-2">Step 4: Access Admin Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Go to <code className="bg-muted px-2 py-1 rounded text-xs">/admin/login</code> and sign in with your
                    credentials.
                  </p>
                </div>
              </div>

              {error && <div className="bg-muted p-3 rounded text-sm text-foreground">{error}</div>}

              <div className="flex gap-3">
                <Button onClick={() => setStep("signup")} className="flex-1">
                  Create Admin Account
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Back Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Signup Step */}
        {step === "signup" && (
          <Card>
            <CardHeader>
              <CardTitle>Create Admin Account</CardTitle>
              <CardDescription>Sign up with your email and password</CardDescription>
            </CardHeader>
            <CardContent>
              {signupSuccess ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded">
                    <p className="text-green-900 font-semibold mb-2">Account Created!</p>
                    <p className="text-sm text-green-800 mb-4">
                      Check your email for a confirmation link. Click it to activate your account.
                    </p>
                    <p className="text-sm text-green-700 mb-4">
                      Once confirmed, return to this page and click "Promote to Admin" to complete the setup.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => setStep("promote")} className="flex-1">
                      Next: Promote to Admin
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/">Back Home</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter a strong password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Minimum 8 characters recommended</p>
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create Account"}
                    </Button>
                    <Button variant="outline" onClick={() => setStep("instructions")}>
                      Back
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Promote Step */}
        {step === "promote" && (
          <Card>
            <CardHeader>
              <CardTitle>Promote to Admin</CardTitle>
              <CardDescription>Complete your admin setup</CardDescription>
            </CardHeader>
            <CardContent>
              {promoteSuccess ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded">
                    <p className="text-green-900 font-semibold mb-2">Success!</p>
                    <p className="text-sm text-green-800 mb-4">
                      You are now an admin! You can access the admin dashboard and start managing products and orders.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link href="/admin/dashboard">Go to Admin Dashboard</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full bg-transparent">
                      <Link href="/">Back Home</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                    <p className="text-blue-900 text-sm mb-2">
                      <strong>Before proceeding:</strong> Make sure you've confirmed your email by clicking the link
                      sent to your inbox.
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Click the button below to add your account to the admin users list. You'll then be able to access
                    the admin dashboard.
                  </p>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <div className="flex gap-3">
                    <Button onClick={handlePromoteToAdmin} className="flex-1" disabled={isLoading}>
                      {isLoading ? "Promoting..." : "Promote to Admin"}
                    </Button>
                    <Button variant="outline" onClick={() => setStep("signup")}>
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

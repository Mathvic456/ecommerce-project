"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

function ConfirmResultContent() {
  const searchParams = useSearchParams()
  const status = searchParams.get("status")
  const message = searchParams.get("message")
  const isAdmin = searchParams.get("admin") === "true"
  
  const [email, setEmail] = useState("")
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmResult, setConfirmResult] = useState<{ success: boolean; message: string } | null>(null)
  
  const redirectUrl = isAdmin ? "/admin/login" : "/auth/login"
  const signupUrl = isAdmin ? "/admin/signup" : "/auth/sign-up"
  
  const handleManualConfirm = async () => {
    if (!email) return
    
    setIsConfirming(true)
    setConfirmResult(null)
    
    try {
      const response = await fetch("/api/auth/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, isAdmin }),
      })
      
      const data = await response.json()
      setConfirmResult({ success: data.success, message: data.message || data.error })
    } catch (err) {
      setConfirmResult({ success: false, message: err instanceof Error ? err.message : "An error occurred" })
    } finally {
      setIsConfirming(false)
    }
  }
  
  // Success state
  if (status === "success" || confirmResult?.success) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <svg
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-light tracking-tight mb-2">Email Confirmed</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Your email has been confirmed successfully. You can now sign in to your account.
          </p>
          <Button asChild className="w-full h-12">
            <Link href={redirectUrl}>Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }
  
  // Manual confirmation needed (PKCE issue)
  if (status === "manual" || status === "error" || status === "expired" || status === "invalid") {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20 mb-4">
              <svg
                className="h-8 w-8 text-amber-600 dark:text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-light tracking-tight mb-2">
              {status === "manual" ? "Confirmation Required" : "Confirmation Issue"}
            </h1>
            <p className="text-muted-foreground text-sm mb-2">
              {status === "manual" 
                ? "You opened this link in a different browser. Enter your email to confirm your account."
                : message || "There was an issue confirming your email."}
            </p>
          </div>
          
          {confirmResult && !confirmResult.success && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {confirmResult.message}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter the email you signed up with"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
              />
            </div>
            
            <Button 
              className="w-full h-12"
              onClick={handleManualConfirm}
              disabled={!email || isConfirming}
            >
              {isConfirming ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                  Confirming...
                </>
              ) : (
                "Confirm My Email"
              )}
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            
            <Button asChild variant="outline" className="w-full h-12 bg-transparent">
              <Link href={redirectUrl}>Try Signing In</Link>
            </Button>
            
            <Button asChild variant="ghost" className="w-full h-12 text-muted-foreground">
              <Link href={signupUrl}>Sign Up Again</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  // Loading/default state
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-md text-center">
        <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-muted border-t-foreground mb-4" />
        <p className="text-muted-foreground">Processing...</p>
      </div>
    </div>
  )
}

export default function ConfirmResultPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-md text-center">
          <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-muted border-t-foreground mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ConfirmResultContent />
    </Suspense>
  )
}

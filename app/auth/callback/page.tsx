"use client"

import { Suspense, useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function CallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)
  const hasProcessed = useRef(false)

  useEffect(() => {
    // Prevent double execution
    if (hasProcessed.current) return
    hasProcessed.current = true

    const handleCallback = async () => {
      try {
        console.log("[v0] Callback - URL:", window.location.href)
        
        const code = searchParams.get("code")
        const error_code = searchParams.get("error_code")
        const error_description = searchParams.get("error_description")
        const type = searchParams.get("type")
        
        console.log("[v0] Callback params - code:", !!code, "error:", error_code, "type:", type)
        
        // Handle errors from Supabase
        if (error_code || error_description) {
          console.log("[v0] Callback error from Supabase:", error_description)
          setError(error_description || `Authentication error: ${error_code}`)
          return
        }

        // If this is an email confirmation redirect, send to confirm page
        if (type === "signup" || type === "email" || type === "magiclink") {
          console.log("[v0] Redirecting to confirm page for type:", type)
          router.push(`/auth/confirm?${searchParams.toString()}`)
          return
        }

        if (code) {
          console.log("[v0] Exchanging code for session")
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.log("[v0] Code exchange error:", exchangeError.message)
            setError(exchangeError.message)
            return
          }
          
          console.log("[v0] Code exchange success, user:", data.user?.id)
        }

        // Check if we have a session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          console.log("[v0] Session found, redirecting to account")
          router.push("/account")
        } else {
          console.log("[v0] No session found, redirecting to login")
          router.push("/auth/login")
        }
      } catch (err) {
        console.error("[v0] Callback exception:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      }
    }

    handleCallback()
  }, [searchParams, supabase, router])

  if (error) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <svg
                className="h-8 w-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-light tracking-tight mb-2">Authentication Error</h1>
          <p className="text-muted-foreground text-sm mb-6">{error}</p>
          <div className="space-y-3">
            <Button asChild className="w-full h-12">
              <Link href="/auth/login">Go to Login</Link>
            </Button>
            <Button asChild variant="outline" className="w-full h-12 bg-transparent">
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Processing...</CardTitle>
            <CardDescription>Please wait while we complete your authentication</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Loading...</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}

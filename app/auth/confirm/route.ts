import { type NextRequest, NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get("token_hash")
  const type = requestUrl.searchParams.get("type")
  const code = requestUrl.searchParams.get("code")
  
  const baseUrl = requestUrl.origin
  
  try {
    const supabaseAdmin = getAdminClient()
    
    // Handle token_hash flow (OTP verification)
    if (token_hash && type) {
      // Use admin API to verify the token
      const { error: verifyError } = await supabaseAdmin.auth.verifyOtp({
        token_hash,
        type: type as "signup" | "email" | "magiclink",
      })
      
      if (verifyError) {
        // Check if user is already confirmed
        if (verifyError.message.includes("expired") || verifyError.message.includes("invalid")) {
          const errorUrl = new URL(`${baseUrl}/auth/confirm-result`, baseUrl)
          errorUrl.searchParams.set("status", "expired")
          errorUrl.searchParams.set("message", "This link has expired or already been used.")
          return NextResponse.redirect(errorUrl)
        }
        
        const errorUrl = new URL(`${baseUrl}/auth/confirm-result`, baseUrl)
        errorUrl.searchParams.set("status", "error")
        errorUrl.searchParams.set("message", verifyError.message)
        return NextResponse.redirect(errorUrl)
      }
      
      const successUrl = new URL(`${baseUrl}/auth/confirm-result`, baseUrl)
      successUrl.searchParams.set("status", "success")
      return NextResponse.redirect(successUrl)
    }
    
    // Handle PKCE code flow - exchange server-side
    if (code) {
      // In this setup, we don't handle PKCE exchange in the confirmation route
      // Instead, we redirect to a result page that explains how to proceed
      const manualUrl = new URL(`${baseUrl}/auth/confirm-result`, baseUrl)
      manualUrl.searchParams.set("status", "manual")
      manualUrl.searchParams.set("code", code)
      return NextResponse.redirect(manualUrl)
    }
    
    // No valid parameters
    const errorUrl = new URL(`${baseUrl}/auth/confirm-result`, baseUrl)
    errorUrl.searchParams.set("status", "invalid")
    errorUrl.searchParams.set("message", "Invalid confirmation link")
    return NextResponse.redirect(errorUrl)
    
  } catch (err) {
    const errorUrl = new URL(`${baseUrl}/auth/confirm-result`, baseUrl)
    errorUrl.searchParams.set("status", "error")
    errorUrl.searchParams.set("message", err instanceof Error ? err.message : "An error occurred")
    return NextResponse.redirect(errorUrl)
  }
}

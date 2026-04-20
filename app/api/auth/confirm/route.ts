import { type NextRequest, NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const isAdmin = searchParams.get("admin") === "true"

  const redirectBase = request.nextUrl.origin
  const successUrl = isAdmin ? "/admin/login" : "/auth/login"
  const errorUrl = "/auth/confirm"

  // If there's a code parameter, we can't handle it server-side without the PKCE verifier
  // Redirect to the client-side confirm page which will try to exchange it
  if (code && !token_hash) {
    const params = new URLSearchParams(searchParams)
    return NextResponse.redirect(`${redirectBase}${errorUrl}?${params.toString()}`)
  }

  // Handle token_hash verification using admin client
  if (token_hash && type) {
    try {
      const adminClient = getAdminClient()

      // For signup/email confirmation with token_hash, we need to verify the OTP
      // The admin client can't directly verify OTPs, but we can use it to
      // check the user's status and update if needed

      // First, try to decode information from the token (if possible)
      // Since we can't verify the token server-side without the regular client,
      // redirect to client-side with the parameters
      const params = new URLSearchParams()
      params.set("token_hash", token_hash)
      params.set("type", type)
      if (isAdmin) params.set("admin", "true")

      return NextResponse.redirect(`${redirectBase}${errorUrl}?${params.toString()}`)
    } catch (error) {
      console.error("[API] Confirm error:", error)
      return NextResponse.redirect(
        `${redirectBase}${errorUrl}?error=verification_failed&message=${encodeURIComponent("Unable to verify email")}`
      )
    }
  }

  // No valid parameters - redirect to error
  return NextResponse.redirect(
    `${redirectBase}${errorUrl}?error=invalid_link&message=${encodeURIComponent("Invalid confirmation link")}`
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, isAdmin } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const adminClient = getAdminClient()

    // Look up the user by email
    const { data: users, error: listError } = await adminClient.auth.admin.listUsers()

    if (listError) {
      console.error("[API] List users error:", listError)
      return NextResponse.json({ error: "Unable to verify user" }, { status: 500 })
    }

    const user = users.users.find((u) => u.email === email)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Helper function to add user to admin_users table
    const promoteToAdmin = async (userId: string) => {
      console.log("[v0] Attempting to promote user to admin:", userId)
      
      // First check if already an admin
      const { data: existingAdmin, error: checkError } = await adminClient
        .from("admin_users")
        .select("id")
        .eq("id", userId)
        .maybeSingle()
      
      if (checkError) {
        console.log("[v0] Error checking existing admin:", checkError)
      }
      
      if (existingAdmin) {
        console.log("[v0] User is already an admin")
        return { success: true, alreadyAdmin: true }
      }
      
      // Insert into admin_users
      const { data: insertData, error: insertError } = await adminClient
        .from("admin_users")
        .insert({ id: userId })
        .select()
      
      if (insertError) {
        console.error("[v0] Admin insert error:", insertError)
        return { success: false, error: insertError }
      }
      
      console.log("[v0] Successfully added to admin_users:", insertData)
      return { success: true, data: insertData }
    }

    // Check if user is already confirmed
    if (user.email_confirmed_at) {
      console.log("[v0] User already confirmed, email:", email)
      
      // User is already confirmed - if admin signup, promote them
      if (isAdmin) {
        const result = await promoteToAdmin(user.id)
        if (!result.success) {
          console.error("[v0] Failed to promote existing user to admin")
        }
      }

      return NextResponse.json({
        success: true,
        message: "Email already confirmed. You can now sign in.",
        confirmed: true,
      })
    }

    // Manually confirm the user's email using admin client
    console.log("[v0] Confirming user email for:", user.id)
    const { data: updatedUser, error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    })

    if (updateError) {
      console.error("[v0] Update user error:", updateError)
      return NextResponse.json({ error: "Unable to confirm email" }, { status: 500 })
    }

    console.log("[v0] User email confirmed successfully")

    // If admin signup, promote to admin
    if (isAdmin) {
      const result = await promoteToAdmin(user.id)
      if (!result.success) {
        console.error("[v0] Failed to promote to admin after confirmation")
      }
    }

    return NextResponse.json({
      success: true,
      message: "Email confirmed successfully",
      confirmed: true,
      userId: updatedUser.user.id,
    })
  } catch (error) {
    console.error("[API] Confirm POST error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    )
  }
}

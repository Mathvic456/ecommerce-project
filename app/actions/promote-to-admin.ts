"use server"

import { getAdminClient } from "@/lib/supabase/admin"

export async function promoteUserToAdmin(email: string) {
  console.log("[v0] Starting promotion for email:", email)

  try {
    if (!email) {
      return { error: "Email is required" }
    }

    const adminClient = getAdminClient()

    const { data: userData, error: userError } = await adminClient.auth.admin.listUsers()

    if (userError) {
      console.log("[v0] Failed to fetch users:", userError)
      return { error: "Failed to fetch users from database" }
    }

    const user = userData?.users?.find((u) => u.email === email)

    if (!user) {
      console.log("[v0] User not found with email:", email)
      return { error: "User not found. Please make sure you signed up with this email." }
    }

    console.log("[v0] Found user:", user.email, "ID:", user.id, "Confirmed:", user.email_confirmed_at)

    if (!user.email_confirmed_at) {
      console.log("[v0] Email not confirmed for user:", email)
      return { error: "Email not confirmed. Please click the confirmation link in your email first." }
    }

    const { error: adminError } = await adminClient
      .from("admin_users")
      .insert([{ id: user.id }])
      .select()

    if (adminError) {
      console.log("[v0] Admin insert error:", adminError)

      // Check if it's a duplicate key error
      if (adminError.code === "23505" || adminError.message?.includes("duplicate")) {
        console.log("[v0] User already an admin")
        return { success: true, message: "User is already an admin" }
      }

      return { error: `Failed to promote to admin: ${adminError.message}` }
    }

    console.log("[v0] Successfully promoted user to admin")
    return { success: true, message: "Successfully promoted to admin!" }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error occurred"
    console.log("[v0] Promotion error:", errorMsg)
    return { error: errorMsg }
  }
}

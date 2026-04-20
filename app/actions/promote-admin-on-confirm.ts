"use server"
import { getAdminClient } from "@/lib/supabase/admin"

export async function promoteUserToAdmin(userId: string) {
  try {
    console.log("[v0] PROMOTE START - userId:", userId)

    if (!userId) {
      console.log("[v0] ERROR: No userId provided")
      return { success: false, error: "No user ID provided" }
    }

    const adminClient = getAdminClient()
    console.log("[v0] Admin client created")

    const { data, error } = await adminClient
      .from("admin_users")
      .insert([{ id: userId }])
      .select()

    console.log("[v0] Insert response - data:", data, "error:", error, "error code:", error?.code)

    if (error) {
      if (error.code === "23505") {
        // Duplicate key error - user already exists
        console.log("[v0] User already exists in admin_users")
        return { success: true, message: "User already admin" }
      }
      console.log("[v0] Error inserting admin user:", error.message, error.details)
      return { success: false, error: `Insert failed: ${error.message}` }
    }

    console.log("[v0] Successfully inserted admin user")
    return { success: true, message: "User promoted to admin" }
  } catch (error) {
    console.error("[v0] PROMOTE EXCEPTION:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    }
  }
}

"use server"

import { createClient } from "@/lib/supabase/server"
import { getAdminCount } from "@/lib/supabase/permissions"
import { getAdminClient } from "@/lib/supabase/admin"

export async function setupFirstAdmin(email: string, password: string) {
  try {
    // 1. Double check that no admins exist (Server-side security guard)
    const count = await getAdminCount()
    if (count > 0) {
      return { success: false, error: "Setup has already been completed." }
    }

    const supabase = await createClient()
    const supabaseAdmin = getAdminClient()

    // 2. Sign up the user using the Admin API for better control
    const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (signUpError) {
      return { success: false, error: signUpError.message }
    }

    if (!signUpData.user) {
      return { success: false, error: "Failed to create user account." }
    }

    // 4. Synchronization Delay
    // Give Postgres a moment to propagate the auth user before the foreign key check
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 5. Add to admin_users table
    const { error: adminError } = await supabaseAdmin
      .from("admin_users")
      .insert({ id: signUpData.user.id })

    if (adminError) {
      console.error("Error promoting first user to admin:", adminError)
      return { success: false, error: `Account created but failed to grant admin permissions: ${adminError.message}` }
    }

    return { 
      success: true, 
      message: "First admin account initialized successfully! You can now log in."
    }
  } catch (error) {
    console.error("Setup error:", error)
    return { success: false, error: "An unexpected error occurred during setup." }
  }
}

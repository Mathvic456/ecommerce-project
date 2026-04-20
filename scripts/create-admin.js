import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const adminEmail = "vmatthew727@gmail.com"
const adminPassword = "computer"

async function createAdmin() {
  try {
    console.log("Creating admin user...")

    // Create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email
    })

    if (authError) {
      console.error("Error creating auth user:", authError.message)
      process.exit(1)
    }

    console.log("Auth user created:", authData.user.id)

    // Add to admin_users table
    const { error: adminError } = await supabase.from("admin_users").insert([{ id: authData.user.id }])

    if (adminError) {
      console.error("Error adding to admin_users table:", adminError.message)
      process.exit(1)
    }

    console.log("\n✅ Admin account created successfully!\n")
    console.log("Admin Email:", adminEmail)
    console.log("Admin Password:", adminPassword)
    console.log("\nYou can now login at: /admin/login")
  } catch (error) {
    console.error("Unexpected error:", error)
    process.exit(1)
  }
}

createAdmin()

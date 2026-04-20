import { createClient } from "./server"

/**
 * Checks if the current user has admin privileges.
 * This should be used in Server Components and Server Actions.
 */
export async function checkIsAdmin() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { isAdmin: false, user: null }
  }

  const { data: adminUser, error: queryError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (queryError || !adminUser) {
    return { isAdmin: false, user }
  }

  return { isAdmin: true, user }
}

/**
 * Returns the count of admins in the system.
 * Useful for the one-time setup check.
 */
export async function getAdminCount() {
  const supabase = await createClient()
  
  // Note: We use count: 'exact' and a limit of 1 if we only care if any exist,
  // but for setup we want to be sure it's 0.
  const { count, error } = await supabase
    .from("admin_users")
    .select("*", { count: "exact", head: true })

  if (error) {
    console.error("Error fetching admin count:", error)
    return 1 // Assume admins exist on error to be safe
  }

  return count || 0
}

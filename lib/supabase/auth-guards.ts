import { redirect } from "next/navigation"
import { checkIsAdmin } from "./permissions"
import { createClient } from "./server"

/**
 * Ensures the user is an admin or redirects them.
 * Use this in Server Components and Server Actions.
 */
export async function requireAdmin() {
  const { isAdmin } = await checkIsAdmin()
  
  if (!isAdmin) {
    redirect("/admin/unauthorized")
  }
}

/**
 * Ensures the user is authenticated or redirects to login.
 */
export async function requireAuth(redirectTo: string = "/auth/login") {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect(redirectTo)
  }
  
  return user
}

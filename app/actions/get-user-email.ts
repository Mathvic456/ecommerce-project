"use server"

import { getAdminClient } from "@/lib/supabase/admin"

export async function getUserEmail(userId: string): Promise<string> {
  try {
    const adminClient = getAdminClient()
    
    // Use admin client to get user from auth
    const { data, error } = await adminClient.auth.admin.getUserById(userId)
    
    if (error || !data.user) {
      console.error("Error fetching user email:", error)
      return "Not available"
    }
    
    return data.user.email || "Not available"
  } catch (error) {
    console.error("Error in getUserEmail:", error)
    return "Not available"
  }
}

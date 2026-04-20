import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { checkIsAdmin } from "@/lib/supabase/permissions"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headerList = await headers()
  const pathname = headerList.get("x-pathname") || ""
  
  // Routes that shouldn't have the admin layout or guards
  // Note: Middleware protects /admin/* generally, but we check here too for defense in depth.
  const isPublicAdminRoute = 
    pathname.includes("/admin/login") || 
    pathname.includes("/admin/unauthorized") || 
    pathname.includes("/admin/first-admin-setup")

  if (isPublicAdminRoute) {
    return <>{children}</>
  }

  // Server-side admin check
  const { isAdmin, user } = await checkIsAdmin()

  if (!isAdmin) {
    // If not admin, redirect to login or unauthorized
    if (!user) {
      redirect("/admin/login")
    } else {
      redirect("/admin/unauthorized")
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar user={user} />
      <main className="flex-1 overflow-auto p-6 md:p-10">
        {children}
      </main>
    </div>
  )
}

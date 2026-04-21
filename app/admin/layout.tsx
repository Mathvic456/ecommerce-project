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
  const isPublicAdminRoute = [
    "/admin/login", 
    "/admin/unauthorized", 
    "/admin/first-admin-setup"
  ].some(route => pathname === route || pathname.startsWith(route + "/"))

  // Server-side admin check
  const { isAdmin, user } = await checkIsAdmin()

  // If it's a public route, just show the content (no sidebar)
  if (isPublicAdminRoute) {
    return <>{children}</>
  }

  if (!isAdmin) {
    // If not admin, redirect to login or unauthorized
    if (!user) {
      redirect("/admin/login")
    } else {
      // If we are already on unauthorized, just show it
      if (pathname.includes("/admin/unauthorized")) {
        return <>{children}</>
      }
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

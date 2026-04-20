import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })
  
  // Set x-pathname header for server components
  supabaseResponse.headers.set("x-pathname", request.nextUrl.pathname)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()

  // --- PROTECTED ROUTES LOGIC ---
  const url = new URL(request.url)
  
  // Protect /admin routes
  if (url.pathname.startsWith("/admin")) {
    // List of admin routes that DON'T require authentication
    const publicAdminRoutes = [
      "/admin/login", 
      "/admin/unauthorized", 
      "/admin/first-admin-setup"
    ]
    
    if (!user && !publicAdminRoutes.includes(url.pathname)) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }
  
  // Protect /account routes
  if (url.pathname.startsWith("/account") && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return supabaseResponse
}

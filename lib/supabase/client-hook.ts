"use client"

import { useMemo } from "react"
import { createBrowserClient } from "@supabase/ssr"

export function useSupabaseClient() {
  const supabase = useMemo(() => {
    // Only create the client in the browser
    if (typeof window === "undefined") {
      return null
    }
    
    try {
      return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    } catch (error) {
      console.error("Failed to create Supabase client:", error)
      return null
    }
  }, [])

  return supabase
}
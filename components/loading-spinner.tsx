"use client"

import { Spinner } from "@/components/ui/spinner"

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <Spinner className="size-8" />
      <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
    </div>
  )
}

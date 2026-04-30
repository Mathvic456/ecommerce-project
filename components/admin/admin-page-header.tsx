"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"

interface AdminPageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  showBackButton?: boolean
  backTo?: string
}

export function AdminPageHeader({ 
  title, 
  description, 
  action,
  showBackButton = true,
  backTo = "/admin/dashboard"
}: AdminPageHeaderProps) {
  const router = useRouter()

  return (
    <div className="space-y-4 mb-8">
      {showBackButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(backTo)}
          className="flex items-center gap-2 -ml-2"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Button>
      )}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  )
}

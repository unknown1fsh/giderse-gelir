'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LayoutDashboard } from 'lucide-react'

interface NavigationButtonsProps {
  backHref?: string
  backLabel?: string
  showDashboard?: boolean
}

export default function NavigationButtons({
  backHref,
  backLabel = 'Geri',
  showDashboard = true,
}: NavigationButtonsProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {backHref && (
        <Link href={backHref}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backLabel}
          </Button>
        </Link>
      )}
      {showDashboard && (
        <Link href="/dashboard">
          <Button
            variant="outline"
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </Link>
      )}
    </div>
  )
}

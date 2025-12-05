'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import TicketForm from '@/components/help/ticket-form'

export default function NewTicketPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/help/tickets">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yeni Destek Talebi</h1>
          <p className="text-gray-600 mt-1">
            Sorununuzu detaylı bir şekilde açıklayın, size en kısa sürede yardımcı olacağız
          </p>
        </div>
      </div>

      <TicketForm />
    </div>
  )
}


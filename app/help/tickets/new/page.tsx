'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import NavigationButtons from '@/components/help/navigation-buttons'
import TicketForm from '@/components/help/ticket-form'
import { MessageSquare, Plus } from 'lucide-react'

export default function NewTicketPage() {
  return (
    <div className="space-y-6 pb-8">
      {/* Navigation Buttons */}
      <NavigationButtons backHref="/help/tickets" backLabel="Destek Taleplerine Dön" />

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Plus className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Yeni Destek Talebi</h1>
              <p className="text-lg md:text-xl text-white/90">
                Sorununuzu detaylı bir şekilde açıklayın, size en kısa sürede yardımcı olacağız
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Talep Bilgileri</CardTitle>
              <CardDescription>Lütfen tüm alanları eksiksiz doldurun</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TicketForm />
        </CardContent>
      </Card>
    </div>
  )
}

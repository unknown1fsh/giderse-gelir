'use client'

import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import NavigationButtons from '@/components/help/navigation-buttons'
import TicketForm, { TicketFormPrefill, TicketPriority } from '@/components/help/ticket-form'
import { useSearchParams } from 'next/navigation'
import { getPlanById, getPlanPrice, isValidPlanId } from '@/lib/plan-config'
import { MessageSquare, Plus, Loader2 } from 'lucide-react'

function NewTicketPageContent() {
  const searchParams = useSearchParams()

  const intent = (searchParams.get('intent') || '').toLowerCase()
  const planIdRaw = searchParams.get('planId') || ''
  const planId = isValidPlanId(planIdRaw) ? planIdRaw : ''

  const company = searchParams.get('company') || ''
  const phone = searchParams.get('phone') || ''
  const extraMessage = searchParams.get('message') || ''
  const source = searchParams.get('source') || ''

  const prefill: TicketFormPrefill | undefined = (() => {
    if (intent !== 'membership') {
      return undefined
    }

    const now = new Date().toLocaleString('tr-TR')
    const planName =
      planId === 'enterprise_premium'
        ? 'Enterprise Premium'
        : planId === 'enterprise'
          ? 'Enterprise'
          : planId === 'premium'
            ? 'Premium'
            : 'Ücretli Üyelik'

    const price = planId ? getPlanPrice(planId) : 0
    const priceText = price > 0 ? `${price}₺/ay` : 'Özel fiyat'

    const subject =
      planId === 'premium'
        ? 'Premium üyelik satın alma talebi (premium istiyorum)'
        : planId === 'enterprise'
          ? 'Enterprise üyelik satın alma talebi'
          : planId === 'enterprise_premium'
            ? 'Enterprise Premium demo / iletişim talebi'
            : `${planName} üyelik talebi`

    const lines: string[] = []
    lines.push(`Merhaba, ${planName} üyelik talep ediyorum.`)
    if (planId) {
      const plan = getPlanById(planId)
      lines.push(`Plan: ${plan?.name || planId} (${planId})`)
      lines.push(`Fiyat: ${priceText}`)
    }
    if (company) {
      lines.push(`Şirket: ${company}`)
    }
    if (phone) {
      lines.push(`Telefon: ${phone}`)
    }
    if (extraMessage) {
      lines.push('')
      lines.push('Ek Not:')
      lines.push(extraMessage)
    }
    if (source) {
      lines.push('')
      lines.push(`Kaynak: ${source}`)
    }
    lines.push('')
    lines.push(`Tarih: ${now}`)

    const priority: TicketPriority =
      planId === 'enterprise_premium' ? 'high' : planId === 'enterprise' ? 'high' : 'medium'

    // Premium için kategori ipucu - önce "Premium" sonra "Üyelik" ara
    const categoryHint = planId === 'premium' ? 'Premium' : 'Üyelik'

    return {
      categoryHint,
      subject,
      description: lines.join('\n'),
      priority,
    }
  })()

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
          <TicketForm prefill={prefill} />
        </CardContent>
      </Card>
    </div>
  )
}

export default function NewTicketPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      }
    >
      <NewTicketPageContent />
    </Suspense>
  )
}

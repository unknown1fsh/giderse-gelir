'use client'

import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, PageHeader } from '@/components/mosaic'
import TicketForm, { TicketFormPrefill, TicketPriority } from '@/components/help/ticket-form'
import { useSearchParams } from 'next/navigation'
import { getPlanById, getPlanPrice } from '@/lib/plan-config'
import { MessageSquare, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function NewTicketPageContent() {
  const searchParams = useSearchParams()

  const intent = (searchParams.get('intent') || '').toLowerCase()
  const planId = searchParams.get('planId') || ''

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
      <PageHeader
        title="Yeni Destek Talebi"
        description="Sorununuzu detaylı bir şekilde açıklayın, size en kısa sürede yardımcı olacağız"
        breadcrumbs={
          <Link href="/help/tickets" className="flex items-center hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Destek Taleplerine Dön
          </Link>
        }
      />

      {/* Form Card */}
      <Card className="border-2 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
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
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        </div>
      }
    >
      <NewTicketPageContent />
    </Suspense>
  )
}

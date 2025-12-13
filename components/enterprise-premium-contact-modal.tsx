'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Send, CheckCircle2 } from 'lucide-react'
import { useUser } from '@/lib/user-context'

interface EnterprisePremiumContactModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planId?: 'enterprise' | 'enterprise_premium'
}

export function EnterprisePremiumContactModal({
  open,
  onOpenChange,
  planId = 'enterprise_premium',
}: EnterprisePremiumContactModalProps) {
  const router = useRouter()
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: '',
    phone: '',
    message: '',
  })

  const planLabel = useMemo(() => {
    return planId === 'enterprise' ? 'Enterprise' : 'Enterprise Premium'
  }, [planId])

  useEffect(() => {
    // Modal açılınca kategorileri çekip üyelik kategorisini otomatik seç
    if (!open) {
      return
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/help/categories')
        const result = (await response.json()) as {
          success: boolean
          data?: Array<{ id: number; name: string }>
        }

        if (!result.success || !result.data || result.data.length === 0) {
          setCategoryId(null)
          return
        }

        const normalize = (t: string) => t.toLocaleLowerCase('tr-TR')
        const hint = 'üyelik'
        const found =
          result.data.find(c => normalize(c.name).includes(hint)) ||
          result.data.find(c => normalize(c.name).includes('abonelik')) ||
          result.data.find(c => normalize(c.name).includes('premium')) ||
          result.data[0]

        setCategoryId(found.id)
      } catch {
        setCategoryId(null)
      }
    }

    void fetchCategories()
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!categoryId) {
        alert('Destek kategorisi bulunamadı. Lütfen admin panelinden destek kategorisi ekleyin.')
        return
      }

      const subject =
        planId === 'enterprise'
          ? 'Enterprise üyelik / demo talebi'
          : 'Enterprise Premium demo / iletişim talebi'

      const descriptionLines: string[] = [
        `Merhaba, ${planLabel} için iletişim/demoya ihtiyacım var.`,
        '',
        `Ad Soyad: ${formData.name}`,
        `E-posta: ${formData.email}`,
        `Şirket: ${formData.company}`,
        `Telefon: ${formData.phone}`,
      ]

      if (formData.message) {
        descriptionLines.push('', 'Mesaj:', formData.message)
      }

      descriptionLines.push('', `PlanId: ${planId}`)

      const response = await fetch('/api/help/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId,
          subject,
          description: descriptionLines.join('\n'),
          priority: 'high',
        }),
      })

      if (response.ok) {
        const result = (await response.json()) as { success?: boolean; data?: { id?: number } }
        setIsSuccess(true)
        setTimeout(() => {
          onOpenChange(false)
          const ticketId = result?.data?.id
          if (ticketId) {
            router.push(`/help/tickets/${ticketId}`)
          } else {
            router.push('/help/tickets')
          }
        }, 3000)
      } else {
        const data = (await response.json()) as { error?: string }
        alert(data.error || 'Bir hata oluştu. Lütfen tekrar deneyin.')
      }
    } catch (error) {
      console.error('Payment request error:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">Talebiniz Alındı!</DialogTitle>
            <DialogDescription className="text-center text-lg">
              {planLabel} talebiniz destek kaydı olarak alındı. Ekibimiz en kısa sürede sizinle iletişime
              geçecektir.
            </DialogDescription>
            <p className="text-sm text-slate-600 text-center">
              Yönlendiriliyorsunuz...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            {planLabel} İletişim
          </DialogTitle>
          <DialogDescription>
            Lütfen bilgilerinizi paylaşın, ekibimiz en kısa sürede sizinle iletişime geçsin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ad Soyad *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Adınız ve soyadınız"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-posta *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ornek@sirket.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Şirket Adı *</Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Şirket adınız"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+90 (5XX) XXX XX XX"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mesajınız</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Lütfen ihtiyaçlarınızı ve beklentilerinizi kısaca açıklayın..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                Destek Talebi Gönder
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


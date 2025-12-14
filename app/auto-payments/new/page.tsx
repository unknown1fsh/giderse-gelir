'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Home } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface ReferenceData {
  categories: Array<{
    id: number
    name: string
    code: string
    txTypeId: number
    txTypeName: string
    icon?: string | null
    color?: string | null
    isDefault: boolean
  }>
  paymentMethods: Array<{
    id: number
    code: string
    name: string
    description?: string | null
  }>
  accounts: Array<{
    id: number
    name: string
    accountType: { id: number; name: string } | null
    bank: { id: number; name: string }
    currency: { id: number; code: string; name: string }
  }>
  creditCards: Array<{
    id: number
    name: string
    bank: { id: number; name: string }
    currency: { id: number; code: string; name: string }
  }>
  currencies: Array<{ id: number; code: string; name: string; symbol: string }>
}

export default function NewAutoPaymentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    frequency: '',
    nextPaymentDate: '',
    endDate: '',
    categoryId: '',
    accountId: '',
    creditCardId: '',
  })
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReferenceData() {
      try {
        const response = await fetch('/api/reference-data')
        if (response.ok) {
          const data = await response.json()
          setReferenceData({
            categories: data.categories || [],
            paymentMethods: data.paymentMethods || [],
            accounts: data.accounts || [],
            creditCards: data.creditCards || [],
            currencies: data.currencies || [],
          })
        } else {
          setError('Referans verileri yüklenemedi')
        }
      } catch (error) {
        console.error('Referans verileri yüklenirken hata:', error)
        setError('Referans verileri yüklenirken hata oluştu')
      } finally {
        setLoading(false)
      }
    }
    fetchReferenceData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        categoryId: parseInt(formData.categoryId),
        accountId: formData.accountId ? parseInt(formData.accountId) : null,
        creditCardId: formData.creditCardId ? parseInt(formData.creditCardId) : null,
        endDate: formData.endDate || null,
      }

      const response = await fetch('/api/auto-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        router.push('/auto-payments')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Otomatik ödeme oluşturulamadı')
      }
    } catch (error) {
      console.error('Otomatik ödeme oluşturulurken hata:', error)
      setError('Otomatik ödeme oluşturulurken bir hata oluştu.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Home className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Yeni Otomatik Ödeme</h1>
          <p className="text-muted-foreground">Yeni bir otomatik ödeme talimatı ekleyin</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Otomatik Ödeme Bilgileri</CardTitle>
          <CardDescription>Lütfen otomatik ödeme talimatının detaylarını girin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Ödeme Adı *</label>
              <Input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Örn: Kira Ödemesi"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Açıklama (Opsiyonel)</label>
              <Textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Ek bilgiler, notlar..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tutar (TRY) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Örn: 5000.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sıklık *</label>
                <Select
                  value={formData.frequency}
                  onValueChange={value => setFormData(prev => ({ ...prev, frequency: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sıklık seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKLY">Haftalık</SelectItem>
                    <SelectItem value="MONTHLY">Aylık</SelectItem>
                    <SelectItem value="YEARLY">Yıllık</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">İlk Ödeme Tarihi *</label>
                <Input
                  type="date"
                  value={formData.nextPaymentDate}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, nextPaymentDate: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bitiş Tarihi (Opsiyonel)</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Kategori *</label>
              <Select
                value={formData.categoryId}
                onValueChange={value => setFormData(prev => ({ ...prev, categoryId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {referenceData?.categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Hesap (Opsiyonel)</label>
                <Select
                  value={formData.accountId}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, accountId: value, creditCardId: '' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Hesap seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {referenceData?.accounts.map(account => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.name} - {account.bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Kredi Kartı (Opsiyonel)</label>
                <Select
                  value={formData.creditCardId}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, creditCardId: value, accountId: '' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kredi kartı seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {referenceData?.creditCards.map(card => (
                      <SelectItem key={card.id} value={card.id.toString()}>
                        {card.name} - {card.bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
              disabled={saving}
            >
              {saving ? 'Kaydediliyor...' : 'Otomatik Ödeme Oluştur'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

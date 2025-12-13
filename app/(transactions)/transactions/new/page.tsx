'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { parseCurrencyInput } from '@/lib/validators'
import PremiumUpgradeModal from '@/components/premium-upgrade-modal'
import { ArrowLeft, Save } from 'lucide-react'

interface ReferenceData {
  txTypes: Array<{
    id: number
    code: string
    name: string
    icon?: string | null
    color?: string | null
  }>
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

export default function NewTransactionPage() {
  const router = useRouter()
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [limitInfo, setLimitInfo] = useState<{
    current: number
    limit: number
    type: 'transaction' | 'analysis' | 'export'
  } | null>(null)

  const [formData, setFormData] = useState({
    txTypeId: 0,
    categoryId: 0,
    paymentMethodId: 0,
    accountId: 0,
    creditCardId: 0,
    amount: '',
    currencyId: 0,
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
    tags: '',
  })

  useEffect(() => {
    async function fetchReferenceData() {
      try {
        const response = await fetch('/api/reference-data')
        if (response.ok) {
          const data = (await response.json()) as ReferenceData
          setReferenceData(data)

          // Varsayılan para birimini TRY yap
          if (data.currencies.length > 0) {
            const tryCurrency = data.currencies.find(c => c.code === 'TRY')
            if (tryCurrency) {
              setFormData(prev => ({ ...prev, currencyId: tryCurrency.id }))
            }
          }
          // NOT: txTypeId varsayılan YAPILMADI - kullanıcı seçmek zorunda!
        }
      } catch (error) {
        console.error('Referans verileri alınamadı:', error)
      } finally {
        setLoading(false)
      }
    }

    void fetchReferenceData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation kontrolü
    if (!formData.txTypeId || formData.txTypeId === 0) {
      alert('Lütfen işlem türünü seçiniz (Gelir veya Gider)')
      return
    }

    if (!formData.categoryId || formData.categoryId === 0) {
      alert('Lütfen kategori seçiniz')
      return
    }

    if (!formData.paymentMethodId || formData.paymentMethodId === 0) {
      alert('Lütfen ödeme yöntemini seçiniz')
      return
    }

    if (!formData.accountId && !formData.creditCardId) {
      alert('Lütfen hesap veya kredi kartı seçiniz')
      return
    }

    setSaving(true)

    try {
      const submitData: Record<string, unknown> = {
        txTypeId: formData.txTypeId,
        categoryId: formData.categoryId,
        paymentMethodId: formData.paymentMethodId,
        amount: parseCurrencyInput(formData.amount),
        currencyId: formData.currencyId,
        transactionDate: formData.transactionDate,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
      }

      // Sadece seçiliyse ekle (0 değilse)
      if (formData.accountId > 0) {
        submitData.accountId = formData.accountId
      }
      if (formData.creditCardId > 0) {
        submitData.creditCardId = formData.creditCardId
      }
      if (formData.description) {
        submitData.description = formData.description
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        router.push('/transactions')
      } else {
        const error = (await response.json()) as {
          limitReached?: boolean
          currentCount?: number
          limit?: number
          error?: string
        }
        if (error.limitReached) {
          // Limit aşıldığında çekici modal göster
          setLimitInfo({
            current: error.currentCount || 50,
            limit: error.limit || 50,
            type: 'transaction',
          })
          setShowPremiumModal(true)
        } else {
          alert(`Hata: ${error.error || 'İşlem eklenemedi'}`)
        }
      }
    } catch (error) {
      console.error('İşlem kaydedilemedi:', error)
      alert('İşlem kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  const filteredCategories =
    referenceData?.categories.filter(cat => cat.txTypeId === formData.txTypeId) || []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Yeni İşlem</h1>
          <p className="text-muted-foreground">Gelir veya gider işlemi ekleyin</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>İşlem Bilgileri</CardTitle>
          <CardDescription>İşlem detaylarını doldurun</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={e => {
              void handleSubmit(e)
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">İşlem Türü *</label>
                <select
                  value={formData.txTypeId}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      txTypeId: parseInt(e.target.value),
                      categoryId: 0, // Kategoriyi sıfırla
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value={0}>Seçiniz</option>
                  {referenceData?.txTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Kategori *</label>
                <select
                  value={formData.categoryId}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      categoryId: parseInt(e.target.value),
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value={0}>Seçiniz</option>
                  {filteredCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tutar *</label>
                <input
                  type="text"
                  value={formData.amount}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  placeholder="0,00"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Para Birimi *</label>
                <select
                  value={formData.currencyId}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      currencyId: parseInt(e.target.value),
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!referenceData?.currencies || referenceData.currencies.length === 0}
                >
                  <option value={0}>Seçiniz</option>
                  {referenceData?.currencies && referenceData.currencies.length > 0 ? (
                    referenceData.currencies.map(currency => (
                      <option key={currency.id} value={currency.id}>
                        {currency.code} - {currency.name}
                      </option>
                    ))
                  ) : (
                    <option value={0} disabled>
                      Para birimleri yükleniyor...
                    </option>
                  )}
                </select>
                {(!referenceData?.currencies || referenceData.currencies.length === 0) && (
                  <p className="text-xs text-red-600 mt-1">
                    Para birimleri yüklenemedi. Lütfen sayfayı yenileyin.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ödeme Yöntemi *</label>
                <select
                  value={formData.paymentMethodId}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      paymentMethodId: parseInt(e.target.value),
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value={0}>Seçiniz</option>
                  {referenceData?.paymentMethods.map(method => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tarih *</label>
                <input
                  type="date"
                  value={formData.transactionDate}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      transactionDate: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Hesap</label>
                <select
                  value={formData.accountId}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      accountId: parseInt(e.target.value),
                      creditCardId: 0, // Kredi kartını sıfırla
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={0}>Seçiniz</option>
                  {referenceData?.accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.bank.name} - {account.currency.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Kredi Kartı</label>
                <select
                  value={formData.creditCardId}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      creditCardId: parseInt(e.target.value),
                      accountId: 0, // Hesabı sıfırla
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={0}>Seçiniz</option>
                  {referenceData?.creditCards.map(card => (
                    <option key={card.id} value={card.id}>
                      {card.name} ({card.bank.name} - {card.currency.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Açıklama</label>
              <textarea
                value={formData.description}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="İşlem açıklaması..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Etiketler</label>
              <input
                type="text"
                value={formData.tags}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    tags: e.target.value,
                  }))
                }
                placeholder="etiket1, etiket2, etiket3"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-muted-foreground mt-1">Etiketleri virgülle ayırın</p>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Kaydet
                  </>
                )}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        featureName="Sınırsız İşlem"
        limitInfo={limitInfo ?? undefined}
      />
    </div>
  )
}

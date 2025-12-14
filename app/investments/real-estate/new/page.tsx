/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Building2 } from 'lucide-react'
import { parseCurrencyInput } from '@/lib/validators'
import type { Currency, ReferenceData } from '@/app/investments/types'

export default function NewRealEstateInvestmentPage() {
  const router = useRouter()
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: 'Konut',
    valuation: '',
    rentalIncome: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    currencyId: 0,
    notes: '',
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/reference-data')
        if (response.ok) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const data: ReferenceData = await response.json()
          setCurrencies(data.currencies)
          const tryCurrency = data.currencies.find((c: Currency) => c.code === 'TRY')
          if (tryCurrency) {
            setFormData(prev => ({ ...prev, currencyId: tryCurrency.id }))
          }
        }
      } catch (error) {
        console.error('Veriler yüklenirken hata:', error)
      } finally {
        setLoading(false)
      }
    }
    void fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const submitData = {
        investmentType: 'real-estate',
        name: formData.name,
        symbol: formData.name,
        quantity: 1,
        purchasePrice: parseCurrencyInput(formData.purchasePrice || formData.valuation || '0'),
        currentPrice: parseCurrencyInput(formData.valuation || formData.purchasePrice || '0'),
        purchaseDate: formData.purchaseDate,
        currencyId: formData.currencyId,
        category: formData.category,
        riskLevel: 'medium',
        notes: formData.notes,
        metadata: {
          valuation: formData.valuation,
          rentalIncome: formData.rentalIncome,
        },
      }

      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
        credentials: 'include',
      })
      if (response.ok) {
        alert('Gayrimenkul yatırımı eklendi')
        router.push('/investments')
      } else {
        const errorData = (await response.json()) as { error?: string }
        alert('Hata: ' + (errorData.error ?? 'Yatırım eklenemedi'))
      }
    } catch (error) {
      console.error('Yatırım eklenirken hata:', error)
      alert('Yatırım eklenirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6">Yükleniyor...</div>
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-red-600" />
            <h1 className="text-3xl font-bold text-red-700">Yeni Gayrimenkul</h1>
          </div>
          <p className="text-muted-foreground">Değerleme ve kira gelirini kaydedin</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-700">Gayrimenkul Bilgileri</CardTitle>
          <CardDescription>Detayları doldurun</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Ad *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Örn: 2+1 Daire"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Kategori</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                >
                  <option value="Konut">Konut</option>
                  <option value="Ticari">Ticari</option>
                  <option value="Arsa">Arsa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Değerleme (₺)</label>
                <input
                  type="text"
                  value={formData.valuation}
                  onChange={e => setFormData(prev => ({ ...prev, valuation: e.target.value }))}
                  placeholder="0,00"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Aylık Kira Geliri (₺)</label>
                <input
                  type="text"
                  value={formData.rentalIncome}
                  onChange={e => setFormData(prev => ({ ...prev, rentalIncome: e.target.value }))}
                  placeholder="0,00"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Alış Fiyatı (₺)</label>
                <input
                  type="text"
                  value={formData.purchasePrice}
                  onChange={e => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                  placeholder="0,00"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Alış Tarihi *</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={e => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Para Birimi</label>
                <select
                  value={formData.currencyId}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, currencyId: Number(e.target.value) }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                  disabled={currencies.length === 0}
                >
                  <option value={0}>Para birimi seçiniz</option>
                  {currencies.length > 0 ? (
                    currencies.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))
                  ) : (
                    <option value={0} disabled>
                      Para birimleri yükleniyor...
                    </option>
                  )}
                </select>
                {currencies.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    Para birimleri yüklenemedi. Lütfen sayfayı yenileyin.
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Notlar</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={saving}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {saving ? (
                  'Kaydediliyor...'
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Yatırımı Kaydet
                  </>
                )}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

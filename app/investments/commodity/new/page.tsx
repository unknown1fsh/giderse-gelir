/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Layers } from 'lucide-react'
import { parseCurrencyInput } from '@/lib/validators'
import type { Currency, ReferenceData } from '@/app/investments/types'

const DEFAULT_COMMODITIES = [
  { symbol: 'GC=F', name: 'Altın (Gold Futures)' },
  { symbol: 'SI=F', name: 'Gümüş (Silver Futures)' },
  { symbol: 'CL=F', name: 'Ham Petrol (Crude Oil WTI)' },
  { symbol: 'HG=F', name: 'Bakır (Copper Futures)' },
]

export default function NewCommodityInvestmentPage() {
  const router = useRouter()
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedCommodity, setSelectedCommodity] = useState(DEFAULT_COMMODITIES[0])

  const [formData, setFormData] = useState({
    quantity: '',
    purchasePrice: '',
    currentPrice: '',
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

  const handleFetchQuote = async () => {
    try {
      const res = await fetch(
        `/api/market/commodities/quote?symbol=${encodeURIComponent(selectedCommodity.symbol)}`
      )
      const data = (await res.json()) as { quote?: { price?: number } }
      const price = data?.quote?.price
      if (price) {
        setFormData(prev => ({ ...prev, currentPrice: String(price) }))
      }
    } catch (e) {
      console.error('Emtia fiyatı alınamadı', e)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const submitData = {
        investmentType: 'commodity',
        name: selectedCommodity.name,
        symbol: selectedCommodity.symbol,
        quantity: parseFloat(formData.quantity),
        purchasePrice: parseCurrencyInput(formData.purchasePrice),
        currentPrice: formData.currentPrice
          ? parseCurrencyInput(formData.currentPrice)
          : parseCurrencyInput(formData.purchasePrice),
        purchaseDate: formData.purchaseDate,
        currencyId: formData.currencyId,
        category: 'Emtia',
        riskLevel: 'medium',
        notes: formData.notes,
        metadata: {},
      }

      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
        credentials: 'include',
      })

      if (response.ok) {
        alert('Emtia yatırımı eklendi')
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
            <Layers className="h-6 w-6 text-amber-600" />
            <h1 className="text-3xl font-bold text-amber-700">Yeni Emtia Yatırımı</h1>
          </div>
          <p className="text-muted-foreground">Altın, petrol vb. enstrümanlar</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-amber-700">Emtia Bilgileri</CardTitle>
          <CardDescription>Detayları doldurun</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Emtia *</label>
                <select
                  value={selectedCommodity.symbol}
                  onChange={e =>
                    setSelectedCommodity(
                      DEFAULT_COMMODITIES.find(c => c.symbol === e.target.value) ??
                        DEFAULT_COMMODITIES[0]
                    )
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                >
                  {DEFAULT_COMMODITIES.map(c => (
                    <option key={c.symbol} value={c.symbol}>
                      {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => void handleFetchQuote()}
                  className="mt-2 text-sm text-amber-700 hover:underline"
                >
                  Güncel fiyatı getir
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Miktar *</label>
                <input
                  type="text"
                  value={formData.quantity}
                  onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="10"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Alış Fiyatı (₺) *</label>
                <input
                  type="text"
                  value={formData.purchasePrice}
                  onChange={e => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                  placeholder="0,00"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Güncel Fiyat (₺)</label>
                <input
                  type="text"
                  value={formData.currentPrice}
                  onChange={e => setFormData(prev => ({ ...prev, currentPrice: e.target.value }))}
                  placeholder="Alış fiyatı"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Alış Tarihi *</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={e => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
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
                className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
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

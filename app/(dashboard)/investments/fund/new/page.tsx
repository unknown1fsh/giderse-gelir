/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, PieChart } from 'lucide-react'
import { parseCurrencyInput } from '@/lib/validators'
import { useToast } from '@/lib/use-toast'
import type { MarketSearchResult } from '@/app/(dashboard)/investments/types'

interface SelectedFund {
  symbol: string
  name: string
}

export default function NewFundInvestmentPage() {
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<MarketSearchResult[]>([])
  const [selectedFund, setSelectedFund] = useState<SelectedFund | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    category: '',
    quantity: '',
    purchasePrice: '',
    currentPrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    currencyId: 1, // TRY default
    riskLevel: 'low' as 'low' | 'medium' | 'high',
    notes: '',
  })

  useEffect(() => {
    setLoading(false)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    async function search() {
      if (searchTerm.trim().length < 2) {
        setSearchResults([])
        return
      }
      try {
        const res = await fetch(`/api/market/funds/search?q=${encodeURIComponent(searchTerm)}`, {
          signal: controller.signal,
        })
        if (res.ok) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const data: { results?: MarketSearchResult[] } = await res.json()
          setSearchResults(data.results ?? [])
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          console.error('Fon arama hatası', e)
        }
      }
    }
    void search()
    return () => controller.abort()
  }, [searchTerm])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setSaving(true)

    try {
      const submitData = {
        investmentType: 'fund',
        name: selectedFund?.name || formData.name,
        symbol: selectedFund?.symbol || formData.symbol,
        quantity: parseFloat(formData.quantity),
        purchasePrice: parseCurrencyInput(formData.purchasePrice),
        currentPrice: formData.currentPrice
          ? parseCurrencyInput(formData.currentPrice)
          : parseCurrencyInput(formData.purchasePrice),
        purchaseDate: formData.purchaseDate,
        currencyId: formData.currencyId,
        category: formData.category || 'Yatırım Fonu',
        riskLevel: formData.riskLevel,
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
        toastSuccess('Başarılı', 'Yatırım fonu başarıyla eklendi')
        router.push('/investments')
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const errorData: { error?: string } = await response.json()
        toastError('Hata', errorData.error ?? 'Yatırım eklenemedi')
      }
    } catch (error) {
      console.error('Yatırım eklenirken hata:', error)
      toastError('Hata', 'Yatırım eklenirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleFetchQuote = async () => {
    if (!selectedFund?.symbol) {
      return
    }
    try {
      const r = await fetch(
        `/api/market/funds/quote?symbol=${encodeURIComponent(selectedFund.symbol)}`
      )
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const d: { quote?: { price?: number } } = await r.json()
      const p = d?.quote?.price
      if (p) {
        setFormData(prev => ({ ...prev, currentPrice: String(p) }))
      }
    } catch (e) {
      console.error('Fon quote hatası', e)
    }
  }

  if (loading) {
    return <div className="p-6">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="h-6 w-6 text-blue-500" />
            <h1 className="text-3xl font-bold text-blue-600">Yeni Yatırım Fonu</h1>
          </div>
          <p className="text-muted-foreground">Profesyonel yönetilen yatırım fonları</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-blue-600">Fon Bilgileri</CardTitle>
          <CardDescription>Yatırım fonunuzun detaylarını girin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium mb-2">Fon Ara</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Fon adı veya sembol"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-2 max-h-56 overflow-y-auto space-y-2">
                  {searchResults.map(item => (
                    <button
                      key={item.symbol}
                      type="button"
                      onClick={() => setSelectedFund({ symbol: item.symbol, name: item.name })}
                      className={`w-full p-3 border rounded-md text-left ${selectedFund?.symbol === item.symbol ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                    >
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        {item.symbol} • {item.exchange}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Fon Kodu</label>
                <input
                  type="text"
                  value={selectedFund?.symbol || formData.symbol}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))
                  }
                  placeholder="BIST100"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Kategori</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="Hisse Senedi Fonu">Hisse Senedi Fonu</option>
                  <option value="Borçlanma Araçları Fonu">Borçlanma Araçları Fonu</option>
                  <option value="Karma Fon">Karma Fon</option>
                  <option value="Endeks Fon">Endeks Fon</option>
                  <option value="Altın Fon">Altın Fon</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Adet/Pay *</label>
                <input
                  type="text"
                  value={formData.quantity}
                  onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="1000"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Güncel Fiyat (₺)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.currentPrice}
                    onChange={e => setFormData(prev => ({ ...prev, currentPrice: e.target.value }))}
                    placeholder="Alış fiyatı"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => void handleFetchQuote()}
                    className="px-3 rounded-md border hover:bg-gray-50"
                  >
                    Çek
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Alış Tarihi *</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={e => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Risk Seviyesi</label>
                <select
                  value={formData.riskLevel}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      riskLevel: e.target.value as 'low' | 'medium' | 'high',
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Düşük Risk</option>
                  <option value="medium">Orta Risk</option>
                  <option value="high">Yüksek Risk</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Notlar</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Fon hakkında notlarınız..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
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

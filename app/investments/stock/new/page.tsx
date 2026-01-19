/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, TrendingUp, Search, Building2 } from 'lucide-react'
import { parseCurrencyInput } from '@/lib/validators'
import { useToast } from '@/lib/use-toast'
import type { MarketSearchResult } from '@/app/investments/types'

interface SelectedStock {
  symbol: string
  name: string
  category: string
  exchange: string
}

export default function NewStockInvestmentPage() {
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<MarketSearchResult[]>([])
  const [selectedStock, setSelectedStock] = useState<SelectedStock | null>(null)

  const [formData, setFormData] = useState({
    quantity: '',
    purchasePrice: '',
    currentPrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    currencyId: 1, // TRY default
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
        const res = await fetch(`/api/market/stocks/search?q=${encodeURIComponent(searchTerm)}`, {
          signal: controller.signal,
        })
        if (res.ok) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const data: { results?: MarketSearchResult[] } = await res.json()
          setSearchResults(data.results ?? [])
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          console.error('Hisse arama hatası', e)
        }
      }
    }
    void search()
    return () => controller.abort()
  }, [searchTerm])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedStock) {
      toastError('Hata', 'Lütfen bir hisse senedi seçiniz')
      return
    }

    setSaving(true)

    try {
      const submitData = {
        investmentType: 'stock',
        name: selectedStock.name,
        symbol: selectedStock.symbol,
        quantity: parseFloat(formData.quantity),
        purchasePrice: parseCurrencyInput(formData.purchasePrice),
        currentPrice: formData.currentPrice
          ? parseCurrencyInput(formData.currentPrice)
          : parseCurrencyInput(formData.purchasePrice),
        purchaseDate: formData.purchaseDate,
        currencyId: formData.currencyId,
        category: selectedStock.category,
        riskLevel: 'medium',
        notes: formData.notes,
        metadata: {
          exchange: selectedStock.exchange,
        },
      }

      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
        credentials: 'include',
      })

      if (response.ok) {
        toastSuccess('Başarılı', 'Hisse senedi yatırımı başarıyla eklendi')
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

  const totalValue =
    selectedStock && formData.quantity && (formData.currentPrice || formData.purchasePrice)
      ? parseFloat(formData.quantity) *
      parseCurrencyInput(formData.currentPrice || formData.purchasePrice)
      : 0

  if (loading) {
    return <div className="p-6">Yükleniyor...</div>
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-500" />
            <h1 className="text-3xl font-bold text-green-600">Yeni Hisse Senedi Yatırımı</h1>
          </div>
          <p className="text-muted-foreground">BIST100 ve yabancı borsa hisseleri</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: Hisse Seçimi */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-green-600">Hisse Senedi Seç</CardTitle>
                  <CardDescription>Global ve TR hisseleri ara</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Hisse ara (örn: AAPL, THYAO)..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Hisse Listesi (API arama sonuçları) */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {searchResults.map(stock => (
                  <button
                    key={stock.symbol}
                    type="button"
                    onClick={() =>
                      setSelectedStock({
                        symbol: stock.symbol,
                        name: stock.name,
                        category: stock.type,
                        exchange: stock.exchange,
                      })
                    }
                    className={`w-full p-4 border rounded-lg text-left transition-all ${selectedStock?.symbol === stock.symbol
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-6 w-6 text-green-600" />
                        <div>
                          <div className="font-semibold">{stock.name}</div>
                          <div className="text-sm text-gray-500">{stock.symbol}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{stock.exchange}</div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sağ: Form */}
        <div className="space-y-6">
          {selectedStock ? (
            <Card className="border-green-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center gap-3">
                  <Building2 className="h-10 w-10 text-green-600" />
                  <div>
                    <CardTitle className="text-green-600">{selectedStock.name}</CardTitle>
                    <CardDescription>
                      {selectedStock.symbol} - {selectedStock.exchange}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Adet/Lot *</label>
                    <input
                      type="text"
                      value={formData.quantity}
                      onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      placeholder="100"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Alış Fiyatı (₺) *</label>
                    <input
                      type="text"
                      value={formData.purchasePrice}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))
                      }
                      placeholder="0,00"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Güncel Fiyat (₺)</label>
                    <input
                      type="text"
                      value={formData.currentPrice}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, currentPrice: e.target.value }))
                      }
                      placeholder="Alış fiyatı ile aynı"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Boş bırakırsanız alış fiyatı kullanılır
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Alış Tarihi *</label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Notlar</label>
                    <textarea
                      value={formData.notes}
                      onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Yatırım stratejiniz, hedefleriniz..."
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Özet */}
                  {totalValue > 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Toplam Yatırım:</span>
                        <span>₺{totalValue.toLocaleString('tr-TR')}</span>
                      </div>
                    </div>
                  )}

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
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
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
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Lütfen soldan bir hisse senedi seçiniz</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

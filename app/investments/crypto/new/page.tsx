'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Coins, Search, TrendingUp, TrendingDown } from 'lucide-react'
import { parseCurrencyInput } from '@/lib/validators'
import { useToast } from '@/lib/use-toast'

interface Crypto {
  id: string
  symbol: string
  name: string
  image: string
  currentPrice: number
  priceChange24h: number
  high24h: number
  low24h: number
  rank: number
}

interface Currency {
  id: number
  code: string
  name: string
  symbol: string
}

export default function NewCryptoInvestmentPage() {
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useToast()
  const [cryptoList, setCryptoList] = useState<Crypto[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null)

  const [formData, setFormData] = useState({
    quantity: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    currencyId: 0,
    notes: '',
  })

  useEffect(() => {
    async function fetchData() {
      try {
        // Kripto listesi
        const cryptoResponse = await fetch('/api/market/crypto')
        if (cryptoResponse.ok) {
          const cryptoData = await cryptoResponse.json()
          setCryptoList(cryptoData)
        }

        // Para birimleri
        const refResponse = await fetch('/api/reference-data')
        if (refResponse.ok) {
          const refData = await refResponse.json()

          // TRY'yi varsayılan yap
          const tryCurrency = refData.currencies.find((c: Currency) => c.code === 'TRY')
          if (tryCurrency) {
            setFormData(prev => ({ ...prev, currencyId: tryCurrency.id }))
          }
        }
      } catch (error) {
        console.error('Veri yüklenirken hata:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredCryptos = cryptoList.filter(
    crypto =>
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCrypto) {
      toastError('Hata', 'Lütfen bir kripto para seçiniz')
      return
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      toastError('Hata', 'Lütfen geçerli bir miktar giriniz')
      return
    }

    if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
      toastError('Hata', 'Lütfen geçerli bir alış fiyatı giriniz')
      return
    }

    setSaving(true)

    try {
      const submitData = {
        investmentType: 'crypto',
        name: selectedCrypto.name,
        symbol: selectedCrypto.symbol,
        quantity: parseFloat(formData.quantity),
        purchasePrice: parseCurrencyInput(formData.purchasePrice),
        currentPrice: selectedCrypto.currentPrice,
        purchaseDate: formData.purchaseDate,
        currencyId: formData.currencyId,
        category: 'Kripto Para',
        riskLevel: 'high',
        notes: formData.notes,
        metadata: {
          image: selectedCrypto.image,
          coinId: selectedCrypto.id,
          rank: selectedCrypto.rank,
        },
      }

      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
        credentials: 'include',
      })

      if (response.ok) {
        toastSuccess('Başarılı', 'Kripto yatırımı başarıyla eklendi')
        router.push('/investments')
      } else {
        const errorData = await response.json()
        toastError('Hata', errorData.error || 'Yatırım eklenemedi')
      }
    } catch (error) {
      console.error('Yatırım eklenirken hata:', error)
      toastError('Hata', 'Yatırım eklenirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const totalValue =
    selectedCrypto && formData.quantity
      ? parseFloat(formData.quantity) * selectedCrypto.currentPrice
      : 0

  const purchaseTotal =
    selectedCrypto && formData.quantity && formData.purchasePrice
      ? parseFloat(formData.quantity) * parseCurrencyInput(formData.purchasePrice)
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
            <Coins className="h-6 w-6 text-orange-500" />
            <h1 className="text-3xl font-bold text-orange-600">Yeni Kripto Para Yatırımı</h1>
          </div>
          <p className="text-muted-foreground">Bitcoin, Ethereum ve diğer kripto paralar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: Kripto Seçimi */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">Kripto Para Seç</CardTitle>
              <CardDescription>Top 100 kripto para listesi (Canlı fiyatlar)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Bitcoin, Ethereum, Solana..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Kripto Listesi */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredCryptos.map(crypto => (
                  <button
                    key={crypto.id}
                    onClick={() => {
                      setSelectedCrypto(crypto)
                      setFormData(prev => ({
                        ...prev,
                        purchasePrice: crypto.currentPrice.toFixed(2),
                      }))
                    }}
                    className={`w-full p-4 border rounded-lg text-left transition-all ${selectedCrypto?.id === crypto.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={crypto.image} alt={crypto.name} className="w-8 h-8" />
                        <div>
                          <div className="font-semibold">{crypto.name}</div>
                          <div className="text-sm text-gray-500">{crypto.symbol}</div>
                        </div>
                        <div className="text-xs text-gray-400">#{crypto.rank}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          ₺
                          {crypto.currentPrice.toLocaleString('tr-TR', {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                        <div
                          className={`text-sm flex items-center justify-end gap-1 ${crypto.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                        >
                          {crypto.priceChange24h >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(crypto.priceChange24h).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sağ: Form */}
        <div className="space-y-6">
          {selectedCrypto && (
            <Card className="border-orange-300">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                <div className="flex items-center gap-3">
                  <img src={selectedCrypto.image} alt={selectedCrypto.name} className="w-10 h-10" />
                  <div>
                    <CardTitle className="text-orange-600">{selectedCrypto.name}</CardTitle>
                    <CardDescription>{selectedCrypto.symbol}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Miktar *</label>
                    <input
                      type="text"
                      value={formData.quantity}
                      onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      placeholder="0.00000000"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Kaç adet alacaksınız?</p>
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
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Güncel: ₺{selectedCrypto.currentPrice.toLocaleString('tr-TR')}
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
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Notlar</label>
                    <textarea
                      value={formData.notes}
                      onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Yatırım hakkında notlarınız..."
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Özet */}
                  {purchaseTotal > 0 && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Alış Toplamı:</span>
                        <span className="font-semibold">
                          ₺{purchaseTotal.toLocaleString('tr-TR')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Güncel Değer:</span>
                        <span className="font-semibold">₺{totalValue.toLocaleString('tr-TR')}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-2 border-t border-orange-300">
                        <span>Kar/Zarar:</span>
                        <span
                          className={
                            totalValue >= purchaseTotal ? 'text-green-600' : 'text-red-600'
                          }
                        >
                          {totalValue >= purchaseTotal ? '+' : ''}₺
                          {(totalValue - purchaseTotal).toLocaleString('tr-TR')}(
                          {((totalValue / purchaseTotal - 1) * 100).toFixed(2)}%)
                        </span>
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
                      className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
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
          )}

          {!selectedCrypto && (
            <Card>
              <CardContent className="p-12 text-center">
                <Coins className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Lütfen soldan bir kripto para seçiniz</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

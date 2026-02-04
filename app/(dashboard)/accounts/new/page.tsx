'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Wallet, CreditCard, Coins } from 'lucide-react'
import { useToast } from '@/lib/use-toast'

interface ReferenceData {
  banks: Array<{
    id: number
    name: string
    asciiName: string
    swiftBic?: string | null
    bankCode?: string | null
    website?: string | null
  }>
  accountTypes: Array<{
    id: number
    code: string
    name: string
    description?: string | null
  }>
  goldTypes: Array<{
    id: number
    code: string
    name: string
    description?: string | null
  }>
  goldPurities: Array<{
    id: number
    code: string
    name: string
    purity: string
  }>
  currencies: Array<{ id: number; code: string; name: string; symbol: string }>
}

export default function NewAccountPage() {
  const router = useRouter()
  const { error: toastError, success: toastSuccess } = useToast()
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [accountType, setAccountType] = useState<'bank' | 'credit_card' | 'gold'>('bank')

  const [formData, setFormData] = useState({
    name: '',
    bankId: 0,
    accountTypeId: 0,
    currencyId: 0,
    balance: '',
    accountNumber: '',
    iban: '',
    // Kredi kartı için
    limitAmount: '',
    dueDay: 1,
    // Altın için
    goldTypeId: 0,
    goldPurityId: 0,
    weight: '',
    purchasePrice: '',
  })

  useEffect(() => {
    async function fetchReferenceData() {
      try {
        const response = await fetch(`/api/reference-data?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        })
        if (response.ok) {
          const data = (await response.json()) as ReferenceData
          setReferenceData(data)

          // Varsayılan değerleri set et
          if (data.currencies && data.currencies.length > 0) {
            const tryCurrency = data.currencies.find(c => c.code === 'TRY')
            if (tryCurrency) {
              setFormData(prev => ({ ...prev, currencyId: tryCurrency.id }))
            }
          }
        } else {
          console.error('API response not ok:', response.status)
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
    setSaving(true)

    try {
      const submitData = {
        ...formData,
        balance: parseFloat(formData.balance) || 0,
        limitAmount: parseFloat(formData.limitAmount) || 0,
        weight: parseFloat(formData.weight) || 0,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        iban: formData.iban ? `TR${formData.iban}` : null, // TR prefix ekle
        accountType,
      }

      // eslint-disable-next-line no-console
      console.log('[DEBUG] Submitting account data:', submitData)

      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        toastSuccess('Hesap başarıyla kaydedildi')
        router.push('/accounts')
      } else {
        const error = (await response.json()) as { error?: string }
        toastError('Hata', error.error || 'Hesap kaydedilemedi')
      }
    } catch (error) {
      console.error('Hesap kaydedilemedi:', error)
      toastError('Hata', 'Hesap kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

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

  if (!referenceData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600">Veri yüklenemedi</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg w-fit">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Yeni Hesap</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Banka hesabı, kredi kartı veya altın eşyası ekleyin
          </p>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Hesap Türü Seçin</CardTitle>
          <CardDescription>Eklemek istediğiniz hesap türünü seçin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setAccountType('bank')}
              className={`p-4 border-2 rounded-lg text-center transition-all ${accountType === 'bank'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <Wallet className="h-8 w-8 mx-auto mb-2" />
              <div className="font-medium">Banka Hesabı</div>
              <div className="text-sm text-gray-500">Vadesiz/Vadeli</div>
            </button>

            <button
              type="button"
              onClick={() => setAccountType('credit_card')}
              className={`p-4 border-2 rounded-lg text-center transition-all ${accountType === 'credit_card'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <CreditCard className="h-8 w-8 mx-auto mb-2" />
              <div className="font-medium">Kredi Kartı</div>
              <div className="text-sm text-gray-500">Limit ve ödeme</div>
            </button>

            <button
              type="button"
              onClick={() => setAccountType('gold')}
              className={`p-4 border-2 rounded-lg text-center transition-all ${accountType === 'gold'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <Coins className="h-8 w-8 mx-auto mb-2" />
              <div className="font-medium">Altın/Ziynet</div>
              <div className="text-sm text-gray-500">Değerli eşya</div>
            </button>
          </div>

          <form
            onSubmit={e => {
              void handleSubmit(e)
            }}
            className="space-y-6"
          >
            {/* Ortak alanlar */}
            <div>
              <label className="block text-sm font-medium mb-2">Hesap Adı *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={
                  accountType === 'bank'
                    ? 'Örn: Ziraat Bankası Vadesiz Hesap'
                    : accountType === 'credit_card'
                      ? 'Örn: Ziraat Bankası World Kart'
                      : 'Örn: 22 Ayar Altın Bilezik'
                }
                className="w-full form-input-mobile border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {accountType === 'bank' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Banka *</label>
                    <select
                      value={formData.bankId}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, bankId: parseInt(e.target.value) }))
                      }
                      className="w-full form-input-mobile border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value={0}>Seçiniz</option>
                      {referenceData?.banks.map(bank => (
                        <option key={bank.id} value={bank.id}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Hesap Türü *</label>
                    <select
                      value={formData.accountTypeId}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, accountTypeId: parseInt(e.target.value) }))
                      }
                      className="w-full form-input-mobile border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value={0}>Seçiniz</option>
                      {referenceData?.accountTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Para Birimi *</label>
                    <select
                      value={formData.currencyId}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, currencyId: parseInt(e.target.value) }))
                      }
                      className="w-full form-input-mobile border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                  <div>
                    <label className="block text-sm font-medium mb-2">Bakiye</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.balance}
                      onChange={e => setFormData(prev => ({ ...prev, balance: e.target.value }))}
                      placeholder="0,00"
                      className="w-full form-input-mobile border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Hesap Numarası</label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, accountNumber: e.target.value }))
                      }
                      placeholder="Hesap numarası"
                      className="w-full form-input-mobile border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">IBAN</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        TR
                      </span>
                      <input
                        type="text"
                        value={formData.iban}
                        onChange={e => {
                          // Sadece rakam ve boşluk karakterlerine izin ver, max 26 karakter (TR hariç)
                          let value = e.target.value.replace(/[^0-9\s]/g, '')
                          // Maksimum 26 karakter (TR hariç)
                          if (value.length > 26) {
                            value = value.substring(0, 26)
                          }
                          setFormData(prev => ({ ...prev, iban: value }))
                        }}
                        placeholder="00 0000 0000 0000 0000 0000 00"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={26}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      TR sabit, sadece rakam ve boşluk karakterleri (max 26 karakter)
                    </p>
                  </div>
                </div>
              </>
            )}

            {accountType === 'credit_card' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Banka *</label>
                    <select
                      value={formData.bankId}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, bankId: parseInt(e.target.value) }))
                      }
                      className="w-full form-input-mobile border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value={0}>Seçiniz</option>
                      {referenceData?.banks.map(bank => (
                        <option key={bank.id} value={bank.id}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Para Birimi *</label>
                    <select
                      value={formData.currencyId}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, currencyId: parseInt(e.target.value) }))
                      }
                      className="w-full form-input-mobile border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <label className="block text-sm font-medium mb-2">Limit Tutarı *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.limitAmount}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, limitAmount: e.target.value }))
                      }
                      placeholder="0,00"
                      className="w-full form-input-mobile border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Ödeme Günü *</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.dueDay}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, dueDay: parseInt(e.target.value) }))
                      }
                      className="w-full form-input-mobile border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {accountType === 'gold' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Altın Türü * (13 Tür)</label>
                    <select
                      value={formData.goldTypeId}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, goldTypeId: parseInt(e.target.value) }))
                      }
                      className="w-full form-input-mobile border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value={0}>Altın türü seçiniz</option>
                      {referenceData?.goldTypes.map(type => (
                        <option key={type.id} value={type.id} title={type.description || ''}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Bilezik, Kolye, Küpe, Cumhuriyet Altını, vb.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Ayar * (5 Ayar)</label>
                    <select
                      value={formData.goldPurityId}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, goldPurityId: parseInt(e.target.value) }))
                      }
                      className="w-full form-input-mobile border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value={0}>Ayar seçiniz</option>
                      {referenceData?.goldPurities.map(purity => (
                        <option key={purity.id} value={purity.id}>
                          {purity.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      24K (Saf), 22K (Cumhuriyet), 18K, 14K, 8K
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Ağırlık (Gram) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={e => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="0,00"
                      className="w-full form-input-mobile border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Alış Fiyatı (TRY) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.purchasePrice}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))
                      }
                      placeholder="0,00"
                      className="w-full form-input-mobile border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 transition-colors"
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
    </div>
  )
}

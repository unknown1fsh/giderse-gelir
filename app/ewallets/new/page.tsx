'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Wallet, Mail, Phone } from 'lucide-react'
import { parseCurrencyInput } from '@/lib/validators'
import { useToast } from '@/lib/use-toast'

interface Currency {
  id: number
  code: string
  name: string
  symbol: string
}

interface ReferenceData {
  currencies: Currency[]
}

export default function NewEWalletPage() {
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useToast()
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    accountEmail: '',
    accountPhone: '',
    balance: '',
    currencyId: 0,
  })

  useEffect(() => {
    async function fetchReferenceData() {
      try {
        const response = await fetch('/api/reference-data')
        if (response.ok) {
          const data = (await response.json()) as ReferenceData
          setReferenceData(data)

          // Varsayılan para birimini TRY yap
          const tryCurrency = data.currencies.find(c => c.code === 'TRY')
          if (tryCurrency) {
            setFormData(prev => ({ ...prev, currencyId: tryCurrency.id }))
          }
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

    // Validasyon
    if (!formData.name.trim()) {
      toastError('Hata', 'E-cüzdan adı zorunludur')
      return
    }

    if (!formData.provider) {
      toastError('Hata', 'Sağlayıcı seçimi zorunludur')
      return
    }

    if (!formData.currencyId) {
      toastError('Hata', 'Para birimi seçimi zorunludur')
      return
    }

    // En az bir iletişim bilgisi olmalı
    if (!formData.accountEmail && !formData.accountPhone) {
      toastError('Hata', 'En az bir iletişim bilgisi (E-posta veya Telefon) girilmelidir')
      return
    }

    setSaving(true)

    try {
      const submitData = {
        name: formData.name.trim(),
        provider: formData.provider,
        accountEmail: formData.accountEmail.trim() || null,
        accountPhone: formData.accountPhone.trim() || null,
        balance: formData.balance ? parseCurrencyInput(formData.balance) : 0,
        currencyId: formData.currencyId,
      }

      const response = await fetch('/api/ewallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
        credentials: 'include',
      })

      if (response.ok) {
        toastSuccess('Başarılı', 'E-cüzdan başarıyla eklendi')
        router.push('/ewallets')
      } else {
        const errorData = (await response.json()) as { error?: string }
        toastError('Hata', errorData.error || 'E-cüzdan eklenemedi')
      }
    } catch (error) {
      console.error('E-cüzdan eklenirken hata:', error)
      toastError('Hata', 'E-cüzdan eklenirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6">Yükleniyor...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-blue-500" />
            <h1 className="text-3xl font-bold text-blue-600">Yeni E-Cüzdan Ekle</h1>
          </div>
          <p className="text-muted-foreground">
            PayPal, Papara, Ininal vb. dijital cüzdan bilgilerinizi girin
          </p>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-blue-600">E-Cüzdan Bilgileri</CardTitle>
          <CardDescription>
            Dijital cüzdanınızın bilgilerini doldurun. En az bir iletişim bilgisi zorunludur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={e => void handleSubmit(e)} className="space-y-6">
            {/* Temel Bilgiler */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Temel Bilgiler
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">E-Cüzdan Adı *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Papara Hesabım, PayPal Ana Cüzdan, vb."
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Tanımlayıcı bir isim verin</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sağlayıcı *</label>
                  <select
                    value={formData.provider}
                    onChange={e => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Sağlayıcı seçiniz</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Papara">Papara</option>
                    <option value="Ininal">Ininal</option>
                    <option value="Paycell">Paycell</option>
                    <option value="BKM Express">BKM Express</option>
                    <option value="Google Pay">Google Pay</option>
                    <option value="Apple Pay">Apple Pay</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>
              </div>
            </div>

            {/* İletişim Bilgileri */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                İletişim Bilgileri
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      E-posta Adresi
                    </div>
                  </label>
                  <input
                    type="email"
                    value={formData.accountEmail}
                    onChange={e => setFormData(prev => ({ ...prev, accountEmail: e.target.value }))}
                    placeholder="ornek@email.com"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">E-cüzdan hesabı e-postası</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefon Numarası
                    </div>
                  </label>
                  <input
                    type="tel"
                    value={formData.accountPhone}
                    onChange={e => setFormData(prev => ({ ...prev, accountPhone: e.target.value }))}
                    placeholder="05XX XXX XX XX"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">E-cüzdan hesabı telefonu</p>
                </div>
              </div>
            </div>

            {/* Bakiye Bilgileri */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <span className="text-2xl font-bold">₺</span>
                Bakiye Bilgileri
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mevcut Bakiye</label>
                  <input
                    type="text"
                    value={formData.balance}
                    onChange={e => setFormData(prev => ({ ...prev, balance: e.target.value }))}
                    placeholder="0,00"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Örn: 1.500 veya 1.500,50</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Para Birimi *</label>
                  <select
                    value={formData.currencyId}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, currencyId: parseInt(e.target.value) }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={!referenceData?.currencies || referenceData.currencies.length === 0}
                  >
                    <option value={0}>Para birimi seçiniz</option>
                    {referenceData?.currencies && referenceData.currencies.length > 0 ? (
                      referenceData.currencies.map(currency => (
                        <option key={currency.id} value={currency.id}>
                          {currency.code} - {currency.name} ({currency.symbol})
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
            </div>

            {/* Bilgilendirme */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ <strong>Not:</strong> E-cüzdan adı ve sağlayıcı zorunludur. En az bir iletişim
                bilgisi (E-posta veya Telefon) girilmelidir. Bakiye opsiyoneldir.
              </p>
            </div>

            {/* Butonlar */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
                disabled={saving}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 font-medium"
              >
                {saving ? (
                  'Kaydediliyor...'
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    E-Cüzdan Ekle
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

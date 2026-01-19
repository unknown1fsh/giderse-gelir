'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Users, Building2, CreditCard, Phone, Mail } from 'lucide-react'
import { useToast } from '@/lib/use-toast'

interface ReferenceData {
  banks: Array<{ id: number; name: string }>
}

export default function NewBeneficiaryPage() {
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useToast()
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    iban: '',
    accountNo: '',
    bankId: 0,
    phoneNumber: '',
    email: '',
    description: '',
  })

  useEffect(() => {
    async function fetchReferenceData() {
      try {
        const response = await fetch('/api/reference-data')
        if (response.ok) {
          const data = await response.json()
          setReferenceData(data)
        }
      } catch (error) {
        console.error('Referans verileri alınamadı:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReferenceData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validasyon
    if (!formData.name.trim()) {
      toastError('Hata', 'Alıcı adı zorunludur')
      return
    }

    // En az bir iletişim bilgisi olmalı
    if (!formData.iban && !formData.accountNo && !formData.phoneNumber && !formData.email) {
      toastError('Hata', 'En az bir iletişim bilgisi (IBAN, Hesap No, Telefon veya E-posta) girilmelidir')
      return
    }

    setSaving(true)

    try {
      const submitData = {
        name: formData.name.trim(),
        iban: formData.iban.trim() || null,
        accountNo: formData.accountNo.trim() || null,
        bankId: formData.bankId > 0 ? formData.bankId : null,
        phoneNumber: formData.phoneNumber.trim() || null,
        email: formData.email.trim() || null,
        description: formData.description.trim() || null,
      }

      const response = await fetch('/api/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
        credentials: 'include',
      })

      if (response.ok) {
        toastSuccess('Başarılı', 'Alıcı başarıyla eklendi')
        router.push('/beneficiaries')
      } else {
        const errorData = await response.json()
        toastError('Hata', errorData.error || 'Alıcı eklenemedi')
      }
    } catch (error) {
      console.error('Alıcı eklenirken hata:', error)
      toastError('Hata', 'Alıcı eklenirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-green-500" />
            <h1 className="text-3xl font-bold text-green-600">Yeni Alıcı Ekle</h1>
          </div>
          <p className="text-muted-foreground">Havale/EFT yapacağınız kişi bilgilerini girin</p>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-green-600">Alıcı Bilgileri</CardTitle>
          <CardDescription>
            Havale/EFT yapacağınız kişinin bilgilerini doldurun. En az bir iletişim bilgisi
            zorunludur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Temel Bilgiler */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Temel Bilgiler
              </h3>

              <div>
                <label className="block text-sm font-medium mb-2">Alıcı Adı / Ünvanı *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ahmet Yılmaz veya ABC A.Ş."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Kişi veya kurum adı</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Açıklama / Not</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Bu alıcı hakkında notlarınız..."
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Banka Bilgileri */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Banka Bilgileri
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Banka</label>
                  <select
                    value={formData.bankId}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, bankId: parseInt(e.target.value) }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value={0}>Banka seçiniz (opsiyonel)</option>
                    {referenceData?.banks.map(bank => (
                      <option key={bank.id} value={bank.id}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      IBAN
                    </div>
                  </label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={e => setFormData(prev => ({ ...prev, iban: e.target.value }))}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    maxLength={34}
                  />
                  <p className="text-xs text-gray-500 mt-1">Uluslararası banka hesap numarası</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hesap Numarası</label>
                <input
                  type="text"
                  value={formData.accountNo}
                  onChange={e => setFormData(prev => ({ ...prev, accountNo: e.target.value }))}
                  placeholder="1234567890"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Varsa hesap numarasını girin</p>
              </div>
            </div>

            {/* İletişim Bilgileri */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                İletişim Bilgileri
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefon Numarası
                    </div>
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={e => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="05XX XXX XX XX"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      E-posta Adresi
                    </div>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="ornek@email.com"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Bilgilendirme */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ <strong>Not:</strong> Alıcı adı zorunludur. Ayrıca en az bir iletişim bilgisi
                (IBAN, Hesap No, Telefon veya E-posta) girilmelidir.
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
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2 font-medium"
              >
                {saving ? (
                  'Kaydediliyor...'
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Alıcı Ekle
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

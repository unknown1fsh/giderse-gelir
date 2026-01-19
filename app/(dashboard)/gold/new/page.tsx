'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Home, Coins, Save, Loader2 } from 'lucide-react'
import { useToast } from '@/lib/use-toast'

interface ReferenceData {
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
}

export default function NewGoldItemPage() {
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useToast()
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    goldTypeId: '',
    goldPurityId: '',
    weight: '',
    purchasePrice: '',
    description: '',
  })

  useEffect(() => {
    async function fetchReferenceData() {
      try {
        const response = await fetch('/api/reference-data')
        if (response.ok) {
          const data = (await response.json()) as ReferenceData
          setReferenceData(data)
        }
      } catch (error) {
        console.error('Reference data yüklenirken hata:', error)
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
        weight: parseFloat(formData.weight) || 0,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        goldTypeId: parseInt(formData.goldTypeId),
        goldPurityId: parseInt(formData.goldPurityId),
      }

      const response = await fetch('/api/gold', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        toastSuccess('Başarılı', 'Altın eşyası başarıyla eklendi')
        router.push('/gold')
      } else {
        const errorData = (await response.json()) as { error?: string }
        toastError('Hata', errorData.error || 'Altın eşyası eklenemedi')
      }
    } catch (error) {
      console.error('Altın eşyası eklenirken hata:', error)
      toastError('Hata', 'Altın eşyası eklenirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Veriler yükleniyor...</p>
        </div>
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
          <h1 className="text-3xl font-bold">Yeni Altın Eşyası</h1>
          <p className="text-muted-foreground">Altın veya ziynet eşyası ekleyin</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-600" />
            Altın Eşyası Bilgileri
          </CardTitle>
          <CardDescription>Altın veya ziynet eşyasının detaylarını girin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={e => void handleSubmit(e)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Eşya Adı *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Örn: 22 Ayar Altın Bilezik"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Altın Türü * (13 Tür)</label>
                <select
                  value={formData.goldTypeId}
                  onChange={e => setFormData(prev => ({ ...prev, goldTypeId: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Altın türü seçin</option>
                  {referenceData?.goldTypes.map(type => (
                    <option key={type.id} value={type.id} title={type.description || ''}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Bilezik, Kolye, Küpe, Cumhuriyet Altını, Yarım/Çeyrek Altın, vb.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ayar * (5 Ayar)</label>
                <select
                  value={formData.goldPurityId}
                  onChange={e => setFormData(prev => ({ ...prev, goldPurityId: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Ayar seçin</option>
                  {referenceData?.goldPurities.map(purity => (
                    <option key={purity.id} value={purity.id}>
                      {purity.name} ({purity.purity} ayar)
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
                  min="0"
                  value={formData.weight}
                  onChange={e => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="Örn: 15.50"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Alış Fiyatı (₺) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchasePrice}
                  onChange={e => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                  placeholder="Örn: 25000.00"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Açıklama</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Eşya hakkında ek bilgiler..."
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Kaydet
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                İptal
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

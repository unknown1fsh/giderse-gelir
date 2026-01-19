'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePeriod } from '@/lib/period-context'
import { calculatePeriodDates, getPeriodTypeLabel } from '@/lib/period-helpers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'

type PeriodType = 'YEARLY' | 'FISCAL_YEAR' | 'MONTHLY' | 'CUSTOM'

export default function NewPeriodPage() {
  const router = useRouter()
  const { createPeriod, periods } = usePeriod()

  const [step, setStep] = useState<1 | 2>(1)
  const [periodType, setPeriodType] = useState<PeriodType>('YEARLY')
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showExistingPeriods, setShowExistingPeriods] = useState(false)

  // Dönem tipi seçildiğinde otomatik tarih hesaplama
  const handlePeriodTypeChange = (type: PeriodType) => {
    setPeriodType(type)

    if (type !== 'CUSTOM') {
      const dates = calculatePeriodDates(type)
      setStartDate(dates.start.toISOString().split('T')[0])
      setEndDate(dates.end.toISOString().split('T')[0])

      // Otomatik isim önerisi
      const now = new Date()
      switch (type) {
        case 'YEARLY':
          setName(`${now.getFullYear()} Yılı`)
          break
        case 'FISCAL_YEAR':
          setName(`${now.getFullYear()}-${now.getFullYear() + 1} Mali Yılı`)
          break
        case 'MONTHLY':
          setName(now.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }))
          break
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('❌ Dönem adı gereklidir')
      return
    }

    if (!startDate || !endDate) {
      setError('❌ Başlangıç ve bitiş tarihleri gereklidir')
      return
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError('❌ Başlangıç tarihi bitiş tarihinden önce olmalıdır')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await createPeriod({
        name: name.trim(),
        periodType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description: description.trim() || undefined,
      })

      if (result.success) {
        // Başarılı mesajı göster
        setError('✅ Dönem başarıyla oluşturuldu! Yönlendiriliyorsunuz...')
        setTimeout(() => {
          router.push('/periods')
        }, 1000)
      } else {
        // Detaylı hata mesajı
        if (result.error?.includes('zaten bir dönem')) {
          setError(
            '⚠️ Bu tarih aralığında zaten bir dönem var. Lütfen farklı tarihler seçin veya mevcut dönemleri kontrol edin.'
          )
        } else {
          setError(`❌ ${result.error || 'Dönem oluşturulamadı'}`)
        }
      }
    } catch (err) {
      console.error('Create period error:', err)
      setError(`❌ ${err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu'}`)
    } finally {
      setLoading(false)
    }
  }

  const periodTypes: { value: PeriodType; label: string; description: string }[] = [
    {
      value: 'YEARLY',
      label: 'Yıllık Dönem',
      description: 'Tüm yıl için tek bir dönem (1 Ocak - 31 Aralık)',
    },
    {
      value: 'FISCAL_YEAR',
      label: 'Mali Yıl',
      description: 'Mali yıl dönemi (özelleştirilebilir başlangıç tarihi)',
    },
    {
      value: 'MONTHLY',
      label: 'Aylık Dönem',
      description: 'Tek bir ay için dönem',
    },
    {
      value: 'CUSTOM',
      label: 'Özel Dönem',
      description: 'Kendiniz belirleyeceğiniz tarih aralığı',
    },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/periods" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Yeni Dönem Oluştur</h1>
          <p className="text-muted-foreground">
            Gelir ve giderlerinizi takip etmek için yeni bir dönem ekleyin
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {step > 1 ? <Check className="h-5 w-5" /> : '1'}
          </div>
          <span className={`text-sm font-medium ${step >= 1 ? 'text-blue-600' : 'text-slate-600'}`}>
            Dönem Tipi
          </span>
        </div>
        <div className={`h-px w-16 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            2
          </div>
          <span className={`text-sm font-medium ${step >= 2 ? 'text-blue-600' : 'text-slate-600'}`}>
            Dönem Bilgileri
          </span>
        </div>
      </div>

      {/* Mevcut Dönemler Uyarısı */}
      {periods.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  {periods.length} mevcut dönem bulunuyor
                </p>
                <button
                  type="button"
                  onClick={() => setShowExistingPeriods(!showExistingPeriods)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  {showExistingPeriods ? 'Gizle' : 'Mevcut dönemleri göster'}
                </button>
                {showExistingPeriods && (
                  <div className="mt-3 space-y-2">
                    {periods.map(p => (
                      <div
                        key={p.id}
                        className="text-xs bg-white p-2 rounded border border-blue-200"
                      >
                        <span className="font-medium">{p.name}</span>
                        <span className="text-slate-500 ml-2">
                          ({new Date(p.startDate).toLocaleDateString('tr-TR')} -{' '}
                          {new Date(p.endDate).toLocaleDateString('tr-TR')})
                        </span>
                        {p.isClosed && (
                          <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                            Kapalı
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={e => void handleSubmit(e)} className="space-y-6">
        {/* Step 1: Dönem Tipi Seçimi */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Dönem Tipini Seçin</CardTitle>
              <CardDescription>Hangi tür bir dönem oluşturmak istiyorsunuz?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {periodTypes.map(type => (
                <label
                  key={type.value}
                  className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300 ${
                    periodType === type.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="periodType"
                    value={type.value}
                    checked={periodType === type.value}
                    onChange={e => handlePeriodTypeChange(e.target.value as PeriodType)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{type.label}</div>
                    <div className="text-sm text-slate-600 mt-1">{type.description}</div>
                  </div>
                </label>
              ))}

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Devam Et
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Dönem Bilgileri */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Dönem Bilgileri</CardTitle>
              <CardDescription>
                Seçtiğiniz dönem tipi: <strong>{getPeriodTypeLabel(periodType)}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dönem Adı */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dönem Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Örn: 2024 Yılı, Ocak 2024"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Tarih Aralığı */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Başlangıç Tarihi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Bitiş Tarihi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Açıklama (Opsiyonel)
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Bu dönem hakkında notlar ekleyin..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Error/Success Message */}
              {error && (
                <div
                  className={`p-4 border rounded-lg text-sm ${
                    error.startsWith('✅')
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : error.startsWith('⚠️')
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                        : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="font-medium">{error}</p>
                      {error.includes('zaten bir dönem') && (
                        <div className="mt-3 flex gap-2">
                          <Link
                            href="/periods"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-md text-xs font-medium transition-colors"
                          >
                            <Calendar className="h-3 w-3" />
                            Mevcut Dönemleri Görüntüle
                          </Link>
                          <button
                            type="button"
                            onClick={() => setError(null)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors"
                          >
                            Tarihleri Değiştir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                  disabled={loading}
                >
                  Geri
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Oluşturuluyor...' : 'Dönem Oluştur'}
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Dönem Sistemi Hakkında</p>
              <p>
                Dönemler, gelir ve giderlerinizi belirli zaman aralıklarında organize etmenizi
                sağlar. Her dönem için ayrı hesaplar oluşturabilir ve dönem kapanışında
                bakiyelerinizi yeni döneme devredebilirsiniz.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

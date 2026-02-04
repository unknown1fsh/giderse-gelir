'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePeriod } from '@/lib/period-context'
import { useUser } from '@/lib/user-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Check, Sparkles } from 'lucide-react'

/**
 * Period Onboarding Component
 *
 * Yeni kullanıcılar veya dönemi olmayan kullanıcılar için
 * otomatik ilk dönem oluşturma modal'ı
 */
export default function PeriodOnboarding() {
  const router = useRouter()
  const { user } = useUser()
  const { periods, loading, createPeriod, activePeriod, error } = usePeriod()
  const [creating, setCreating] = useState(false)
  const [step, setStep] = useState<'checking' | 'create' | 'done'>('checking')

  useEffect(() => {
    // Kullanıcı yok veya yükleniyorsa gösterme
    if (!user || loading) {
      setStep('checking')
      return
    }

    // Hata varsa gösterme
    if (error) {
      setStep('done')
      return
    }

    // Dönem varsa onboarding'i gösterme
    if (periods.length > 0 || activePeriod) {
      setStep('done')
    } else {
      // Sadece periods boş array ise ve kullanıcı authenticated ise göster
      if (Array.isArray(periods) && periods.length === 0) {
        setStep('create')
      } else {
        setStep('done')
      }
    }
  }, [user, loading, periods, activePeriod, error])

  const handleCreateDefaultPeriod = async () => {
    setCreating(true)

    const currentYear = new Date().getFullYear()
    const startDate = new Date(currentYear, 0, 1)
    const endDate = new Date(currentYear, 11, 31)

    try {
      const result = await createPeriod({
        name: `${currentYear} Yılı`,
        periodType: 'YEARLY',
        startDate,
        endDate,
        description: 'İlk dönem - otomatik oluşturuldu',
      })

      if (result.success) {
        setStep('done')
        // Biraz bekle ve sayfayı yenile
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        console.error('Create default period error:', result.error)
        // Hata olsa bile modal'ı kapat (zaten dönem var demektir)
        setStep('done')
      }
    } catch (error) {
      console.error('Create default period error:', error)
      setStep('done')
    } finally {
      setCreating(false)
    }
  }

  // Kullanıcı yoksa gösterme
  if (!user) {
    return null
  }

  // Eğer dönem kontrolü devam ediyorsa veya hata varsa gösterme
  if (step === 'checking' || loading || error) {
    return null
  }

  // Dönem varsa gösterme
  if (step === 'done') {
    return null
  }

  // Dönem yok, onboarding göster
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl border-2 m-4">
        <CardHeader className="text-center space-y-4 bg-white">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Hoş Geldiniz! 🎉</CardTitle>
          <CardDescription className="text-base">
            Finans yönetiminize başlamak için ilk döneminizi oluşturalım
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 bg-white">
          {/* Dönem Sistemi Açıklaması */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Dönem Sistemi Nedir?
            </h3>
            <p className="text-sm text-blue-800">
              Dönemler, gelir ve giderlerinizi belirli zaman aralıklarında organize etmenizi sağlar.
              Yıllık, aylık veya özel dönemler oluşturabilir, her dönem için ayrı hesaplar
              tutabilirsiniz.
            </p>
          </div>

          {/* İlk Dönem Önerisi */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Önerilen İlk Dönem</h3>
            <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-blue-900">{new Date().getFullYear()} Yılı</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  Yıllık Dönem
                </span>
              </div>
              <div className="text-sm text-slate-600">
                <Calendar className="h-4 w-4 inline mr-1" />1 Ocak {new Date().getFullYear()} - 31
                Aralık {new Date().getFullYear()}
              </div>
            </div>
          </div>

          {/* Özellikler */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-slate-700">Bu dönemle:</h3>
            <ul className="space-y-2">
              {[
                'Gelir ve giderlerinizi takip edebilirsiniz',
                'Hesaplarınızı yönetebilirsiniz',
                'Raporlar ve analizler oluşturabilirsiniz',
                'İstediğiniz zaman yeni dönemler ekleyebilirsiniz',
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => void handleCreateDefaultPeriod()}
              disabled={creating}
              className="flex-1 min-h-[48px] px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Oluşturuluyor...' : 'Dönem Oluştur ve Başla'}
            </button>
            <button
              onClick={() => router.push('/periods/new')}
              disabled={creating}
              className="min-h-[48px] px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium disabled:opacity-50"
            >
              Özelleştir
            </button>
          </div>

          <p className="text-xs text-center text-slate-500">
            Dönemleri istediğiniz zaman değiştirebilir ve yeni dönemler ekleyebilirsiniz
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

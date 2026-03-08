'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/mosaic'
import { Button } from '@/components/mosaic'
import { CheckCircle2, Loader2, ArrowRight, Crown, Sparkles, Star, Gift } from 'lucide-react'
import { useUser } from '@/lib/user-context'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser } = useUser()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [planInfo, setPlanInfo] = useState<{
    name: string
    features: string[]
  } | null>(null)

  const merchantOid = searchParams.get('merchant_oid')

  useEffect(() => {
    // Ödeme durumunu kontrol et ve subscription'ı güncelle
    if (merchantOid) {
      // PayTR webhook zaten subscription'ı güncellemiş olmalı
      // Kullanıcı bilgilerini yenile
      void refreshUser().then(() => {
        setLoading(false)
        setSuccess(true)

        // Plan bilgilerini ayarla
        const planId = merchantOid.split('_')[2] // pay_{userId}_{planId}_{timestamp}
        if (planId === 'premium') {
          setPlanInfo({
            name: 'Premium',
            features: [
              'Sınırsız işlem takibi',
              'AI Finansal Asistan',
              'Gelişmiş raporlar ve analizler',
              'PDF/Excel raporları',
              'Öncelikli destek',
            ],
          })
        } else if (planId === 'enterprise') {
          setPlanInfo({
            name: 'Enterprise',
            features: [
              'Tüm Premium özellikler',
              'Çoklu kullanıcı desteği',
              'API erişimi',
              'Özel entegrasyonlar',
              'Dedicated destek',
            ],
          })
        }
      })
    } else {
      setLoading(false)
      setSuccess(false)
    }
  }, [merchantOid, refreshUser])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {loading ? (
            <>
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
              <CardTitle className="text-2xl font-bold">Ödeme Kontrol Ediliyor</CardTitle>
              <CardDescription>Lütfen bekleyin...</CardDescription>
            </>
          ) : success ? (
            <>
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-400">Ödeme Başarılı!</CardTitle>
              <CardDescription>Aboneliğiniz aktif edildi</CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-400">
                Ödeme Bilgisi Bulunamadı
              </CardTitle>
              <CardDescription>Ödeme durumunuzu kontrol edin</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {success && (
            <>
              {/* Kutlama mesajı */}
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <Crown className="h-6 w-6 text-green-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-800 mb-1">Hoş Geldiniz!</h3>
                    <p className="text-green-400 text-sm">
                      Ödemeniz başarıyla tamamlandı. {planInfo?.name || 'Premium'} aboneliğiniz
                      aktif edildi!
                    </p>
                  </div>
                </div>
              </div>

              {/* Plan özellikleri */}
              {planInfo && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    <h3 className="font-semibold text-purple-900">
                      {planInfo.name} Özellikleriniz Aktif
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {planInfo.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-purple-800">
                        <Star className="h-4 w-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Özel bonus bilgisi */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Gift className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm mb-1">Özel Bonus</h4>
                    <p className="text-amber-800 text-xs">
                      İlk ay için %20 ekstra AI analiz kredisi hediye! Dashboard&apos;unuzda hemen
                      kullanmaya başlayın.
                    </p>
                  </div>
                </div>
              </div>

              {/* Aksiyon butonları */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Premium Dashboard&apos;a Git
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => router.push('/premium-features')}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Tüm Özellikleri Keşfet
                </Button>
              </div>

              {/* Yardım */}
              <div className="text-center pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  Sorunuz mu var?{' '}
                  <a href="mailto:support@giderse.com" className="text-purple-400 hover:underline">
                    7/24 premium destek
                  </a>{' '}
                  ile iletişime geçin
                </p>
              </div>
            </>
          )}

          {!loading && !success && (
            <div className="space-y-2">
              <p className="text-gray-600 text-sm text-center">
                Ödeme bilgisi bulunamadı. Eğer ödemeniz tamamlandıysa, lütfen birkaç dakika bekleyin
                veya destek ekibimizle iletişime geçin.
              </p>
              <Button onClick={() => router.push('/dashboard')} className="w-full" size="lg">
                Dashboard&apos;a Dön
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="py-8">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
                <p className="text-gray-600">Yükleniyor...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}

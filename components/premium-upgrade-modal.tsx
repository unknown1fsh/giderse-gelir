'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Crown,
  Sparkles,
  Zap,
  CheckCircle,
  ArrowRight,
  X,
  Star,
  Rocket,
  Shield,
  Infinity,
  BarChart3,
  Download,
  Brain,
  Target,
} from 'lucide-react'

interface PremiumUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  featureName?: string
  limitInfo?: {
    current: number
    limit: number
    type: 'transaction' | 'analysis' | 'export'
  }
}

export default function PremiumUpgradeModal({
  isOpen,
  onClose,
  featureName = 'Premium Özellik',
  limitInfo,
}: PremiumUpgradeModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = () => {
    setIsLoading(true)
    router.push('/premium')
  }

  const getFeatureIcon = () => {
    if (limitInfo?.type === 'transaction') {
      return Infinity
    }
    if (limitInfo?.type === 'analysis') {
      return BarChart3
    }
    if (limitInfo?.type === 'export') {
      return Download
    }
    return Crown
  }

  const getFeatureDescription = () => {
    if (limitInfo?.type === 'transaction') {
      return `Aylık ${limitInfo.limit} işlem limitinize ulaştınız. Premium ile sınırsız işlem yapabilirsiniz!`
    }
    if (limitInfo?.type === 'analysis') {
      return `${featureName} Premium üyelik gerektirir. Gelişmiş analizlere erişim kazanın!`
    }
    if (limitInfo?.type === 'export') {
      return `Veri dışa aktarma özelliği Premium üyelik gerektirir. Raporlarınızı Excel, PDF formatında indirin!`
    }
    return `${featureName} Premium üyelik gerektirir.`
  }

  const FeatureIcon = getFeatureIcon()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
              <FeatureIcon className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              🚀 Premium'a Geçin!
            </DialogTitle>
            <DialogDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
              {getFeatureDescription()}
            </DialogDescription>
          </div>

          {/* Limit Info */}
          {limitInfo && (
            <Card className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Target className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-800 mb-1">Limit Uyarısı</h3>
                    <p className="text-red-700">
                      {limitInfo.type === 'transaction' && (
                        <>
                          Kullandığınız: <span className="font-bold">{limitInfo.current}</span> /{' '}
                          {limitInfo.limit} işlem
                        </>
                      )}
                      {limitInfo.type !== 'transaction' && (
                        <>Bu özellik Premium üyelik gerektirir</>
                      )}
                    </p>
                  </div>
                  <Badge variant="destructive" className="text-sm">
                    Limit Aşıldı
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Premium Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Infinity className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-purple-800">Sınırsız İşlem</h3>
                </div>
                <p className="text-purple-700 mb-4">
                  Artık işlem limiti endişesi yaşamayın. İstediğiniz kadar gelir-gider kaydı yapın.
                </p>
                <div className="flex items-center text-sm text-purple-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Aylık sınırsız işlem</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-800">AI Destekli Analiz</h3>
                </div>
                <p className="text-blue-700 mb-4">
                  Yapay zeka ile gelişmiş finansal analizler ve kişiselleştirilmiş öneriler.
                </p>
                <div className="flex items-center text-sm text-blue-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Akıllı öngörüler</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Download className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-800">Veri Dışa Aktarma</h3>
                </div>
                <p className="text-green-700 mb-4">
                  Raporlarınızı Excel, PDF formatında indirin ve istediğiniz yerde kullanın.
                </p>
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Çoklu format desteği</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-orange-800">Premium Destek</h3>
                </div>
                <p className="text-orange-700 mb-4">
                  7/24 öncelikli müşteri desteği ve hızlı çözüm garantisi.
                </p>
                <div className="flex items-center text-sm text-orange-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Öncelikli destek</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing */}
          <Card className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Crown className="h-6 w-6" />
                <h3 className="text-2xl font-bold">Premium Plan</h3>
              </div>
              <div className="text-4xl font-bold mb-2">₺250</div>
              <div className="text-purple-100 mb-6">/ ay</div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span>%99 Müşteri Memnuniyeti</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Anında Aktivasyon</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Rocket className="h-4 w-4" />
                  <span>Risk Yok Garantisi</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Yönlendiriliyor...
                </>
              ) : (
                <>
                  <Crown className="h-5 w-5 mr-2" />
                  Premium'a Geç - ₺250/ay
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>

            <Button
              onClick={onClose}
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg border-2 border-gray-300 hover:bg-gray-50"
            >
              Şimdi Değil
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Güvenli Ödeme</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>İstediğiniz Zaman İptal</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>Anında Aktivasyon</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

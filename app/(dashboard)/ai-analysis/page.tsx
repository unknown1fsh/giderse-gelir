'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/mosaic'
import { Button } from '@/components/mosaic'
import { Badge } from '@/components/mosaic'
import { useUser } from '@/lib/user-context'
import { usePremium } from '@/lib/use-premium'
import {
  Brain,
  FileText,
  Sparkles,
  Crown,
  ArrowLeft,
  Home,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Award,
} from 'lucide-react'

interface AIReport {
  id: number
  reportType: string
  reportDate: string
  status: string
  createdAt: string
}

interface ReportStatus {
  currentPlan: string
  limitInfo: {
    remaining: number
    total: number
    used: number
  }
  thisMonthReports: AIReport[]
  recentReports: AIReport[]
}

export default function AIAnalysisPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const {
    isPremium,
    isEnterprise,
    isEnterprisePremium,
    loading: premiumLoading,
    requirePremium,
  } = usePremium()
  const [reportStatus, setReportStatus] = useState<ReportStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Rapor durumunu yükle
  useEffect(() => {
    if (userLoading || premiumLoading) {
      return
    }

    async function fetchStatus() {
      try {
        const response = await fetch('/api/ai-analysis/report/status', {
          credentials: 'include',
        })

        if (response.ok) {
          const result = (await response.json()) as {
            success: boolean
            data: ReportStatus
          }
          if (result.success) {
            setReportStatus(result.data)
          }
        }
      } catch (err) {
        console.error('Status fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      void fetchStatus()
    } else {
      setLoading(false)
    }
  }, [user, userLoading, premiumLoading])

  // Rapor oluştur
  const handleGenerateReport = async () => {
    if (!requirePremium()) {
      return
    }

    if (generating) {
      return
    }

    setGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/ai-analysis/report/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string; limitExceeded?: boolean }
        if (errorData.limitExceeded) {
          setError(
            errorData.error ||
            'Bu ay için rapor limitiniz dolmuş. Limit bir sonraki ayın başında sıfırlanacak.'
          )
        } else {
          setError(errorData.error || 'Rapor oluşturulurken hata oluştu')
        }
        return
      }

      const result = (await response.json()) as {
        success: boolean
        data: { reportId: number }
      }

      if (result.success && result.data.reportId) {
        // Rapor detay sayfasına yönlendir
        void router.push(`/ai-analysis/${result.data.reportId}`)
      }
    } catch (err) {
      console.error('Generate report error:', err)
      setError('Rapor oluşturulurken bir hata oluştu')
    } finally {
      setGenerating(false)
    }
  }

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const isPremiumUser = isPremium || isEnterprise || isEnterprisePremium
  const planName = isEnterprisePremium
    ? 'Kurumsal Premium'
    : isEnterprise
      ? 'Kurumsal'
      : isPremium
        ? 'Premium'
        : 'Ücretsiz'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Home className="h-5 w-5" />
              </Link>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-mosaic">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    AI Destekli Finansal Analiz
                  </h1>
                  <p className="text-slate-300">
                    Yapay zeka ile detaylı finansal analiz raporlarınız
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl">
        {/* Premium Olmayan Kullanıcılar İçin */}
        {!isPremiumUser && (
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-300 mb-8">
            <CardContent className="p-8 text-center">
              <Brain className="h-16 w-16 text-purple-400 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-purple-900 mb-4">
                AI Destekli Finansal Analiz Raporu
              </h2>
              <p className="text-lg text-purple-700 mb-6">
                Finansal verilerinize göre yapay zeka destekli çeşitlendirilmiş analizler alın.
                <br />
                <span className="font-semibold">Ayda 4 kez detaylı rapor oluşturabilirsiniz.</span>
              </p>
              <Button
                onClick={() => requirePremium()}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg font-semibold shadow-2xl"
              >
                <Crown className="h-5 w-5 mr-2" />
                Premium&apos;a Geç ve AI Analiz Raporu Al
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Premium Kullanıcılar İçin */}
        {isPremiumUser && reportStatus && (
          <div className="space-y-6">
            {/* Limit Bilgisi ve Rapor Oluştur Butonu */}
            <Card className="bg-slate-800/80 backdrop-blur-xl border-2 border-purple-200">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-600">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">AI Analiz Raporu</h2>
                        <p className="text-slate-300">
                          {isEnterprisePremium
                            ? 'Ultra AI analiz raporu - En detaylı analiz ve öneriler'
                            : isEnterprise
                              ? 'Gelişmiş AI analiz raporu - Departman bazlı analiz'
                              : 'Temel AI analiz raporu - Finansal özet ve öneriler'}
                        </p>
                      </div>
                    </div>

                    {/* Limit Gösterimi */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="text-3xl font-bold text-purple-400">
                          {reportStatus.limitInfo.remaining}
                        </div>
                        <div className="text-slate-300">
                          / {reportStatus.limitInfo.total} rapor kaldı
                        </div>
                      </div>
                      <div className="flex-1 min-w-[120px] max-w-full sm:max-w-xs">
                        <div className="w-full bg-slate-700 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full transition-all duration-300"
                            style={{
                              width: `${(reportStatus.limitInfo.remaining / reportStatus.limitInfo.total) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <Badge
                        variant={reportStatus.limitInfo.remaining > 0 ? 'default' : 'destructive'}
                        className="text-sm px-4 py-1"
                      >
                        {reportStatus.limitInfo.remaining > 0 ? 'Kullanılabilir' : 'Limit Dolmuş'}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      void handleGenerateReport()
                    }}
                    disabled={generating || reportStatus.limitInfo.remaining === 0}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg font-semibold shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Rapor Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <Brain className="h-5 w-5 mr-2" />
                        Yeni Rapor Oluştur
                      </>
                    )}
                  </Button>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <p className="text-red-400">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Plan Özellikleri */}
            <Card className="bg-slate-800/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-purple-400" />
                  {planName} Plan Özellikleri
                </CardTitle>
                <CardDescription>
                  Plan türünüze göre rapor içeriği ve detay seviyesi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {isEnterprisePremium ? (
                    <>
                      <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-50 rounded-lg border border-amber-200">
                        <h3 className="font-semibold text-amber-900 mb-2">Ultra AI Analiz</h3>
                        <ul className="text-sm text-amber-800 space-y-1">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            30+ AI önerisi
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />6 ay tahmin
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Benchmark analizi
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Senaryo analizleri
                          </li>
                        </ul>
                      </div>
                    </>
                  ) : isEnterprise ? (
                    <>
                      <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                        <h3 className="font-semibold text-emerald-900 mb-2">Gelişmiş AI Analiz</h3>
                        <ul className="text-sm text-emerald-800 space-y-1">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            15-20 AI önerisi
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />3 ay tahmin
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Risk analizi
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Departman analizi
                          </li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-200">
                        <h3 className="font-semibold text-purple-900 mb-2">Temel AI Analiz</h3>
                        <ul className="text-sm text-purple-800 space-y-1">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            5-10 AI önerisi
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Kategori analizi
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Trend analizi
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Finansal özet
                          </li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bu Ayki Raporlar */}
            {reportStatus.thisMonthReports.length > 0 && (
              <Card className="bg-slate-800/80 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    Bu Ayki Raporlar ({reportStatus.thisMonthReports.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportStatus.thisMonthReports.map(report => (
                      <div
                        key={report.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              AI Analiz Raporu -{' '}
                              {new Date(report.reportDate).toLocaleDateString('tr-TR')}
                            </div>
                            <div className="text-sm text-slate-300 flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3" />
                              {new Date(report.createdAt).toLocaleString('tr-TR')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              report.status === 'completed'
                                ? 'default'
                                : report.status === 'processing'
                                  ? 'secondary'
                                  : 'destructive'
                            }
                          >
                            {report.status === 'completed'
                              ? 'Tamamlandı'
                              : report.status === 'processing'
                                ? 'İşleniyor'
                                : 'Hatalı'}
                          </Badge>
                          {report.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                void router.push(`/ai-analysis/${report.id}`)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Görüntüle
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Geçmiş Raporlar */}
            {reportStatus.recentReports.length > 0 && (
              <Card className="bg-slate-800/80 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-purple-400" />
                    Geçmiş Raporlar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportStatus.recentReports.slice(0, 5).map(report => (
                      <div
                        key={report.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-slate-400">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              AI Analiz Raporu -{' '}
                              {new Date(report.reportDate).toLocaleDateString('tr-TR')}
                            </div>
                            <div className="text-sm text-slate-300 flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(report.createdAt).toLocaleDateString('tr-TR')}
                            </div>
                          </div>
                        </div>
                        {report.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              void router.push(`/ai-analysis/${report.id}`)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Görüntüle
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Rapor Yoksa */}
        {isPremiumUser && reportStatus && reportStatus.thisMonthReports.length === 0 && (
          <Card className="bg-slate-800/80 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <Brain className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-200 mb-2">
                Henüz AI Analiz Raporu Oluşturulmamış
              </h3>
              <p className="text-slate-300 mb-6">
                İlk AI destekli finansal analiz raporunuzu oluşturarak başlayın
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

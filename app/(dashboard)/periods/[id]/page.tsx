'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/mosaic'
import { formatPeriodName, getPeriodTypeLabel } from '@/lib/period-helpers'
import {
  ArrowLeft,
  Lock,
  Unlock,
  TrendingUp,
  Wallet,
  Building2,
  Coins,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/mosaic'
import { useToast } from '@/lib/use-toast'
import { ConfirmationDialog } from '@/components/mosaic'

interface PeriodDetail {
  id: number
  userId: number
  name: string
  periodType: string
  startDate: string
  endDate: string
  isClosed: boolean
  isActive: boolean
  description?: string
  createdAt: string
  updatedAt: string
  _count: {
    transactions: number
    accounts: number
    creditCards: number
    eWallets: number
    investments: number
    goldItems: number
    autoPayments: number
  }
  periodClosing?: {
    closedAt: string
    totalAssets: string
    totalLiabilities: string
    netWorth: string
    closingNotes?: string
  }
}

export default function PeriodDetailPage() {
  const router = useRouter()
  const params = useParams()
  const periodId = params.id as string

  const [period, setPeriod] = useState<PeriodDetail | null>(null)
  const { success: toastSuccess, error: toastError } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPeriodDetail() {
      try {
        const response = await fetch(`/api/periods/${periodId}`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Dönem bulunamadı')
        }

        const data = (await response.json()) as { success?: boolean; period?: PeriodDetail }
        if (data.period) {
          setPeriod(data.period)
        }
      } catch (err) {
        console.error('Fetch period error:', err)
        setError(err instanceof Error ? err.message : 'Dönem yüklenemedi')
      } finally {
        setLoading(false)
      }
    }

    void fetchPeriodDetail()
  }, [periodId])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !period) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700 mb-2">
                {error || 'Dönem bulunamadı'}
              </h3>
              <Link
                href="/periods"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Dönemler Sayfasına Dön
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalRecords =
    period._count.transactions +
    period._count.accounts +
    period._count.creditCards +
    period._count.eWallets +
    period._count.investments +
    period._count.goldItems

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <PageHeader
        onBack={() => router.push('/periods')}
        backIcon={<ArrowLeft className="h-5 w-5" />}
        title={
          <div className="flex flex-wrap items-center gap-3 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold break-words">
              {formatPeriodName({
                id: period.id,
                userId: period.userId,
                name: period.name,
                periodType: period.periodType as 'YEARLY' | 'FISCAL_YEAR' | 'MONTHLY' | 'CUSTOM',
                startDate: new Date(period.startDate),
                endDate: new Date(period.endDate),
                isClosed: period.isClosed,
                isActive: period.isActive,
                description: period.description,
                createdAt: new Date(period.createdAt),
                updatedAt: new Date(period.updatedAt),
              })}
            </h1>
            {period.isClosed ? (
              <span className="flex items-center gap-1 px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm font-medium">
                <Lock className="h-4 w-4" />
                Kapalı
              </span>
            ) : period.isActive ? (
              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Aktif
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <Unlock className="h-4 w-4" />
                Açık
              </span>
            )}
          </div>
        }
        subtitle={
          <span className="break-words">
            {getPeriodTypeLabel(
              period.periodType as 'YEARLY' | 'FISCAL_YEAR' | 'MONTHLY' | 'CUSTOM'
            )}{' '}
            • {new Date(period.startDate).toLocaleDateString('tr-TR')} -{' '}
            {new Date(period.endDate).toLocaleDateString('tr-TR')}
          </span>
        }
      />

      {/* İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">İşlemler</p>
                <p className="text-2xl font-bold">{period._count.transactions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hesaplar</p>
                <p className="text-2xl font-bold">
                  {period._count.accounts + period._count.creditCards + period._count.eWallets}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Yatırımlar</p>
                <p className="text-2xl font-bold">{period._count.investments}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Altın</p>
                <p className="text-2xl font-bold">{period._count.goldItems}</p>
              </div>
              <Coins className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dönem Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>Dönem Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Dönem Adı</p>
              <p className="font-medium">{period.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Dönem Tipi</p>
              <p className="font-medium">
                {getPeriodTypeLabel(
                  period.periodType as 'YEARLY' | 'FISCAL_YEAR' | 'MONTHLY' | 'CUSTOM'
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Başlangıç Tarihi</p>
              <p className="font-medium">
                {new Date(period.startDate).toLocaleDateString('tr-TR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Bitiş Tarihi</p>
              <p className="font-medium">{new Date(period.endDate).toLocaleDateString('tr-TR')}</p>
            </div>
          </div>

          {period.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Açıklama</p>
              <p className="text-slate-700">{period.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kapanış Bilgileri (Eğer kapalıysa) */}
      {period.isClosed && period.periodClosing && (
        <Card className="border-slate-300 bg-slate-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Dönem Kapanış Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Toplam Varlıklar</p>
                <p className="text-xl font-bold text-green-600">
                  ₺
                  {parseFloat(period.periodClosing.totalAssets).toLocaleString('tr-TR', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Toplam Yükümlülükler</p>
                <p className="text-xl font-bold text-red-600">
                  ₺
                  {parseFloat(period.periodClosing.totalLiabilities).toLocaleString('tr-TR', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Net Değer</p>
                <p className="text-xl font-bold text-blue-600">
                  ₺
                  {parseFloat(period.periodClosing.netWorth).toLocaleString('tr-TR', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Kapanış Tarihi</p>
              <p className="font-medium">
                {new Date(period.periodClosing.closedAt).toLocaleString('tr-TR')}
              </p>
            </div>

            {period.periodClosing.closingNotes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Kapanış Notları</p>
                <p className="text-slate-700">{period.periodClosing.closingNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Uyarı Mesajları */}
      {!period.isClosed && totalRecords === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900 mb-1">Bu dönemde henüz veri yok</p>
                <p className="text-sm text-yellow-700">
                  Bu dönemi aktif yaparak işlem ve hesap ekleyebilir veya silebilirsiniz.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {period.isClosed && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900 mb-1">Bu dönem kapatılmış</p>
                <p className="text-sm text-blue-700">
                  Kapalı dönemler salt-okunurdur. İşlem ekleyemez veya düzenleyemezsiniz. Sadece
                  görüntüleme ve raporlama yapabilirsiniz.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {!period.isClosed && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/periods"
            className="w-full sm:flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-center font-medium"
          >
            Geri Dön
          </Link>
          {totalRecords === 0 && (
            <button
              onClick={() => {
                setIsDeleteDialogOpen(true)
              }}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Trash2 className="h-4 w-4 inline mr-2" />
              Dönemi Sil
            </button>
          )}
        </div>
      )}

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={async () => {
          setIsDeleteDialogOpen(false)
          const response = await fetch(`/api/periods/${periodId}`, {
            method: 'DELETE',
            credentials: 'include',
          })

          if (response.ok) {
            toastSuccess('Dönem başarıyla silindi')
            setTimeout(() => {
              router.push('/periods')
            }, 1000)
          } else {
            const data = (await response.json()) as { error?: string }
            toastError(data.error || 'Dönem silinemedi')
          }
        }}
        title="Dönemi Sil"
        message="Bu dönemi silmek istediğinizden emin misiniz?"
        warningMessage="Dönem kaydı kalıcı olarak silinecektir."
        confirmText="Evet, Sil"
        cancelText="İptal"
      />
    </div>
  )
}

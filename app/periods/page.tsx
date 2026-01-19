'use client'

import { usePeriod } from '@/lib/period-context'
import { formatPeriodName, getPeriodTypeLabel } from '@/lib/period-helpers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Calendar,
  Plus,
  Lock,
  Unlock,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useToast } from '@/lib/use-toast'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

export default function PeriodsPage() {
  const { periods, loading, activePeriod, changePeriod } = usePeriod()
  const { success: toastSuccess, error: toastError } = useToast()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [periodToDelete, setPeriodToDelete] = useState<number | null>(null)

  const handleDelete = async (periodId: number) => {
    setPeriodToDelete(periodId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!periodToDelete) return
    const periodId = periodToDelete
    setIsDeleteDialogOpen(false)

    setDeletingId(periodId)
    try {
      const response = await fetch(`/api/periods/${periodId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = (await response.json()) as { success?: boolean; error?: string }

      if (response.ok) {
        toastSuccess('Başarılı', 'Dönem başarıyla silindi')
        // Sayfayı yenile
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        toastError('Hata', data.error || 'Dönem silinemedi')
      }
    } catch (error) {
      console.error('Delete period error:', error)
      toastError('Hata', 'Dönem silinirken bir hata oluştu')
    } finally {
      setDeletingId(null)
      setPeriodToDelete(null)
    }
  }

  const handleActivate = async (periodId: number) => {
    await changePeriod(periodId)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  const openPeriods = periods.filter(p => !p.isClosed)
  const closedPeriods = periods.filter(p => p.isClosed)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dönem Yönetimi</h1>
          <p className="text-muted-foreground">Dönemlerinizi yönetin ve yeni dönem oluşturun</p>
        </div>
        <Link
          href="/periods/new"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Yeni Dönem Oluştur
        </Link>
      </div>

      {/* Aktif Dönem */}
      {activePeriod && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <CheckCircle2 className="h-5 w-5" />
              Aktif Dönem
            </CardTitle>
            <CardDescription>Şu anda bu dönemde çalışıyorsunuz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  {formatPeriodName(activePeriod)}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-blue-700">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(activePeriod.startDate).toLocaleDateString('tr-TR')} -{' '}
                    {new Date(activePeriod.endDate).toLocaleDateString('tr-TR')}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {getPeriodTypeLabel(
                      activePeriod.periodType as 'YEARLY' | 'FISCAL_YEAR' | 'MONTHLY' | 'CUSTOM'
                    )}
                  </span>
                </div>
              </div>
              <Link
                href={`/periods/${activePeriod.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Detaylar
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Açık Dönemler */}
      {openPeriods.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Unlock className="h-5 w-5 text-green-600" />
            Açık Dönemler ({openPeriods.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openPeriods.map(period => (
              <Card
                key={period.id}
                className={`hover:shadow-lg transition-shadow ${period.id === activePeriod?.id ? 'border-blue-300 bg-blue-50/30' : ''
                  }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{formatPeriodName(period)}</CardTitle>
                      <CardDescription className="mt-1">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                          {getPeriodTypeLabel(
                            period.periodType as 'YEARLY' | 'FISCAL_YEAR' | 'MONTHLY' | 'CUSTOM'
                          )}
                        </span>
                      </CardDescription>
                    </div>
                    {period.id === activePeriod?.id && (
                      <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-slate-600">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {new Date(period.startDate).toLocaleDateString('tr-TR')} -{' '}
                      {new Date(period.endDate).toLocaleDateString('tr-TR')}
                    </div>

                    {period.description && (
                      <p className="text-sm text-slate-500">{period.description}</p>
                    )}

                    <div className="flex gap-2 pt-2">
                      {period.id !== activePeriod?.id && (
                        <button
                          onClick={() => void handleActivate(period.id)}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          Aktif Yap
                        </button>
                      )}
                      <Link
                        href={`/periods/${period.id}`}
                        className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 text-sm rounded hover:bg-slate-200 transition-colors text-center"
                      >
                        Detaylar
                      </Link>
                      <button
                        onClick={() => void handleDelete(period.id)}
                        disabled={deletingId === period.id}
                        className="px-3 py-2 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Kapalı Dönemler */}
      {closedPeriods.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5 text-slate-500" />
            Kapalı Dönemler ({closedPeriods.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {closedPeriods.map(period => (
              <Card key={period.id} className="opacity-75 hover:opacity-100 transition-opacity">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-slate-600">
                        {formatPeriodName(period)}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs font-medium">
                          {getPeriodTypeLabel(
                            period.periodType as 'YEARLY' | 'FISCAL_YEAR' | 'MONTHLY' | 'CUSTOM'
                          )}
                        </span>
                      </CardDescription>
                    </div>
                    <Lock className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-slate-500">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {new Date(period.startDate).toLocaleDateString('tr-TR')} -{' '}
                      {new Date(period.endDate).toLocaleDateString('tr-TR')}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <XCircle className="h-4 w-4" />
                      <span>Dönem kapatılmış</span>
                    </div>

                    <div className="pt-2">
                      <Link
                        href={`/periods/${period.id}`}
                        className="block w-full px-3 py-2 bg-slate-100 text-slate-600 text-sm rounded hover:bg-slate-200 transition-colors text-center"
                      >
                        Görüntüle
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Boş Durum */}
      {periods.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Henüz dönem yok</h3>
            <p className="text-slate-500 mb-6 text-center max-w-md">
              İlk döneminizi oluşturarak gelir ve giderlerinizi takip etmeye başlayın
            </p>
            <Link
              href="/periods/new"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Plus className="mr-2 h-4 w-4" />
              İlk Dönemi Oluştur
            </Link>
          </CardContent>
        </Card>
      )}

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setPeriodToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Dönemi Sil"
        message="Bu dönemi silmek istediğinizden emin misiniz?"
        warningMessage="Bu işlem geri alınamaz. Döneme ait tüm veriler (işlemler, raporlar vb.) silinecektir."
        confirmText="Evet, Sil"
        cancelText="İptal"
      />
    </div>
  )
}

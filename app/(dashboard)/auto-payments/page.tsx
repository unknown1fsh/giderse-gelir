'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Calendar,
  Clock,
  AlertCircle,
  ArrowLeft,
  Home,
  Wallet,
  CreditCard,
  Tag,
} from 'lucide-react'
import { formatCurrency } from '@/lib/validators'

interface AutoPayment {
  id: number
  name: string
  description: string | null
  amount: string
  frequency: string
  nextPaymentDate: string
  endDate: string | null
  active: boolean
  account: {
    id: number
    name: string
    bank: {
      name: string
    }
    currency: {
      code: string
    }
  } | null
  creditCard: {
    id: number
    name: string
    bank: {
      name: string
    }
    currency: {
      code: string
    }
  } | null
  category: {
    id: number
    name: string
  }
  createdAt: string
}

export default function AutoPaymentsPage() {
  const router = useRouter()
  const [autoPayments, setAutoPayments] = useState<AutoPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAutoPayments() {
      try {
        const response = await fetch('/api/auto-payments', {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setAutoPayments(data)
        } else {
          setError('Otomatik ödemeler yüklenemedi')
        }
      } catch (error) {
        console.error('Otomatik ödemeler yüklenirken hata:', error)
        setError('Otomatik ödemeler yüklenirken hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    fetchAutoPayments()
  }, [])

  // Hesaplamalar
  const activePayments = autoPayments.filter(payment => payment.active)
  const thisMonthPayments = autoPayments.filter(payment => {
    const nextDate = new Date(payment.nextPaymentDate)
    const now = new Date()
    return nextDate.getMonth() === now.getMonth() && nextDate.getFullYear() === now.getFullYear()
  })
  const upcomingPayments = autoPayments.filter(payment => {
    const nextDate = new Date(payment.nextPaymentDate)
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return nextDate >= now && nextDate <= sevenDaysFromNow
  })

  const thisMonthTotal = thisMonthPayments.reduce(
    (sum, payment) => sum + parseFloat(payment.amount),
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
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
            <h1 className="text-3xl font-bold">Otomatik Ödemeler</h1>
            <p className="text-muted-foreground">Düzenli ödemelerinizi otomatikleştirin</p>
          </div>
        </div>
        <Link
          href="/auto-payments/new"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Yeni Otomatik Ödeme
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Otomatik ödemeler yükleniyor...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktif Ödemeler</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{activePayments.length}</div>
                <p className="text-xs text-muted-foreground">Aktif otomatik ödeme sayısı</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bu Ay Ödenecek</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(thisMonthTotal, 'TRY')}
                </div>
                <p className="text-xs text-muted-foreground">Bu ay ödenecek toplam tutar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Yaklaşan Ödemeler</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{upcomingPayments.length}</div>
                <p className="text-xs text-muted-foreground">Önümüzdeki 7 günde ödenecek</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Otomatik Ödeme Listesi</CardTitle>
          <CardDescription>Tüm otomatik ödemelerinizin listesi</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Otomatik ödemeler yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          ) : autoPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2" />
              <p>Henüz otomatik ödeme eklenmemiş</p>
              <Link href="/auto-payments/new" className="text-blue-600 hover:underline">
                İlk otomatik ödemenizi ekleyin
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {autoPayments.map(payment => (
                <div
                  key={payment.id}
                  className="group p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200 bg-gradient-to-r from-slate-50 to-slate-100/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <h3 className="font-semibold text-slate-800">{payment.name}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          {payment.frequency === 'MONTHLY'
                            ? 'Aylık'
                            : payment.frequency === 'WEEKLY'
                              ? 'Haftalık'
                              : payment.frequency === 'YEARLY'
                                ? 'Yıllık'
                                : 'Diğer'}
                        </span>
                      </div>

                      {payment.description && (
                        <p className="text-sm text-slate-600 mb-2">{payment.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {payment.category.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(payment.nextPaymentDate).toLocaleDateString('tr-TR')}
                        </div>
                        {payment.account && (
                          <div className="flex items-center gap-1">
                            <Wallet className="h-3 w-3" />
                            {payment.account.name}
                          </div>
                        )}
                        {payment.creditCard && (
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            {payment.creditCard.name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(parseFloat(payment.amount), 'TRY')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {payment.frequency === 'MONTHLY'
                          ? 'Aylık'
                          : payment.frequency === 'WEEKLY'
                            ? 'Haftalık'
                            : payment.frequency === 'YEARLY'
                              ? 'Yıllık'
                              : 'Diğer'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

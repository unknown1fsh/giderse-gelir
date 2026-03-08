'use client'

import { useState, useEffect } from 'react'
import DataTable from './DataTable'
import { Badge } from '@/components/mosaic'
import { formatCurrency } from '@/lib/validators'
import { getDisplayName } from '@/lib/utils'

interface Subscription {
  id: number
  planId: string
  status: string
  startDate: string
  endDate: string
  amount: number
  currency: string
  user: {
    id: number
    username?: string
    name?: string
    email: string
  }
}

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    void fetchSubscriptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
      })

      const response = await fetch(`/api/admin/subscriptions?${params.toString()}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Abonelik listesi alınamadı')
      }

      const result = (await response.json()) as {
        success: boolean
        data: { subscriptions: Subscription[]; pagination: { totalPages: number } }
      }
      if (result.success) {
        setSubscriptions(result.data.subscriptions)
        setTotalPages(result.data.pagination.totalPages)
      }
    } catch (err) {
      console.error('Subscriptions fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const headers = ['ID', 'Kullanıcı', 'Plan', 'Durum', 'Başlangıç', 'Bitiş', 'Tutar']
    const rows = subscriptions.map(sub => [
      sub.id,
      getDisplayName(sub.user),
      sub.planId,
      sub.status,
      new Date(sub.startDate).toLocaleDateString('tr-TR'),
      new Date(sub.endDate).toLocaleDateString('tr-TR'),
      `${sub.currency}${sub.amount}`,
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `abonelikler_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Aktif</Badge>
      case 'cancelled':
        return <Badge variant="destructive">İptal</Badge>
      case 'expired':
        return <Badge variant="secondary">Süresi Dolmuş</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const columns = [
    {
      key: 'user',
      header: 'Kullanıcı',
      render: (sub: Subscription) => (
        <div>
          <div className="text-sm font-medium text-foreground">{getDisplayName(sub.user)}</div>
          <div className="text-sm text-muted-foreground">{sub.user.email}</div>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (sub: Subscription) => <Badge variant="outline">{sub.planId}</Badge>,
    },
    {
      key: 'status',
      header: 'Durum',
      render: (sub: Subscription) => getStatusBadge(sub.status),
    },
    {
      key: 'dates',
      header: 'Tarihler',
      render: (sub: Subscription) => (
        <div className="text-sm">
          <div>Başlangıç: {new Date(sub.startDate).toLocaleDateString('tr-TR')}</div>
          <div>Bitiş: {new Date(sub.endDate).toLocaleDateString('tr-TR')}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Tutar',
      render: (sub: Subscription) => (
        <span className="font-semibold">{formatCurrency(Number(sub.amount), sub.currency)}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <DataTable
        data={subscriptions}
        columns={columns}
        loading={loading}
        pagination={{
          page: currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        exportable={true}
        onExport={handleExport}
        emptyMessage="Abonelik bulunamadı"
      />
    </div>
  )
}

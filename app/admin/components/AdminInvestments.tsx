'use client'

import { useState, useEffect } from 'react'
import DataTable from './DataTable'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/validators'
import { getDisplayName } from '@/lib/utils'

interface Investment {
  id: number
  name: string
  investmentType: string
  symbol?: string
  quantity: number
  purchasePrice: number
  currentPrice?: number
  currency: {
    code: string
    symbol: string
  }
  user: {
    id: number
    username?: string
    name?: string
    email: string
  }
}

export default function AdminInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    void fetchInvestments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const fetchInvestments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
      })

      const response = await fetch(`/api/admin/investments?${params.toString()}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Yatırım listesi alınamadı')
      }

      const result = (await response.json()) as {
        success: boolean
        data: { investments: Investment[]; pagination: { totalPages: number } }
      }
      if (result.success) {
        setInvestments(result.data.investments)
        setTotalPages(result.data.pagination.totalPages)
      }
    } catch (err) {
      console.error('Investments fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const headers = [
      'ID',
      'Kullanıcı',
      'Ad',
      'Tip',
      'Sembol',
      'Miktar',
      'Alış Fiyatı',
      'Güncel Fiyat',
    ]
    const rows = investments.map(inv => [
      inv.id,
      getDisplayName(inv.user),
      inv.name,
      inv.investmentType,
      inv.symbol || '-',
      inv.quantity.toString(),
      `${inv.currency.symbol}${inv.purchasePrice}`,
      inv.currentPrice ? `${inv.currency.symbol}${inv.currentPrice}` : '-',
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `yatirimlar_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const columns = [
    {
      key: 'user',
      header: 'Kullanıcı',
      render: (inv: Investment) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{getDisplayName(inv.user)}</div>
          <div className="text-sm text-slate-500">{inv.user.email}</div>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Yatırım',
      render: (inv: Investment) => (
        <div>
          <div className="font-medium">{inv.name}</div>
          {inv.symbol && <div className="text-sm text-slate-500">{inv.symbol}</div>}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tip',
      render: (inv: Investment) => <Badge variant="secondary">{inv.investmentType}</Badge>,
    },
    {
      key: 'quantity',
      header: 'Miktar',
      render: (inv: Investment) => <span>{inv.quantity}</span>,
    },
    {
      key: 'purchasePrice',
      header: 'Alış Fiyatı',
      render: (inv: Investment) => (
        <span>{formatCurrency(Number(inv.purchasePrice), inv.currency.code)}</span>
      ),
    },
    {
      key: 'currentPrice',
      header: 'Güncel Fiyat',
      render: (inv: Investment) => (
        <span>
          {inv.currentPrice ? formatCurrency(Number(inv.currentPrice), inv.currency.code) : '-'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <DataTable
        data={investments}
        columns={columns}
        loading={loading}
        pagination={{
          page: currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        exportable={true}
        onExport={handleExport}
        emptyMessage="Yatırım bulunamadı"
      />
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import DataTable from './DataTable'
import { Badge } from '@/components/mosaic'
import { formatCurrency } from '@/lib/validators'
import { getDisplayName } from '@/lib/utils'

interface Transaction {
  id: number
  amount: number
  transactionDate: string
  description?: string
  user: {
    id: number
    username?: string
    name?: string
    email: string
  }
  category: {
    id: number
    name: string
  }
  txType: {
    id: number
    name: string
  }
  currency: {
    code: string
    symbol: string
  }
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    void fetchTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
      })

      const response = await fetch(`/api/admin/transactions?${params.toString()}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('İşlem listesi alınamadı')
      }

      const result = (await response.json()) as {
        success: boolean
        data: { transactions: Transaction[]; pagination: { totalPages: number } }
      }
      if (result.success) {
        setTransactions(result.data.transactions)
        setTotalPages(result.data.pagination.totalPages)
      }
    } catch (err) {
      console.error('Transactions fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const headers = ['ID', 'Kullanıcı', 'Kategori', 'Tip', 'Tutar', 'Tarih', 'Açıklama']
    const rows = transactions.map(tx => [
      tx.id,
      getDisplayName(tx.user),
      tx.category.name,
      tx.txType.name,
      `${tx.currency.symbol}${tx.amount}`,
      new Date(tx.transactionDate).toLocaleDateString('tr-TR'),
      tx.description || '',
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `islemler_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const columns = [
    {
      key: 'user',
      header: 'Kullanıcı',
      render: (tx: Transaction) => (
        <div>
          <div className="text-sm font-medium text-foreground">{getDisplayName(tx.user)}</div>
          <div className="text-sm text-muted-foreground">{tx.user.email}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      render: (tx: Transaction) => <Badge variant="secondary">{tx.category.name}</Badge>,
    },
    {
      key: 'type',
      header: 'Tip',
      render: (tx: Transaction) => (
        <Badge variant={tx.txType.name === 'Gelir' ? 'default' : 'destructive'}>
          {tx.txType.name}
        </Badge>
      ),
    },
    {
      key: 'amount',
      header: 'Tutar',
      render: (tx: Transaction) => (
        <span className="font-semibold">{formatCurrency(Number(tx.amount), tx.currency.code)}</span>
      ),
    },
    {
      key: 'date',
      header: 'Tarih',
      render: (tx: Transaction) => (
        <span className="text-sm text-muted-foreground">
          {new Date(tx.transactionDate).toLocaleDateString('tr-TR')}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Açıklama',
      render: (tx: Transaction) => (
        <span className="text-sm text-muted-foreground">{tx.description || '-'}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <DataTable
        data={transactions}
        columns={columns}
        loading={loading}
        pagination={{
          page: currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        exportable={true}
        onExport={handleExport}
        emptyMessage="İşlem bulunamadı"
      />
    </div>
  )
}

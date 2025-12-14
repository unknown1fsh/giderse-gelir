'use client'

import { useState, useEffect } from 'react'
import DataTable from './DataTable'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/validators'
import { getDisplayName } from '@/lib/utils'

interface Account {
  id: number
  name: string
  balance: number
  accountNumber?: string
  iban?: string
  active: boolean
  user: {
    id: number
    username?: string
    name?: string
    email: string
  }
  bank: {
    id: number
    name: string
  }
  accountType: {
    id: number
    name: string
  }
  currency: {
    code: string
    symbol: string
  }
}

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    void fetchAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
      })

      const response = await fetch(`/api/admin/accounts?${params.toString()}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Hesap listesi alınamadı')
      }

      const result = (await response.json()) as {
        success: boolean
        data: { accounts: Account[]; pagination: { totalPages: number } }
      }
      if (result.success) {
        setAccounts(result.data.accounts)
        setTotalPages(result.data.pagination.totalPages)
      }
    } catch (err) {
      console.error('Accounts fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const headers = ['ID', 'Kullanıcı', 'Hesap Adı', 'Banka', 'Tip', 'Bakiye', 'Durum']
    const rows = accounts.map(acc => [
      acc.id,
      getDisplayName(acc.user),
      acc.name,
      acc.bank.name,
      acc.accountType.name,
      `${acc.currency.symbol}${acc.balance}`,
      acc.active ? 'Aktif' : 'Pasif',
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `hesaplar_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const columns = [
    {
      key: 'user',
      header: 'Kullanıcı',
      render: (acc: Account) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{acc.user.name}</div>
          <div className="text-sm text-slate-500">{acc.user.email}</div>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Hesap Adı',
      render: (acc: Account) => <span className="font-medium">{acc.name}</span>,
    },
    {
      key: 'bank',
      header: 'Banka',
      render: (acc: Account) => <Badge variant="secondary">{acc.bank.name}</Badge>,
    },
    {
      key: 'type',
      header: 'Tip',
      render: (acc: Account) => <span className="text-sm">{acc.accountType.name}</span>,
    },
    {
      key: 'balance',
      header: 'Bakiye',
      render: (acc: Account) => (
        <span className="font-semibold">
          {formatCurrency(Number(acc.balance), acc.currency.code)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Durum',
      render: (acc: Account) => (
        <Badge variant={acc.active ? 'default' : 'destructive'}>
          {acc.active ? 'Aktif' : 'Pasif'}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <DataTable
        data={accounts}
        columns={columns}
        loading={loading}
        pagination={{
          page: currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        exportable={true}
        onExport={handleExport}
        emptyMessage="Hesap bulunamadı"
      />
    </div>
  )
}

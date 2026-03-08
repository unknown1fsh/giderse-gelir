'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, PageHeader } from '@/components/mosaic'
import {
  Wallet,
  Plus,
  Building2,
  CreditCard,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Copy,
} from 'lucide-react'
import { formatCurrency } from '@/lib/validators'

interface BankAccount {
  id: number
  uniqueId: string
  name: string
  balance: string
  accountNumber?: string | null
  iban?: string | null
  accountType: {
    id: number
    name: string
  }
  bank: {
    id: number
    name: string
    asciiName: string
  }
  currency: {
    id: number
    code: string
    name: string
    symbol: string
  }
  createdAt: string
  updatedAt: string
}

export default function BankAccountsPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBankAccounts() {
      try {
        const response = await fetch('/api/accounts/bank')
        if (response.ok) {
          const data = await response.json()
          setBankAccounts(data)
        } else {
          setError('Banka hesapları yüklenemedi')
        }
      } catch (error) {
        console.error('Banka hesapları yüklenirken hata:', error)
        setError('Banka hesapları yüklenirken hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    fetchBankAccounts()
  }, [])

  // Toplam bakiye hesaplama
  const totalBalance = bankAccounts.reduce((sum, account) => {
    // Basit döviz dönüşümü (gerçek uygulamada API'den alınmalı)
    const rate = account.currency.code === 'USD' ? 30 : account.currency.code === 'EUR' ? 32 : 1
    return sum + parseFloat(account.balance) * rate
  }, 0)

  const handleCopyIban = (iban: string) => {
    navigator.clipboard.writeText(iban)
    // Toast bildirimi eklenebilir
  }

  const handleCopyAccountNumber = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber)
    // Toast bildirimi eklenebilir
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banka Hesapları"
        description="Banka hesaplarınızı görüntüleyin, bakiyeleri izleyin ve detayları yönetin."
        breadcrumbs={[{ label: 'Hesaplar', href: '/accounts' }, { label: 'Banka Hesapları' }]}
        actions={(
          <Link href="/accounts/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Hesap
            </Button>
          </Link>
        )}
      />

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Hesap</CardTitle>
            <Wallet className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{bankAccounts.length}</div>
            <p className="text-xs text-muted-foreground">Aktif banka hesabı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Bakiye</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(totalBalance, 'TRY')}
            </div>
            <p className="text-xs text-muted-foreground">Tüm hesaplar toplamı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Farklı Banka</CardTitle>
            <Building2 className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {new Set(bankAccounts.map(acc => acc.bank.name)).size}
            </div>
            <p className="text-xs text-muted-foreground">Farklı banka sayısı</p>
          </CardContent>
        </Card>
      </div>

      {/* Hesap Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Hesap Detayları</CardTitle>
          <CardDescription>Tüm banka hesaplarınızın detaylı listesi</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-300">Hesaplar yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400">{error}</p>
            </div>
          ) : bankAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-8 w-8 mx-auto mb-2" />
              <p>Henüz banka hesabı eklenmemiş</p>
              <Link href="/accounts/new" className="text-blue-400 hover:underline">
                İlk hesabınızı ekleyin
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bankAccounts.map(account => (
                <div
                  key={account.uniqueId}
                  className="p-6 border border-slate-700 rounded-xl hover:shadow-md transition-all duration-200 bg-gradient-to-r from-blue-500/10 to-blue-100/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500" />
                        <h3 className="text-xl font-semibold text-slate-100">{account.name}</h3>
                        <Badge variant="secondary" className="bg-blue-500/15 text-blue-400">
                          {account.accountType.name}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-slate-300 font-medium">{account.bank.name}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        {account.accountNumber && (
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <span>Hesap No: {account.accountNumber}</span>
                            <button
                              onClick={() => handleCopyAccountNumber(account.accountNumber!)}
                              className="p-1 hover:bg-accent rounded"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        )}

                        {account.iban && (
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            <span className="font-mono text-xs">IBAN: {account.iban}</span>
                            <button
                              onClick={() => handleCopyIban(account.iban!)}
                              className="p-1 hover:bg-accent rounded"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-400 mb-1">
                        {formatCurrency(parseFloat(account.balance), account.currency.code)}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {account.currency.name} ({account.currency.symbol})
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Görüntüle
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Düzenle
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Sil
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 pt-2 border-t border-slate-700">
                    Oluşturulma: {new Date(account.createdAt).toLocaleDateString('tr-TR')} • Son
                    güncelleme: {new Date(account.updatedAt).toLocaleDateString('tr-TR')}
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

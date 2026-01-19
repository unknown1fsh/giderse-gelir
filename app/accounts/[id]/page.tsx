'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Home,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
} from 'lucide-react'
import { formatCurrency } from '@/lib/validators'
import { EditNameModal } from '@/components/ui/edit-name-modal'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import PageHeader from '@/components/page-header'
import { useToast } from '@/lib/use-toast'

interface Transaction {
  id: number
  amount: string
  transactionDate: string
  description: string | null
  txType: {
    id: number
    name: string
    code: string
  }
  category: {
    id: number
    name: string
  }
  paymentMethod: {
    id: number
    name: string
  }
  currency: {
    code: string
  }
}

interface AccountDetail {
  id: number
  name: string
  balance: string
  accountNumber: string | null
  iban: string | null
  createdAt: string
  bank: {
    name: string
  }
  currency: {
    code: string
  }
  accountType: {
    name: string
  }
  transactions: Transaction[]
}

export default function AccountDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useToast()
  const accountId = params.id as string

  const [account, setAccount] = useState<AccountDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [transactionCount, setTransactionCount] = useState(0)

  useEffect(() => {
    async function fetchAccountDetail() {
      try {
        const response = await fetch(`/api/accounts/${accountId}`)
        if (response.ok) {
          const data = await response.json()
          setAccount(data)
          setTransactionCount(data.transactions.length)
        } else {
          setError('Hesap bulunamadı')
        }
      } catch (error) {
        console.error('Hesap detayları yüklenirken hata:', error)
        setError('Hesap detayları yüklenirken hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    fetchAccountDetail()
  }, [accountId])

  const handleEditName = async (newName: string) => {
    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
        credentials: 'include',
      })

      if (response.ok) {
        await response.json()
        setAccount(prev => (prev ? { ...prev, name: newName } : null))
        toastSuccess('Başarılı', 'Hesap adı başarıyla güncellendi')
      } else {
        toastError('Hata', 'Hesap adı güncellenemedi')
      }
    } catch (error) {
      console.error('Hesap güncelleme hatası:', error)
      toastError('Hata', 'Hesap güncellenirken hata oluştu')
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        toastSuccess('Başarılı', result.message)
        router.push('/accounts')
      } else {
        toastError('Hata', 'Hesap silinemedi')
      }
    } catch (error) {
      console.error('Hesap silme hatası:', error)
      toastError('Hata', 'Hesap silinirken hata oluştu')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !account) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-red-600">{error || 'Hesap bulunamadı'}</div>
        </div>
      </div>
    )
  }

  // İstatistikler hesapla
  const totalIncome = account.transactions
    .filter(tx => tx.txType.code === 'GELIR')
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)

  const totalExpense = account.transactions
    .filter(tx => tx.txType.code === 'GIDER')
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)

  const netChange = totalIncome - totalExpense
  const currentBalance = parseFloat(account.balance)

  // Açılış bakiyesi = Mevcut bakiye - (İşlemlerden gelen net değişim)
  const openingBalance = currentBalance - netChange

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title={<h1 className="text-2xl sm:text-3xl font-bold break-words">{account.name}</h1>}
        subtitle={
          <span className="break-words">
            {account.bank.name} - {account.accountType.name}
          </span>
        }
        onBack={() => router.back()}
        backIcon={<ArrowLeft className="h-5 w-5" />}
        leadingActions={[
          { href: '/dashboard', ariaLabel: 'Dashboard', icon: <Home className="h-5 w-5" /> },
        ]}
        trailing={
          <>
            <button
              onClick={() => setShowEditModal(true)}
              className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Düzenle
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Sil
            </button>
          </>
        }
      />

      {/* Hesap Bilgileri */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-slate-500 to-slate-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Açılış Bakiyesi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(openingBalance, account.currency.code)}
            </div>
            <p className="text-xs opacity-75 mt-1">Başlangıç</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Mevcut Bakiye</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(currentBalance, account.currency.code)}
            </div>
            <p className="text-xs opacity-75 mt-1">{account.transactions.length} işlem</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium opacity-90">Toplam Gelir</CardTitle>
              <TrendingUp className="h-4 w-4 opacity-75" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalIncome, account.currency.code)}
            </div>
            <p className="text-xs opacity-75 mt-1">
              {account.transactions.filter(tx => tx.txType.code === 'GELIR').length} işlem
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium opacity-90">Toplam Gider</CardTitle>
              <TrendingDown className="h-4 w-4 opacity-75" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalExpense, account.currency.code)}
            </div>
            <p className="text-xs opacity-75 mt-1">
              {account.transactions.filter(tx => tx.txType.code === 'GIDER').length} işlem
            </p>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-br ${netChange >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-orange-500 to-orange-600'} text-white`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium opacity-90">Net Değişim</CardTitle>
              <DollarSign className="h-4 w-4 opacity-75" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {netChange >= 0 ? '+' : ''}
              {formatCurrency(Math.abs(netChange), account.currency.code)}
            </div>
            <p className="text-xs opacity-75 mt-1">Transaction toplamı</p>
          </CardContent>
        </Card>
      </div>

      {/* Hesap Detayları */}
      <Card>
        <CardHeader>
          <CardTitle>Hesap Detayları</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {account.accountNumber && (
            <div>
              <div className="text-sm text-muted-foreground">Hesap Numarası</div>
              <div className="font-medium">{account.accountNumber}</div>
            </div>
          )}
          {account.iban && (
            <div>
              <div className="text-sm text-muted-foreground">IBAN</div>
              <div className="font-medium font-mono text-xs sm:text-sm break-all">
                {account.iban}
              </div>
            </div>
          )}
          <div>
            <div className="text-sm text-muted-foreground">Açılış Tarihi</div>
            <div className="font-medium">
              {new Date(account.createdAt).toLocaleDateString('tr-TR')}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Para Birimi</div>
            <div className="font-medium">{account.currency.code}</div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>İşlem Geçmişi ({account.transactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {account.transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Bu hesapta henüz işlem yok</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Açılış Bakiyesi Göster */}
              {openingBalance !== 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 rounded-lg border bg-slate-50">
                  <div className="min-w-0 flex items-center gap-4">
                    <div className="p-2 rounded-full bg-slate-100 text-slate-600">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">Açılış Bakiyesi</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(account.createdAt).toLocaleDateString('tr-TR')} · Başlangıç
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-lg font-semibold text-slate-700">
                      {formatCurrency(openingBalance, account.currency.code)}
                    </div>
                    <div className="text-xs text-muted-foreground">Bakiye</div>
                  </div>
                </div>
              )}

              {
                account.transactions
                  .sort(
                    (a, b) =>
                      new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
                  )
                  .reduce(
                    (acc, tx, index) => {
                      const isIncome = tx.txType.code === 'GELIR'
                      const amount = parseFloat(tx.amount)

                      // Kümülatif bakiye hesapla
                      const previousBalance = index === 0 ? openingBalance : acc.balances[index - 1]
                      const runningBalance = isIncome
                        ? previousBalance + amount
                        : previousBalance - amount

                      acc.balances.push(runningBalance)

                      acc.elements.push(
                        <div
                          key={tx.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                        >
                          <div className="min-w-0 flex items-center gap-4">
                            <div
                              className={`p-2 rounded-full ${isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                            >
                              {isIncome ? (
                                <TrendingUp className="h-5 w-5" />
                              ) : (
                                <TrendingDown className="h-5 w-5" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{tx.category.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(tx.transactionDate).toLocaleDateString('tr-TR')} ·{' '}
                                {tx.paymentMethod.name}
                              </div>
                              {tx.description && (
                                <div className="text-xs text-muted-foreground mt-1 break-words">
                                  {tx.description}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div
                              className={`text-lg font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {isIncome ? '+' : '-'}
                              {formatCurrency(amount, tx.currency.code)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Bakiye: {formatCurrency(runningBalance, account.currency.code)}
                            </div>
                          </div>
                        </div>
                      )

                      return acc
                    },
                    { elements: [] as JSX.Element[], balances: [] as number[] }
                  ).elements
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Düzenleme Modal */}
      <EditNameModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        currentName={account.name}
        onSave={handleEditName}
        title="Hesap Adını Düzenle"
        description="Hesabınızın görünen adını değiştirin"
      />

      {/* Silme Onay Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Hesabı Sil"
        message={`"${account.name}" hesabını silmek istediğinize emin misiniz?`}
        warningMessage={
          transactionCount > 0
            ? `Bu hesapta ${transactionCount} işlem kaydı var. Hesap silindiğinde TÜM İŞLEMLER de silinecektir!`
            : 'Bu işlem geri alınamaz.'
        }
        confirmText="Evet, Sil"
        cancelText="İptal"
      />
    </div>
  )
}

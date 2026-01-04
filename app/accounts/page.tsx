'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EditNameModal } from '@/components/ui/edit-name-modal'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { usePremium } from '@/lib/use-premium'
import { useToast } from '@/lib/use-toast'
import {
  Wallet,
  CreditCard,
  Coins,
  ArrowLeft,
  Home,
  Plus,
  Edit2,
  Trash2,
  Crown,
  TrendingUp,
  Banknote,
  Building2,
  ChevronRight,
} from 'lucide-react'
import { formatCurrency } from '@/lib/validators'

interface BankAccount {
  id: number
  name: string
  balance: string
  accountNumber?: string
  iban?: string
  bank: { id: number; name: string }
  currency: { id: number; code: string; name: string }
  createdAt: string
}

interface EWallet {
  id: number
  name: string
  provider: string
  balance: string
  accountEmail?: string
  accountPhone?: string
  currency: { id: number; code: string; name: string }
  createdAt: string
}

interface CreditCardType {
  id: number
  name: string
  limitAmount: string
  availableLimit: string
  dueDay: number
  bank: { id: number; name: string }
  currency: { id: number; code: string; name: string }
  createdAt: string
}

interface GoldItem {
  id: number
  name: string
  weightGrams: string
  purchasePrice: string
  currentValueTry: string | null
  goldType: { id: number; name: string }
  goldPurity: { id: number; name: string }
  createdAt: string
}

type TabType = 'all' | 'cash' | 'bank' | 'cards' | 'ewallet' | 'gold'

export default function AccountsPage() {
  const router = useRouter()
  const { isPremium, handlePremiumFeature } = usePremium()
  const { success: toastSuccess, error: toastError } = useToast()

  const [cashAccounts, setCashAccounts] = useState<BankAccount[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [eWallets, setEWallets] = useState<EWallet[]>([])
  const [creditCards, setCreditCards] = useState<CreditCardType[]>([])
  const [goldItems, setGoldItems] = useState<GoldItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('all')

  // Edit/Delete states
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{
    id: number
    name: string
    type: 'account' | 'ewallet' | 'card'
  } | null>(null)
  const [transactionCount, setTransactionCount] = useState(0)
  const fetchedRef = useRef(false)

  useEffect(() => {
    // React StrictMode'da çift çağrıyı önle
    if (fetchedRef.current) return
    fetchedRef.current = true
    void fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchData() {
    try {
      const [accountsRes, ewalletsRes, cardsRes, goldRes] = await Promise.all([
        fetch('/api/accounts', { credentials: 'include' }),
        fetch('/api/ewallets', { credentials: 'include' }).catch(() => null),
        fetch('/api/cards', { credentials: 'include' }).catch(() => null),
        fetch('/api/gold', { credentials: 'include' }).catch(() => null),
      ])

      if (accountsRes.ok) {
        const accountsData = (await accountsRes.json()) as BankAccount[]
        // Nakit hesapları: accountNumber === 'CASH' VEYA ismi 'Nakit' içerenler
        const isCashAccount = (acc: BankAccount) =>
          acc.accountNumber === 'CASH' || acc.name.toLowerCase().includes('nakit')
        setCashAccounts(accountsData.filter(isCashAccount))
        setBankAccounts(accountsData.filter(acc => !isCashAccount(acc)))
      }

      if (ewalletsRes?.ok && isPremium) {
        const walletsData = (await ewalletsRes.json()) as EWallet[]
        setEWallets(walletsData)
      }

      if (cardsRes?.ok) {
        const cardsData = (await cardsRes.json()) as CreditCardType[]
        setCreditCards(cardsData)
      }

      if (goldRes?.ok && isPremium) {
        const goldData = (await goldRes.json()) as GoldItem[]
        setGoldItems(goldData)
      }
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id: number, name: string, type: 'account' | 'ewallet' | 'card') => {
    setSelectedItem({ id, name, type })
    setShowEditModal(true)
  }

  const handleDelete = async (id: number, type: 'account' | 'ewallet' | 'card') => {
    const countRes = await fetch(
      `/api/transactions?${type === 'account' ? 'accountId' : type === 'card' ? 'creditCardId' : 'eWalletId'}=${id}`
    )
    if (countRes.ok) {
      const transactions = (await countRes.json()) as Array<{ id: number }>
      setTransactionCount(transactions.length)
    } else {
      setTransactionCount(0)
    }

    setSelectedItem({ id, name: '', type })
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!selectedItem) return

    try {
      const endpoint =
        selectedItem.type === 'account'
          ? `/api/accounts/${selectedItem.id}`
          : selectedItem.type === 'card'
            ? `/api/cards/${selectedItem.id}`
            : `/api/ewallets/${selectedItem.id}`

      const response = await fetch(endpoint, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        toastSuccess('Başarılı', `${selectedItem.type === 'account' ? 'Hesap' : selectedItem.type === 'card' ? 'Kart' : 'E-Cüzdan'} silindi`)
        void fetchData()
      } else {
        toastError('Hata', 'Silme işlemi başarısız')
      }
    } catch (error) {
      console.error('Silme hatası:', error)
      toastError('Hata', 'Silme işlemi başarısız')
    } finally {
      setShowDeleteConfirm(false)
      setSelectedItem(null)
    }
  }

  const handleSaveEdit = async (newName: string) => {
    if (!selectedItem) return

    const endpoint =
      selectedItem.type === 'account'
        ? `/api/accounts/${selectedItem.id}`
        : selectedItem.type === 'card'
          ? `/api/cards/${selectedItem.id}`
          : `/api/ewallets/${selectedItem.id}`

    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
      credentials: 'include',
    })

    if (response.ok) {
      toastSuccess('Başarılı', 'İsim güncellendi')
      void fetchData()
    }
  }

  // Hesaplamalar
  const totalCashBalance = cashAccounts.reduce((sum, acc) => {
    const rate = acc.currency.code === 'USD' ? 35 : acc.currency.code === 'EUR' ? 38 : 1
    return sum + parseFloat(acc.balance) * rate
  }, 0)

  const totalBankBalance = bankAccounts.reduce((sum, acc) => {
    const rate = acc.currency.code === 'USD' ? 35 : acc.currency.code === 'EUR' ? 38 : 1
    return sum + parseFloat(acc.balance) * rate
  }, 0)

  const totalEWalletBalance = eWallets.reduce((sum, wallet) => {
    const rate = wallet.currency.code === 'USD' ? 35 : wallet.currency.code === 'EUR' ? 38 : 1
    return sum + parseFloat(wallet.balance) * rate
  }, 0)

  const totalCardDebt = creditCards.reduce((sum, card) => {
    const rate = card.currency.code === 'USD' ? 35 : card.currency.code === 'EUR' ? 38 : 1
    const used = parseFloat(card.limitAmount) - parseFloat(card.availableLimit)
    return sum + used * rate
  }, 0)

  const totalGoldValue = goldItems.reduce((sum, item) => {
    return sum + parseFloat(item.currentValueTry || '0')
  }, 0)

  const totalAssets = totalCashBalance + totalBankBalance + totalEWalletBalance + totalGoldValue
  const netWorth = totalAssets - totalCardDebt

  const tabs = [
    { id: 'all' as TabType, label: 'Tümü', icon: Wallet, count: cashAccounts.length + bankAccounts.length + creditCards.length + (isPremium ? eWallets.length + goldItems.length : 0) },
    { id: 'cash' as TabType, label: 'Nakit', icon: Banknote, count: cashAccounts.length, color: 'green' },
    { id: 'bank' as TabType, label: 'Banka', icon: Building2, count: bankAccounts.length, color: 'blue' },
    { id: 'cards' as TabType, label: 'Kartlar', icon: CreditCard, count: creditCards.length, color: 'orange' },
    { id: 'ewallet' as TabType, label: 'E-Cüzdan', icon: Wallet, count: eWallets.length, color: 'purple', premium: true },
    { id: 'gold' as TabType, label: 'Altın', icon: Coins, count: goldItems.length, color: 'yellow', premium: true },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Hesaplar yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/80 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            <Link href="/dashboard" className="p-2 hover:bg-white/80 rounded-lg transition-colors">
              <Home className="h-5 w-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Hesaplarım</h1>
              <p className="text-sm text-slate-600">Tüm finansal varlıklarınız tek ekranda</p>
            </div>
          </div>
          <Link
            href="/accounts/new"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Yeni Hesap Ekle
          </Link>
        </div>

        {/* Net Worth Card */}
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 sm:p-8 shadow-xl mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Net Varlık</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                {formatCurrency(netWorth, 'TRY')}
              </h2>
              <p className="text-emerald-100 text-sm mt-2">
                Toplam Varlık: {formatCurrency(totalAssets, 'TRY')} • Borç: {formatCurrency(totalCardDebt, 'TRY')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-md group-hover:scale-110 transition-transform">
                  <Banknote className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs text-slate-500">{cashAccounts.length}</span>
              </div>
              <p className="text-xs text-slate-600 mb-1">Nakit</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(totalCashBalance, 'TRY')}</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md group-hover:scale-110 transition-transform">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs text-slate-500">{bankAccounts.length}</span>
              </div>
              <p className="text-xs text-slate-600 mb-1">Banka</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(totalBankBalance, 'TRY')}</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 shadow-md group-hover:scale-110 transition-transform">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs text-slate-500">{creditCards.length}</span>
              </div>
              <p className="text-xs text-slate-600 mb-1">Kart Borcu</p>
              <p className="text-lg font-bold text-orange-600">{formatCurrency(totalCardDebt, 'TRY')}</p>
            </CardContent>
          </Card>

          <Card className={`group hover:shadow-lg transition-all duration-300 border-0 ${isPremium ? 'bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100' : 'bg-gradient-to-br from-slate-100 to-slate-200'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg shadow-md group-hover:scale-110 transition-transform ${isPremium ? 'bg-gradient-to-br from-purple-500 to-pink-600' : 'bg-slate-400'}`}>
                  {isPremium ? <Wallet className="h-4 w-4 text-white" /> : <Crown className="h-4 w-4 text-white" />}
                </div>
                <span className="text-xs text-slate-500">{isPremium ? eWallets.length : <Crown className="h-3 w-3 text-purple-500" />}</span>
              </div>
              <p className="text-xs text-slate-600 mb-1">E-Cüzdan</p>
              <p className={`text-lg font-bold ${isPremium ? 'text-purple-600' : 'text-slate-400'}`}>
                {isPremium ? formatCurrency(totalEWalletBalance, 'TRY') : 'Premium'}
              </p>
            </CardContent>
          </Card>

          <Card className={`group hover:shadow-lg transition-all duration-300 border-0 ${isPremium ? 'bg-gradient-to-br from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100' : 'bg-gradient-to-br from-slate-100 to-slate-200'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg shadow-md group-hover:scale-110 transition-transform ${isPremium ? 'bg-gradient-to-br from-yellow-500 to-amber-600' : 'bg-slate-400'}`}>
                  {isPremium ? <Coins className="h-4 w-4 text-white" /> : <Crown className="h-4 w-4 text-white" />}
                </div>
                <span className="text-xs text-slate-500">{isPremium ? goldItems.length : <Crown className="h-3 w-3 text-purple-500" />}</span>
              </div>
              <p className="text-xs text-slate-600 mb-1">Altın</p>
              <p className={`text-lg font-bold ${isPremium ? 'text-yellow-600' : 'text-slate-400'}`}>
                {isPremium ? formatCurrency(totalGoldValue, 'TRY') : 'Premium'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white/60 backdrop-blur-sm p-2 rounded-xl shadow-sm">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const isLocked = tab.premium && !isPremium

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (isLocked) {
                    handlePremiumFeature(tab.label)
                    return
                  }
                  setActiveTab(tab.id)
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : isLocked
                    ? 'text-slate-400 hover:bg-slate-100'
                    : 'text-slate-600 hover:bg-white hover:shadow-sm'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {isLocked && <Crown className="h-3 w-3 text-purple-400" />}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-200'}`}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Account Lists */}
        <div className="space-y-6">
          {/* Nakit Hesapları */}
          {(activeTab === 'all' || activeTab === 'cash') && (
            <div>
              {activeTab === 'all' && (
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-green-600" />
                  Nakit Hesapları
                </h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cashAccounts.map(account => (
                  <Card key={account.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                            <Banknote className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{account.name}</CardTitle>
                            <CardDescription>Nakit • {account.currency.code}</CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(account.id, account.name, 'account')}
                            className="p-1.5 hover:bg-slate-100 rounded-lg"
                          >
                            <Edit2 className="h-4 w-4 text-slate-500" />
                          </button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600 mb-3">
                        {formatCurrency(parseFloat(account.balance), account.currency.code)}
                      </div>
                      <Link
                        href={`/accounts/${account.id}`}
                        className="flex items-center justify-between w-full px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm font-medium transition-colors"
                      >
                        <span>Detaylar</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Banka Hesapları */}
          {(activeTab === 'all' || activeTab === 'bank') && (
            <div>
              {activeTab === 'all' && (
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Banka Hesapları
                </h3>
              )}
              {bankAccounts.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                  <CardContent className="py-12 text-center">
                    <Building2 className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-500 mb-4">Henüz banka hesabı eklenmemiş</p>
                    <Link
                      href="/accounts/bank"
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Banka Hesabı Ekle
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bankAccounts.map(account => (
                    <Card key={account.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                              <Building2 className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{account.name}</CardTitle>
                              <CardDescription>{account.bank.name}</CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(account.id, account.name, 'account')}
                              className="p-1.5 hover:bg-slate-100 rounded-lg"
                            >
                              <Edit2 className="h-4 w-4 text-slate-500" />
                            </button>
                            <button
                              onClick={() => void handleDelete(account.id, 'account')}
                              className="p-1.5 hover:bg-slate-100 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          {formatCurrency(parseFloat(account.balance), account.currency.code)}
                        </div>
                        {account.iban && (
                          <p className="text-xs text-slate-500 mb-3 truncate">IBAN: {account.iban}</p>
                        )}
                        <Link
                          href={`/accounts/${account.id}`}
                          className="flex items-center justify-between w-full px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors"
                        >
                          <span>Detaylar</span>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Kredi Kartları */}
          {(activeTab === 'all' || activeTab === 'cards') && (
            <div>
              {activeTab === 'all' && (
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                  Kredi Kartları
                </h3>
              )}
              {creditCards.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                  <CardContent className="py-12 text-center">
                    <CreditCard className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-500 mb-4">Henüz kredi kartı eklenmemiş</p>
                    <Link
                      href="/cards"
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Kredi Kartı Ekle
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {creditCards.map(card => {
                    const used = parseFloat(card.limitAmount) - parseFloat(card.availableLimit)
                    const usagePercent = (used / parseFloat(card.limitAmount)) * 100

                    return (
                      <Card key={card.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 shadow-md">
                                <CreditCard className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-base">{card.name}</CardTitle>
                                <CardDescription>{card.bank.name}</CardDescription>
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEdit(card.id, card.name, 'card')}
                                className="p-1.5 hover:bg-slate-100 rounded-lg"
                              >
                                <Edit2 className="h-4 w-4 text-slate-500" />
                              </button>
                              <button
                                onClick={() => void handleDelete(card.id, 'card')}
                                className="p-1.5 hover:bg-slate-100 rounded-lg"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-baseline mb-2">
                            <div>
                              <p className="text-xs text-slate-500">Kullanılabilir</p>
                              <div className="text-xl font-bold text-green-600">
                                {formatCurrency(parseFloat(card.availableLimit), card.currency.code)}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-500">Borç</p>
                              <div className="text-lg font-semibold text-orange-600">
                                {formatCurrency(used, card.currency.code)}
                              </div>
                            </div>
                          </div>
                          <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                            <div
                              className={`absolute left-0 top-0 h-full rounded-full transition-all ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-orange-500' : 'bg-green-500'
                                }`}
                              style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-500">
                            Limit: {formatCurrency(parseFloat(card.limitAmount), card.currency.code)} • Son Ödeme: {card.dueDay}. gün
                          </p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* E-Cüzdanlar */}
          {(activeTab === 'all' || activeTab === 'ewallet') && (
            <div>
              {activeTab === 'all' && (
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-purple-600" />
                  E-Cüzdanlar
                  {!isPremium && <Crown className="h-4 w-4 text-purple-500" />}
                </h3>
              )}
              {!isPremium ? (
                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardContent className="py-12 text-center">
                    <Crown className="mx-auto h-16 w-16 text-purple-600 mb-4" />
                    <h3 className="text-xl font-semibold text-purple-900 mb-2">Premium Özellik</h3>
                    <p className="text-purple-700 mb-6">E-Cüzdan yönetimi Premium üyelere özeldir</p>
                    <button
                      onClick={() => router.push('/premium')}
                      className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                      Premium&apos;a Geç
                    </button>
                  </CardContent>
                </Card>
              ) : eWallets.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                  <CardContent className="py-12 text-center">
                    <Wallet className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-500 mb-4">Henüz e-cüzdan eklenmemiş</p>
                    <button
                      onClick={() => router.push('/ewallets/new')}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      E-Cüzdan Ekle
                    </button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {eWallets.map(wallet => (
                    <Card key={wallet.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
                              <Wallet className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{wallet.name}</CardTitle>
                              <CardDescription>{wallet.provider}</CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(wallet.id, wallet.name, 'ewallet')}
                              className="p-1.5 hover:bg-slate-100 rounded-lg"
                            >
                              <Edit2 className="h-4 w-4 text-slate-500" />
                            </button>
                            <button
                              onClick={() => void handleDelete(wallet.id, 'ewallet')}
                              className="p-1.5 hover:bg-slate-100 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(parseFloat(wallet.balance), wallet.currency.code)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Altın */}
          {(activeTab === 'all' || activeTab === 'gold') && (
            <div>
              {activeTab === 'all' && (
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-600" />
                  Altın ve Ziynet
                  {!isPremium && <Crown className="h-4 w-4 text-purple-500" />}
                </h3>
              )}
              {!isPremium ? (
                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardContent className="py-12 text-center">
                    <Crown className="mx-auto h-16 w-16 text-purple-600 mb-4" />
                    <h3 className="text-xl font-semibold text-purple-900 mb-2">Premium Özellik</h3>
                    <p className="text-purple-700 mb-6">Altın ve ziynet takibi Premium üyelere özeldir</p>
                    <button
                      onClick={() => router.push('/premium')}
                      className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                      Premium&apos;a Geç
                    </button>
                  </CardContent>
                </Card>
              ) : goldItems.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                  <CardContent className="py-12 text-center">
                    <Coins className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-500 mb-4">Henüz altın eşyası eklenmemiş</p>
                    <Link
                      href="/gold/new"
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-yellow-600 text-white font-medium hover:bg-yellow-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Altın Eşyası Ekle
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {goldItems.map(item => (
                    <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 shadow-md">
                              <Coins className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{item.name}</CardTitle>
                              <CardDescription>{item.goldType.name} • {item.goldPurity.name}</CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-600 mb-1">
                          {formatCurrency(parseFloat(item.currentValueTry || '0'), 'TRY')}
                        </div>
                        <p className="text-xs text-slate-500">
                          {item.weightGrams}g • Alış: {formatCurrency(parseFloat(item.purchasePrice), 'TRY')}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditNameModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={async (name) => { await handleSaveEdit(name) }}
        currentName={selectedItem?.name || ''}
        title="Hesap Adını Düzenle"
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => { await confirmDelete() }}
        title="Hesabı Sil"
        message={
          transactionCount > 0
            ? `Bu hesaba bağlı ${transactionCount} işlem bulunmaktadır. Silme işlemi geri alınamaz.`
            : 'Bu hesabı silmek istediğinizden emin misiniz?'
        }
        confirmText="Sil"
        cancelText="İptal"
      />
    </div>
  )
}

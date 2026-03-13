'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  AppPageShell,
  Badge,
  Button,
  Card,
  CardContent,
  ConfirmationDialog,
  DistributionBar,
  EditNameModal,
  EmptyState,
  Spinner,
  StatCard,
  StatsGrid,
} from '@/components/mosaic'
import { usePremium } from '@/lib/use-premium'
import { useToast } from '@/lib/use-toast'
import { formatCurrency } from '@/lib/validators'
import { cn } from '@/lib/utils'
import {
  Banknote,
  Building2,
  ChevronRight,
  Coins,
  CreditCard,
  Edit2,
  Lock,
  Plus,
  Sparkles,
  Trash2,
  TrendingUp,
  Wallet,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface CreditCardItem {
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
type ItemType = 'account' | 'ewallet' | 'card'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toTRY(amount: number, currencyCode: string) {
  const rates: Record<string, number> = { USD: 35, EUR: 38, GBP: 44 }
  return amount * (rates[currencyCode] ?? 1)
}

function isCash(acc: BankAccount) {
  return acc.accountNumber === 'CASH' || acc.name.toLowerCase().includes('nakit')
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  count,
  color,
  href,
  premium,
}: {
  icon: React.ElementType
  title: string
  count: number
  color: string
  href?: string
  premium?: boolean
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className={cn('rounded-lg p-1.5', color)}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {premium && (
          <Badge variant="premium" className="text-[10px]">
            <Sparkles className="mr-1 h-2.5 w-2.5" /> Premium
          </Badge>
        )}
        {count > 0 && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {count}
          </span>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Tümünü gör <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
}

function PremiumUpsell({ feature }: { feature: string }) {
  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-950/40 to-pink-950/30">
      <CardContent className="flex flex-col items-center py-10 text-center">
        <div className="mb-4 rounded-2xl bg-purple-500/15 p-4">
          <Lock className="h-8 w-8 text-purple-400" />
        </div>
        <h4 className="mb-1.5 text-base font-semibold text-foreground">{feature} — Premium Özellik</h4>
        <p className="mb-5 max-w-xs text-sm text-muted-foreground">
          Bu özellik Premium üyelere özeldir. Tüm finansal varlıklarınızı tek yerden yönetin.
        </p>
        <Button asChild variant="premium" size="sm">
          <a href="https://www.shopier.com/cinarinovasyon/45196765" target="_blank" rel="noopener noreferrer">
            <Sparkles className="mr-2 h-4 w-4" /> Premium&apos;a Geç
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}

function ActionButtons({
  onEdit,
  onDelete,
}: {
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex gap-1">
      <button
        onClick={onEdit}
        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        title="Düzenle"
      >
        <Edit2 className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onDelete}
        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
        title="Sil"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AccountsPage() {
  const { isPremium, handlePremiumFeature } = usePremium()
  const { success: toastSuccess, error: toastError } = useToast()

  const [cashAccounts, setCashAccounts] = useState<BankAccount[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [eWallets, setEWallets] = useState<EWallet[]>([])
  const [creditCards, setCreditCards] = useState<CreditCardItem[]>([])
  const [goldItems, setGoldItems] = useState<GoldItem[]>([])
  const [netWorthSummary, setNetWorthSummary] = useState<{
    totalAssets: number
    totalLiabilities: number
    netWorth: number
  } | null>(null)

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('all')

  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{
    id: number
    name: string
    type: ItemType
  } | null>(null)
  const [transactionCount, setTransactionCount] = useState(0)

  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) {return}
    fetchedRef.current = true
    void fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchData() {
    try {
      const [accountsRes, ewalletsRes, cardsRes, goldRes, netWorthRes] = await Promise.all([
        fetch('/api/accounts', { credentials: 'include' }),
        fetch('/api/ewallets', { credentials: 'include' }).catch(() => null),
        fetch('/api/cards', { credentials: 'include' }).catch(() => null),
        fetch('/api/gold', { credentials: 'include' }).catch(() => null),
        fetch('/api/net-worth', { credentials: 'include' }).catch(() => null),
      ])

      if (accountsRes.ok) {
        const data = (await accountsRes.json()) as Array<BankAccount & { accountType?: string }>
        const bankOnly = Array.isArray(data) ? data.filter(a => a.accountType === 'bank') : []
        setCashAccounts(bankOnly.filter(isCash))
        setBankAccounts(bankOnly.filter(a => !isCash(a)))
      }

      if (ewalletsRes?.ok) {setEWallets((await ewalletsRes.json()) as EWallet[])}
      if (cardsRes?.ok) {setCreditCards((await cardsRes.json()) as CreditCardItem[])}
      if (goldRes?.ok) {setGoldItems((await goldRes.json()) as GoldItem[])}
      if (netWorthRes?.ok) {setNetWorthSummary(await netWorthRes.json())}
    } catch (err) {
      console.error('Veriler yüklenirken hata:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Edit / Delete handlers ─────────────────────────────────────────────────

  function openEdit(id: number, name: string, type: ItemType) {
    setSelectedItem({ id, name, type })
    setShowEditModal(true)
  }

  async function openDelete(id: number, name: string, type: ItemType) {
    const param =
      type === 'account' ? 'accountId' : type === 'card' ? 'creditCardId' : 'eWalletId'
    try {
      const res = await fetch(`/api/transactions?${param}=${id}`)
      if (res.ok) {
        const data = (await res.json()) as { total?: number; items?: unknown[] }
        setTransactionCount(data.total ?? data.items?.length ?? 0)
      } else {
        setTransactionCount(0)
      }
    } catch {
      setTransactionCount(0)
    }
    setSelectedItem({ id, name, type })
    setShowDeleteConfirm(true)
  }

  async function confirmDelete() {
    if (!selectedItem) {return}
    const endpoint =
      selectedItem.type === 'account'
        ? `/api/accounts/${selectedItem.id}`
        : selectedItem.type === 'card'
          ? `/api/cards/${selectedItem.id}`
          : `/api/ewallets/${selectedItem.id}`

    const res = await fetch(endpoint, { method: 'DELETE', credentials: 'include' })
    if (res.ok) {
      const label =
        selectedItem.type === 'account' ? 'Hesap' : selectedItem.type === 'card' ? 'Kart' : 'E-Cüzdan'
      toastSuccess('Başarılı', `${label} silindi`)
      fetchedRef.current = false
      void fetchData()
    } else {
      toastError('Hata', 'Silme işlemi başarısız')
    }
    setShowDeleteConfirm(false)
    setSelectedItem(null)
  }

  async function handleSaveEdit(newName: string) {
    if (!selectedItem) {return}
    const endpoint =
      selectedItem.type === 'account'
        ? `/api/accounts/${selectedItem.id}`
        : selectedItem.type === 'card'
          ? `/api/cards/${selectedItem.id}`
          : `/api/ewallets/${selectedItem.id}`

    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
      credentials: 'include',
    })
    if (res.ok) {
      toastSuccess('Başarılı', 'İsim güncellendi')
      fetchedRef.current = false
      void fetchData()
    } else {
      toastError('Hata', 'İsim güncellenemedi')
    }
  }

  // ── Calculations ───────────────────────────────────────────────────────────

  const totalCash = cashAccounts.reduce(
    (s, a) => s + toTRY(parseFloat(a.balance), a.currency.code),
    0
  )
  const totalBank = bankAccounts.reduce(
    (s, a) => s + toTRY(parseFloat(a.balance), a.currency.code),
    0
  )
  const totalEWallet = eWallets.reduce(
    (s, w) => s + toTRY(parseFloat(w.balance), w.currency.code),
    0
  )
  const totalCardDebt = creditCards.reduce((s, c) => {
    const used = parseFloat(c.limitAmount) - parseFloat(c.availableLimit)
    return s + toTRY(used, c.currency.code)
  }, 0)
  const totalGold = goldItems.reduce(
    (s, g) => s + parseFloat(g.currentValueTry ?? '0'),
    0
  )

  const totalAssets = netWorthSummary?.totalAssets ?? totalCash + totalBank + totalEWallet + totalGold
  const totalLiabilities = netWorthSummary?.totalLiabilities ?? totalCardDebt
  const netWorth = netWorthSummary?.netWorth ?? totalAssets - totalLiabilities
  const assetsPct = totalAssets + totalLiabilities > 0
    ? (totalAssets / (totalAssets + totalLiabilities)) * 100
    : 100

  // ── Tab config ─────────────────────────────────────────────────────────────

  const allCount =
    cashAccounts.length +
    bankAccounts.length +
    creditCards.length +
    (isPremium ? eWallets.length + goldItems.length : 0)

  const tabs: { id: TabType; label: string; count: number; premium?: boolean }[] = [
    { id: 'all', label: 'Tümü', count: allCount },
    { id: 'cash', label: 'Nakit', count: cashAccounts.length },
    { id: 'bank', label: 'Banka', count: bankAccounts.length },
    { id: 'cards', label: 'Kartlar', count: creditCards.length },
    { id: 'ewallet', label: 'E-Cüzdan', count: eWallets.length, premium: true },
    { id: 'gold', label: 'Altın', count: goldItems.length, premium: true },
  ]

  const show = (tab: TabType) => activeTab === 'all' || activeTab === tab

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <AppPageShell
      header={{
        title: 'Hesaplarım',
        description: 'Tüm finansal varlıklarınız tek ekranda',
        actions: (
          <Button asChild variant="glow">
            <Link href="/accounts/new">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Hesap
            </Link>
          </Button>
        ),
      }}
    >

      {/* ── Net Worth Hero ─────────────────────────────────────────────────── */}
      <Card className="overflow-hidden border-border/60">
        <div className="relative bg-gradient-to-br from-slate-800/80 via-slate-800/50 to-indigo-950/60 p-6 sm:p-8">
          {/* decorative blobs */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 left-8 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-slate-400">Net Varlık</p>
              <p className={cn(
                'text-4xl font-black tracking-tight sm:text-5xl',
                netWorth >= 0 ? 'text-white' : 'text-red-300'
              )}>
                {formatCurrency(netWorth, 'TRY')}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-medium text-emerald-300">
                    Varlık {formatCurrency(totalAssets, 'TRY')}
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  <span className="text-xs font-medium text-red-300">
                    Borç {formatCurrency(totalLiabilities, 'TRY')}
                  </span>
                </div>
              </div>
            </div>

            <div className="sm:min-w-[260px]">
              <div className="mb-3 flex justify-between text-xs text-slate-400">
                <span>Varlık / Toplam</span>
                <span>%{assetsPct.toFixed(1)}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                  style={{ width: `${assetsPct}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                <span>Liabilite tarafı</span>
                <span>Aktif varlıklar</span>
              </div>
            </div>

            <div className="hidden rounded-xl bg-white/5 p-4 sm:block">
              <TrendingUp className="h-10 w-10 text-indigo-300" />
            </div>
          </div>
        </div>
      </Card>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <StatsGrid className="xl:grid-cols-5">
        <StatCard
          title="Nakit"
          value={formatCurrency(totalCash, 'TRY')}
          icon={Banknote}
          color="emerald"
          description={`${cashAccounts.length} hesap`}
        />
        <StatCard
          title="Banka"
          value={formatCurrency(totalBank, 'TRY')}
          icon={Building2}
          color="blue"
          description={`${bankAccounts.length} hesap`}
        />
        <StatCard
          title="Kart Borcu"
          value={formatCurrency(totalCardDebt, 'TRY')}
          icon={CreditCard}
          color="red"
          description={`${creditCards.length} kart`}
        />
        <StatCard
          title="E-Cüzdan"
          value={isPremium ? formatCurrency(totalEWallet, 'TRY') : 'Premium'}
          icon={Wallet}
          color={isPremium ? 'cyan' : 'purple'}
          description={isPremium ? `${eWallets.length} cüzdan` : 'Premium üyelik gerekli'}
        />
        <StatCard
          title="Altın"
          value={isPremium ? formatCurrency(totalGold, 'TRY') : 'Premium'}
          icon={Coins}
          color={isPremium ? 'amber' : 'purple'}
          description={isPremium ? `${goldItems.length} eşya` : 'Premium üyelik gerekli'}
        />
      </StatsGrid>

      {/* ── Tab Bar ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => {
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
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                isLocked && 'opacity-60'
              )}
            >
              {tab.label}
              {isLocked && <Lock className="h-3 w-3" />}
              {!isLocked && tab.count > 0 && (
                <span
                  className={cn(
                    'min-w-[18px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold leading-none',
                    isActive ? 'bg-white/20 text-white' : 'bg-background text-foreground'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Sections ───────────────────────────────────────────────────────── */}
      <div className="space-y-8">

        {/* Nakit */}
        {show('cash') && (
          <section>
            <SectionHeader
              icon={Banknote}
              title="Nakit Hesapları"
              count={cashAccounts.length}
              color="bg-emerald-500/15 text-emerald-400"
            />
            {cashAccounts.length === 0 ? (
              <EmptyState
                title="Nakit hesap yok"
                description="Nakit varlıklarınızı takip etmek için hesap ekleyin."
                icon={<Banknote className="h-10 w-10" />}
                action={
                  <Button asChild variant="outline" size="sm">
                    <Link href="/accounts/new?type=cash">
                      <Plus className="mr-2 h-4 w-4" /> Nakit Ekle
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {cashAccounts.map(acc => (
                  <Card
                    key={acc.id}
                    className="group overflow-hidden border-border/80 bg-card/95 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between border-b border-border/50 p-4 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-500/15 p-2 text-emerald-400">
                          <Banknote className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{acc.name}</p>
                          <p className="text-xs text-muted-foreground">Nakit · {acc.currency.code}</p>
                        </div>
                      </div>
                      <ActionButtons
                        onEdit={() => openEdit(acc.id, acc.name, 'account')}
                        onDelete={() => void openDelete(acc.id, acc.name, 'account')}
                      />
                    </div>
                    <CardContent className="p-4">
                      <p className="mb-3 text-2xl font-bold text-emerald-400">
                        {formatCurrency(parseFloat(acc.balance), acc.currency.code)}
                      </p>
                      <Link href={`/accounts/${acc.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          Detaylar <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Banka */}
        {show('bank') && (
          <section>
            <SectionHeader
              icon={Building2}
              title="Banka Hesapları"
              count={bankAccounts.length}
              color="bg-blue-500/15 text-blue-400"
            />
            {bankAccounts.length === 0 ? (
              <EmptyState
                title="Banka hesabı yok"
                description="Banka hesaplarınızı ekleyerek bakiyelerinizi takip edin."
                icon={<Building2 className="h-10 w-10" />}
                action={
                  <Button asChild variant="outline" size="sm">
                    <Link href="/accounts/new?type=bank">
                      <Plus className="mr-2 h-4 w-4" /> Hesap Ekle
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {bankAccounts.map(acc => (
                  <Card
                    key={acc.id}
                    className="group overflow-hidden border-border/80 bg-card/95 transition-all duration-300 hover:border-blue-500/30 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between border-b border-border/50 p-4 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-500/15 p-2 text-blue-400">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{acc.name}</p>
                          <p className="text-xs text-muted-foreground">{acc.bank.name} · {acc.currency.code}</p>
                        </div>
                      </div>
                      <ActionButtons
                        onEdit={() => openEdit(acc.id, acc.name, 'account')}
                        onDelete={() => void openDelete(acc.id, acc.name, 'account')}
                      />
                    </div>
                    <CardContent className="p-4">
                      <p className="mb-1 text-2xl font-bold text-blue-400">
                        {formatCurrency(parseFloat(acc.balance), acc.currency.code)}
                      </p>
                      {acc.iban && (
                        <p className="mb-3 truncate text-xs text-muted-foreground">
                          IBAN: {acc.iban}
                        </p>
                      )}
                      {!acc.iban && <div className="mb-3" />}
                      <Link href={`/accounts/${acc.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          Detaylar <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Kredi Kartları */}
        {show('cards') && (
          <section>
            <SectionHeader
              icon={CreditCard}
              title="Kredi Kartları"
              count={creditCards.length}
              color="bg-purple-500/15 text-purple-400"
              href="/cards"
            />
            {creditCards.length === 0 ? (
              <EmptyState
                title="Kredi kartı yok"
                description="Kredi kartı ekleyerek limit ve borç durumunuzu takip edin."
                icon={<CreditCard className="h-10 w-10" />}
                action={
                  <Button asChild variant="outline" size="sm">
                    <Link href="/accounts/new?type=credit_card">
                      <Plus className="mr-2 h-4 w-4" /> Kart Ekle
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {creditCards.map(card => {
                  const limit = parseFloat(card.limitAmount)
                  const available = parseFloat(card.availableLimit)
                  const used = limit - available
                  const pct = limit > 0 ? (used / limit) * 100 : 0
                  const barColor =
                    pct >= 80 ? 'bg-red-500' : pct >= 50 ? 'bg-amber-500' : 'bg-emerald-500'

                  return (
                    <Card
                      key={card.id}
                      className="group overflow-hidden border-border/80 bg-card/95 transition-all duration-300 hover:border-purple-500/30 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between border-b border-border/50 p-4 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-purple-500/15 p-2 text-purple-400">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{card.name}</p>
                            <p className="text-xs text-muted-foreground">{card.bank.name} · {card.currency.code}</p>
                          </div>
                        </div>
                        <ActionButtons
                          onEdit={() => openEdit(card.id, card.name, 'card')}
                          onDelete={() => void openDelete(card.id, card.name, 'card')}
                        />
                      </div>
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <p className="text-[11px] text-muted-foreground">Kullanılabilir</p>
                            <p className="text-xl font-bold text-emerald-400">
                              {formatCurrency(available, card.currency.code)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] text-muted-foreground">Borç</p>
                            <p className="text-base font-semibold text-red-400">
                              {formatCurrency(used, card.currency.code)}
                            </p>
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                            <span>Kullanım %{pct.toFixed(0)}</span>
                            <span>Limit {formatCurrency(limit, card.currency.code)}</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn('h-full rounded-full transition-all duration-500', barColor)}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Son ödeme günü: <span className="font-medium text-foreground">{card.dueDay}.</span>
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* E-Cüzdan */}
        {show('ewallet') && (
          <section>
            <SectionHeader
              icon={Wallet}
              title="E-Cüzdanlar"
              count={eWallets.length}
              color="bg-cyan-500/15 text-cyan-400"
              premium={!isPremium}
            />
            {!isPremium ? (
              <PremiumUpsell feature="E-Cüzdan Yönetimi" />
            ) : eWallets.length === 0 ? (
              <EmptyState
                title="E-cüzdan yok"
                description="Papara, İyzico gibi dijital cüzdanlarınızı ekleyerek takip edin."
                icon={<Wallet className="h-10 w-10" />}
                action={
                  <Button asChild variant="outline" size="sm">
                    <Link href="/ewallets/new">
                      <Plus className="mr-2 h-4 w-4" /> E-Cüzdan Ekle
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {eWallets.map(wallet => (
                  <Card
                    key={wallet.id}
                    className="group overflow-hidden border-border/80 bg-card/95 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between border-b border-border/50 p-4 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-cyan-500/15 p-2 text-cyan-400">
                          <Wallet className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{wallet.name}</p>
                          <p className="text-xs text-muted-foreground">{wallet.provider} · {wallet.currency.code}</p>
                        </div>
                      </div>
                      <ActionButtons
                        onEdit={() => openEdit(wallet.id, wallet.name, 'ewallet')}
                        onDelete={() => void openDelete(wallet.id, wallet.name, 'ewallet')}
                      />
                    </div>
                    <CardContent className="p-4">
                      <p className="text-2xl font-bold text-cyan-400">
                        {formatCurrency(parseFloat(wallet.balance), wallet.currency.code)}
                      </p>
                      {wallet.accountEmail && (
                        <p className="mt-1 truncate text-xs text-muted-foreground">{wallet.accountEmail}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Altın */}
        {show('gold') && (
          <section>
            <SectionHeader
              icon={Coins}
              title="Altın ve Ziynet"
              count={goldItems.length}
              color="bg-amber-500/15 text-amber-400"
              premium={!isPremium}
              href={isPremium ? '/gold' : undefined}
            />
            {!isPremium ? (
              <PremiumUpsell feature="Altın ve Ziynet Takibi" />
            ) : goldItems.length === 0 ? (
              <EmptyState
                title="Altın eşyası yok"
                description="Altın ve ziynet eşyalarınızın güncel değerini buradan takip edin."
                icon={<Coins className="h-10 w-10" />}
                action={
                  <Button asChild variant="outline" size="sm">
                    <Link href="/gold/new">
                      <Plus className="mr-2 h-4 w-4" /> Altın Ekle
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {goldItems.map(item => {
                  const current = parseFloat(item.currentValueTry ?? '0')
                  const purchase = parseFloat(item.purchasePrice)
                  const gain = current - purchase
                  const isProfit = gain >= 0

                  return (
                    <Card
                      key={item.id}
                      className="group overflow-hidden border-border/80 bg-card/95 transition-all duration-300 hover:border-amber-500/30 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between border-b border-border/50 p-4 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-amber-500/15 p-2 text-amber-400">
                            <Coins className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.goldType.name} · {item.goldPurity.name}
                            </p>
                          </div>
                        </div>
                      </div>
                      <CardContent className="space-y-2 p-4">
                        <p className="text-2xl font-bold text-amber-400">
                          {formatCurrency(current, 'TRY')}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{item.weightGrams}g · Alış: {formatCurrency(purchase, 'TRY')}</span>
                          <span className={isProfit ? 'text-emerald-400' : 'text-red-400'}>
                            {isProfit ? '+' : ''}{formatCurrency(gain, 'TRY')}
                          </span>
                        </div>
                        <DistributionBar
                          label="Değer artışı"
                          value={`%${purchase > 0 ? ((gain / purchase) * 100).toFixed(1) : '0'}`}
                          percentage={purchase > 0 ? Math.min((current / purchase) * 50, 100) : 50}
                          tone={isProfit ? 'amber' : 'rose'}
                        />
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <EditNameModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedItem(null)
        }}
        title={`${selectedItem?.type === 'account' ? 'Hesap' : selectedItem?.type === 'card' ? 'Kart' : 'E-Cüzdan'} Adını Düzenle`}
        currentName={selectedItem?.name ?? ''}
        onSave={handleSaveEdit}
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setSelectedItem(null)
        }}
        onConfirm={confirmDelete}
        title="Silmeyi Onayla"
        message={
          transactionCount > 0
            ? `Bu öğeye bağlı ${transactionCount} işlem bulunuyor. Yine de silmek istiyor musunuz?`
            : `"${selectedItem?.name}" öğesini silmek istediğinizden emin misiniz?`
        }
        warningMessage="Bu işlem geri alınamaz. İlgili tüm veriler kalıcı olarak silinir."
        confirmText="Evet, Sil"
        cancelText="İptal"
      />
    </AppPageShell>
  )
}

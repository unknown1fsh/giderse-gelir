'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AppPageShell,
  Button,
  Card,
  CardContent,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  EmptyState,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
  StatsGrid,
  Spinner,
  ConfirmationDialog,
  EditNameModal,
} from '@/components/mosaic'
import {
  CreditCard,
  AlertTriangle,
  Wallet,
  Plus,
  Edit,
  Trash2,
  Building2,
  Calendar,
} from 'lucide-react'
import { formatCurrency } from '@/lib/validators'
import { useToast } from '@/lib/use-toast'

interface CreditCardData {
  id: number
  name: string
  limitAmount: string
  availableLimit: string
  statementDay: number
  dueDay: number
  minPaymentPercent: string
  bank: { id: number; name: string }
  currency: { id: number; code: string; name: string }
  createdAt: string
}

interface ReferenceData {
  banks: Array<{ id: number; name: string }>
  currencies: Array<{ id: number; code: string; name: string }>
}

function getNextDueDate(dueDay: number): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), dueDay)
  return thisMonth > today
    ? thisMonth
    : new Date(today.getFullYear(), today.getMonth() + 1, dueDay)
}

function getDaysUntilDue(dueDay: number): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const next = getNextDueDate(dueDay)
  return Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function CardsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { success: toastSuccess, error: toastError } = useToast()
  const [creditCards, setCreditCards] = useState<CreditCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CreditCardData | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
  const [creating, setCreating] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [createForm, setCreateForm] = useState({
    name: '',
    bankId: '',
    currencyId: '',
    limitAmount: '',
    dueDay: '1',
  })

  useEffect(() => {
    void fetchCards()
    void fetchReferenceData()
  }, [])

  useEffect(() => {
    if (searchParams.get('openNew') === '1') {
      openCreateDrawer()
    }
  }, [searchParams])

  const fetchCards = async () => {
    try {
      const response = await fetch('/api/cards', { credentials: 'include' })
      if (!response.ok) {
        throw new Error('Yüklenemedi')
      }

      const data = (await response.json()) as CreditCardData[]
      setCreditCards(data)
      setError(null)
    } catch {
      setError('Kredi kartları yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchReferenceData = async () => {
    try {
      const response = await fetch('/api/reference-data', { credentials: 'include' })
      if (!response.ok) {
        return
      }

      const data = (await response.json()) as ReferenceData
      setReferenceData(data)

      const tryCurrency = data.currencies.find(currency => currency.code === 'TRY')
      if (tryCurrency) {
        setCreateForm(prev => ({ ...prev, currencyId: String(tryCurrency.id) }))
      }
    } catch {
      // Referans veri alınamazsa form yine de manuel seçimle çalışır
    }
  }

  const openCreateDrawer = () => {
    setFormErrors({})
    setCreateForm(prev => ({
      ...prev,
      name: '',
      bankId: '',
      limitAmount: '',
      dueDay: '1',
    }))
    setDrawerOpen(true)
  }

  const validateCreateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!createForm.name.trim()) {
      nextErrors.name = 'Kart adı zorunludur'
    }
    if (!createForm.bankId) {
      nextErrors.bankId = 'Banka seçimi zorunludur'
    }
    if (!createForm.currencyId) {
      nextErrors.currencyId = 'Para birimi seçimi zorunludur'
    }

    const limitAmount = Number(createForm.limitAmount)
    if (!createForm.limitAmount || Number.isNaN(limitAmount) || limitAmount <= 0) {
      nextErrors.limitAmount = 'Geçerli bir limit tutarı girin'
    }

    const dueDay = Number(createForm.dueDay)
    if (!createForm.dueDay || Number.isNaN(dueDay) || dueDay < 1 || dueDay > 31) {
      nextErrors.dueDay = 'Son ödeme günü 1-31 arasında olmalıdır'
    }

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateCreateForm()) {
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          accountType: 'credit_card',
          name: createForm.name.trim(),
          bankId: Number(createForm.bankId),
          currencyId: Number(createForm.currencyId),
          limitAmount: Number(createForm.limitAmount),
          dueDay: Number(createForm.dueDay),
        }),
      })

      if (!response.ok) {
        const err = (await response.json()) as { error?: string }
        throw new Error(err.error || 'Kart eklenemedi')
      }

      toastSuccess('Başarılı', 'Kredi kartı eklendi')
      setDrawerOpen(false)
      await fetchCards()
    } catch (err) {
      toastError('Hata', err instanceof Error ? err.message : 'Kart eklenemedi')
    } finally {
      setCreating(false)
    }
  }

  const handleEditName = async (newName: string) => {
    if (!selectedCard) {return}
    const res = await fetch(`/api/cards/${selectedCard.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
      credentials: 'include',
    })
    if (res.ok) {
      setCreditCards(prev =>
        prev.map(c => (c.id === selectedCard.id ? { ...c, name: newName } : c))
      )
      toastSuccess('Başarılı', 'Kart adı güncellendi')
    } else {
      toastError('Hata', 'Kart adı güncellenemedi')
    }
  }

  const handleDelete = async () => {
    if (!selectedCard) {return}
    const res = await fetch(`/api/cards/${selectedCard.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (res.ok) {
      const result = await res.json()
      toastSuccess('Başarılı', result.message)
      setCreditCards(prev => prev.filter(c => c.id !== selectedCard.id))
    } else {
      toastError('Hata', 'Kart silinemedi')
    }
  }

  const totalLimit = creditCards.reduce((sum, c) => sum + parseFloat(c.limitAmount), 0)
  const totalUsed = creditCards.reduce(
    (sum, c) => sum + (parseFloat(c.limitAmount) - parseFloat(c.availableLimit)),
    0
  )
  const totalAvailable = totalLimit - totalUsed
  const overallUtilization = totalLimit > 0 ? ((totalUsed / totalLimit) * 100).toFixed(0) : '0'

  const nearestDue =
    creditCards.length > 0
      ? creditCards.reduce((min, c) =>
          getDaysUntilDue(c.dueDay) < getDaysUntilDue(min.dueDay) ? c : min
        )
      : null

  return (
    <AppPageShell
      header={{
        title: 'Kredi Kartları',
        description: 'Limit kullanımını ve ödeme tarihlerini takip edin',
        onBack: () => router.back(),
        actions: (
          <Button variant="glow" onClick={openCreateDrawer}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Kart
          </Button>
        ),
      }}
    >
      {/* Özet istatistikler */}
      <StatsGrid className="xl:grid-cols-3">
        <StatCard
          title="Toplam Limit"
          value={formatCurrency(totalLimit, 'TRY')}
          icon={CreditCard}
          color="blue"
          description={`${creditCards.length} kart`}
        />
        <StatCard
          title="Kullanılan"
          value={formatCurrency(totalUsed, 'TRY')}
          icon={AlertTriangle}
          color="amber"
          description={`%${overallUtilization} kullanım oranı`}
        />
        <StatCard
          title="Kullanılabilir"
          value={formatCurrency(totalAvailable, 'TRY')}
          icon={Wallet}
          color="green"
          description={
            nearestDue
              ? `En yakın ödeme ${getDaysUntilDue(nearestDue.dueDay)} gün sonra`
              : 'Mevcut kullanılabilir limit'
          }
        />
      </StatsGrid>

      {/* Kart listesi */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
          {error}
        </div>
      ) : creditCards.length === 0 ? (
        <EmptyState
          title="Henüz kart eklenmemiş"
          description="Kredi kartı limitlerini ve ödeme tarihlerini takip etmek için kart ekleyin."
          icon={<CreditCard className="h-10 w-10" />}
          action={
            <Button variant="glow" onClick={openCreateDrawer}>
                <Plus className="mr-2 h-4 w-4" />
                İlk Kartı Ekle
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {creditCards.map(card => {
            const limit = parseFloat(card.limitAmount)
            const available = parseFloat(card.availableLimit)
            const used = limit - available
            const utilizationPct = limit > 0 ? (used / limit) * 100 : 0
            const minPayment = used * (parseFloat(card.minPaymentPercent) / 100)
            const daysUntilDue = getDaysUntilDue(card.dueDay)

            const barColor =
              utilizationPct >= 80
                ? 'bg-red-500'
                : utilizationPct >= 50
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'

            const dueDayColor =
              daysUntilDue <= 3
                ? 'text-red-400'
                : daysUntilDue <= 7
                  ? 'text-amber-400'
                  : 'text-slate-300'

            return (
              <Card
                key={card.id}
                className="overflow-hidden border-border/80 bg-card/95 shadow-sm transition-all duration-300 hover:shadow-md"
              >
                {/* Kart görseli */}
                <div className="relative h-40 overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-5">
                  <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/5" />
                  <div className="absolute -bottom-8 -right-2 h-24 w-24 rounded-full bg-white/5" />
                  <div className="absolute -bottom-4 left-0 h-20 w-20 rounded-full bg-purple-500/10" />

                  <div className="flex items-start justify-between">
                    <div>
                      <p className="mb-0.5 text-xs text-slate-400">{card.bank.name}</p>
                      <h3 className="text-lg font-bold text-white">{card.name}</h3>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedCard(card)
                          setShowEditModal(true)
                        }}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                        title="Adı düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCard(card)
                          setShowDeleteConfirm(true)
                        }}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="Kartı sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Limit</p>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(limit, card.currency.code)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Para birimi</p>
                      <p className="text-sm font-semibold text-slate-200">{card.currency.code}</p>
                    </div>
                  </div>
                </div>

                <CardContent className="space-y-4 p-5">
                  {/* Kullanım çubuğu */}
                  <div>
                    <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                      <span>Kullanım %{utilizationPct.toFixed(0)}</span>
                      <span>
                        {formatCurrency(used, card.currency.code)} /{' '}
                        {formatCurrency(limit, card.currency.code)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.min(utilizationPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Detaylar */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Kullanılabilir</p>
                      <p className="text-sm font-semibold text-emerald-400">
                        {formatCurrency(available, card.currency.code)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Min. Ödeme</p>
                      <p className="text-sm font-semibold text-amber-400">
                        {formatCurrency(minPayment, card.currency.code)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Kalan Gün</p>
                      <p className={`text-sm font-semibold ${dueDayColor}`}>
                        {daysUntilDue} gün
                      </p>
                    </div>
                  </div>

                  {/* Alt bilgi */}
                  <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {card.bank.name}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Ekstre: {card.statementDay}. · Ödeme: {card.dueDay}.
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {selectedCard && (
        <EditNameModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedCard(null)
          }}
          currentName={selectedCard.name}
          onSave={handleEditName}
          title="Kart Adını Düzenle"
          description="Kredi kartınızın görünen adını değiştirin"
        />
      )}

      {selectedCard && (
        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false)
            setSelectedCard(null)
          }}
          onConfirm={handleDelete}
          title="Kartı Sil"
          message={`"${selectedCard.name}" kartını silmek istediğinize emin misiniz?`}
          warningMessage="Kart silindiğinde, bu kartla yapılan TÜM İŞLEMLER de silinecektir! Bu işlem geri alınamaz."
          confirmText="Evet, Sil"
          cancelText="İptal"
        />
      )}

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="border-white/10 bg-slate-950 sm:max-w-xl">
          <form onSubmit={e => void handleCreateCard(e)} className="flex h-full flex-col">
            <DrawerHeader>
              <DrawerTitle>Yeni Kart Ekle</DrawerTitle>
              <DrawerDescription>
                Kredi kartınızı ekleyin, limit kullanımını ve ödeme tarihlerini bu sayfadan yönetin.
              </DrawerDescription>
            </DrawerHeader>

            <DrawerBody className="space-y-5">
              <FormField label="Kart Adı" required error={formErrors.name}>
                <Input
                  value={createForm.name}
                  onChange={event => {
                    setCreateForm(prev => ({ ...prev, name: event.target.value }))
                    if (formErrors.name) {
                      setFormErrors(prev => ({ ...prev, name: '' }))
                    }
                  }}
                  placeholder="Örn: Akbank Axess"
                  variant={formErrors.name ? 'error' : 'default'}
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Banka" required error={formErrors.bankId}>
                  <Select
                    value={createForm.bankId}
                    onValueChange={value => {
                      setCreateForm(prev => ({ ...prev, bankId: value }))
                      if (formErrors.bankId) {
                        setFormErrors(prev => ({ ...prev, bankId: '' }))
                      }
                    }}
                  >
                    <SelectTrigger className={formErrors.bankId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Banka seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {referenceData?.banks.map(bank => (
                        <SelectItem key={bank.id} value={String(bank.id)}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Para Birimi" required error={formErrors.currencyId}>
                  <Select
                    value={createForm.currencyId}
                    onValueChange={value => {
                      setCreateForm(prev => ({ ...prev, currencyId: value }))
                      if (formErrors.currencyId) {
                        setFormErrors(prev => ({ ...prev, currencyId: '' }))
                      }
                    }}
                  >
                    <SelectTrigger className={formErrors.currencyId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Para birimi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {referenceData?.currencies.map(currency => (
                        <SelectItem key={currency.id} value={String(currency.id)}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Kart Limiti" required error={formErrors.limitAmount}>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={createForm.limitAmount}
                    onChange={event => {
                      setCreateForm(prev => ({ ...prev, limitAmount: event.target.value }))
                      if (formErrors.limitAmount) {
                        setFormErrors(prev => ({ ...prev, limitAmount: '' }))
                      }
                    }}
                    placeholder="50000"
                    variant={formErrors.limitAmount ? 'error' : 'default'}
                  />
                </FormField>

                <FormField label="Son Ödeme Günü" required error={formErrors.dueDay}>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={createForm.dueDay}
                    onChange={event => {
                      setCreateForm(prev => ({ ...prev, dueDay: event.target.value }))
                      if (formErrors.dueDay) {
                        setFormErrors(prev => ({ ...prev, dueDay: '' }))
                      }
                    }}
                    variant={formErrors.dueDay ? 'error' : 'default'}
                  />
                </FormField>
              </div>
            </DrawerBody>

            <DrawerFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>
                Vazgeç
              </Button>
              <Button type="submit" variant="glow" loading={creating} disabled={creating}>
                Kartı Kaydet
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </AppPageShell>
  )
}

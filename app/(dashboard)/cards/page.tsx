'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AppPageShell,
  Button,
  Card,
  CardContent,
  EmptyState,
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

export default function CardsPage() {
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useToast()
  const [creditCards, setCreditCards] = useState<CreditCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CreditCardData | null>(null)

  useEffect(() => {
    fetch('/api/cards', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : Promise.reject('Yüklenemedi')))
      .then(data => setCreditCards(data))
      .catch(() => setError('Kredi kartları yüklenirken hata oluştu'))
      .finally(() => setLoading(false))
  }, [])

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
          <Button asChild variant="glow">
            <Link href="/accounts/new?type=credit_card">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Kart
            </Link>
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
            <Button asChild variant="glow">
              <Link href="/accounts/new?type=credit_card">
                <Plus className="mr-2 h-4 w-4" />
                İlk Kartı Ekle
              </Link>
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
    </AppPageShell>
  )
}

'use client'

import { useEffect, useState, useRef } from 'react'
import {
    AppPageShell,
    Badge,
    Button,
    Card,
    CardContent,
    DashboardCard,
    DistributionBar,
    Drawer,
    DrawerBody,
    DrawerContent,
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
    Skeleton,
    StatCard,
    StatsGrid,
} from '@/components/mosaic'
import { useToast } from '@/lib/use-toast'
import { formatCurrency } from '@/lib/validators'
import {
    AlertCircle,
    CalendarClock,
    CalendarDays,
    CheckCircle2,
    Landmark,
    Plus,
    RefreshCw,
    TrendingDown,
    Wallet,
} from 'lucide-react'

interface ReferenceData {
    banks: Array<{ id: number; name: string }>
    currencies: Array<{ id: number; code: string; name: string }>
}

const LOAN_TYPES = [
    { value: 'PERSONAL', label: 'İhtiyaç Kredisi' },
    { value: 'HOUSING', label: 'Konut Kredisi' },
    { value: 'VEHICLE', label: 'Taşıt Kredisi' },
    { value: 'CREDIT_CARD', label: 'Kredi Kartı Borcu' },
    { value: 'OTHER', label: 'Diğer' },
]

interface InstallmentItem {
    id: number
    name: string
    totalAmount: number
    remainingAmount: number
    monthlyPayment?: number
    totalInstallments: number
    paidInstallments: number
    remainingInstallments: number
    nextPaymentDate: string | null
    paymentDay?: number
    bankName?: string
    currencyCode?: string
    loanType?: string
    interestRate?: number
}

function getDiffDays(dateStr: string | null): number | null {
    if (!dateStr) {return null}
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const d = new Date(dateStr)
    d.setHours(0, 0, 0, 0)
    return Math.round((d.getTime() - today.getTime()) / 86400000)
}

function urgencyOf(item: InstallmentItem): 'overdue' | 'today' | 'soon' | 'normal' {
    const diff = getDiffDays(item.nextPaymentDate)
    if (diff === null) {return 'normal'}
    if (diff < 0) {return 'overdue'}
    if (diff === 0) {return 'today'}
    if (diff <= 7) {return 'soon'}
    return 'normal'
}

function paymentDateLabel(dateStr: string | null): string {
    if (!dateStr) {return '—'}
    const diff = getDiffDays(dateStr)
    if (diff === null) {return '—'}
    if (diff < 0) {return `${Math.abs(diff)} gün gecikti`}
    if (diff === 0) {return 'Bugün'}
    if (diff === 1) {return 'Yarın'}
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
}

export default function InstallmentsPage() {
    const { success: toastSuccess, error: toastError } = useToast()
    const [installments, setInstallments] = useState<InstallmentItem[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<number | null>(null)
    const fetchedRef = useRef(false)

    // Create drawer state
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [createForm, setCreateForm] = useState({
        name: '',
        bankId: '',
        loanType: 'PERSONAL',
        totalAmount: '',
        installmentCount: '',
        remainingInstallments: '',
        interestRate: '',
        paymentDay: '15',
        currencyId: '',
        startDate: new Date().toISOString().split('T')[0],
    })

    async function fetchData() {
        try {
            setLoading(true)
            const res = await fetch('/api/installments', { credentials: 'include' })
            if (!res.ok) {throw new Error('Veri alınamadı')}
            const data = await res.json()
            setInstallments(Array.isArray(data) ? data : [])
        } catch {
            toastError('Hata', 'Taksit verileri yüklenemedi')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (fetchedRef.current) {return}
        fetchedRef.current = true
        void fetchData()
        void fetchReferenceData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchReferenceData = async () => {
        try {
            const response = await fetch('/api/reference-data', { credentials: 'include' })
            if (!response.ok) {return}
            const data = (await response.json()) as ReferenceData
            setReferenceData(data)
            const tryCurrency = data.currencies.find(c => c.code === 'TRY')
            if (tryCurrency) {
                setCreateForm(prev => ({ ...prev, currencyId: String(tryCurrency.id) }))
            }
        } catch {
            // silently ignore
        }
    }

    const openCreateDrawer = () => {
        setFormErrors({})
        setCreateForm(prev => ({
            ...prev,
            name: '',
            bankId: '',
            loanType: 'PERSONAL',
            totalAmount: '',
            installmentCount: '',
            remainingInstallments: '',
            interestRate: '',
            paymentDay: '15',
            startDate: new Date().toISOString().split('T')[0],
        }))
        setDrawerOpen(true)
    }

    const validateForm = () => {
        const errors: Record<string, string> = {}
        if (!createForm.name.trim()) {errors.name = 'Taksit adı zorunludur'}
        if (!createForm.bankId) {errors.bankId = 'Banka seçimi zorunludur'}
        if (!createForm.currencyId) {errors.currencyId = 'Para birimi zorunludur'}
        const total = Number(createForm.totalAmount)
        if (!createForm.totalAmount || isNaN(total) || total <= 0) {errors.totalAmount = 'Geçerli bir tutar girin'}
        const count = Number(createForm.installmentCount)
        if (!createForm.installmentCount || isNaN(count) || count <= 0) {errors.installmentCount = 'Geçerli taksit sayısı girin'}
        const day = Number(createForm.paymentDay)
        if (!createForm.paymentDay || isNaN(day) || day < 1 || day > 31) {errors.paymentDay = 'Ödeme günü 1-31 arası olmalı'}
        if (!createForm.startDate) {errors.startDate = 'Başlangıç tarihi zorunludur'}
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleCreateInstallment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) {return}
        setSaving(true)
        try {
            const count = Number(createForm.installmentCount)
            const response = await fetch('/api/loans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: createForm.name.trim(),
                    bankId: Number(createForm.bankId),
                    loanType: createForm.loanType,
                    totalAmount: Number(createForm.totalAmount),
                    installmentCount: count,
                    remainingInstallments: createForm.remainingInstallments
                        ? Number(createForm.remainingInstallments)
                        : count,
                    interestRate: createForm.interestRate ? Number(createForm.interestRate) : null,
                    paymentDay: Number(createForm.paymentDay),
                    currencyId: Number(createForm.currencyId),
                    startDate: createForm.startDate,
                }),
            })
            if (!response.ok) {
                const payload = (await response.json()) as { error?: string }
                throw new Error(payload.error || 'Taksit eklenemedi')
            }
            toastSuccess('Başarılı', 'Taksit başarıyla eklendi')
            setDrawerOpen(false)
            void fetchData()
        } catch (err) {
            toastError('Hata', err instanceof Error ? err.message : 'Taksit eklenemedi')
        } finally {
            setSaving(false)
        }
    }

    async function handleProcessPayment(id: number) {
        setProcessingId(id)
        try {
            const res = await fetch(`/api/installments/${id}/process-payment`, {
                method: 'POST',
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) {throw new Error(data.error || 'Ödeme kaydedilemedi')}
            toastSuccess('Başarılı', 'Taksit ödemesi kaydedildi')
            void fetchData()
        } catch (err) {
            toastError('Hata', err instanceof Error ? err.message : 'Ödeme kaydedilemedi')
        } finally {
            setProcessingId(null)
        }
    }

    const active = installments
        .filter(i => i.remainingInstallments > 0)
        .sort((a, b) => {
            const diff = (getDiffDays(a.nextPaymentDate) ?? 999) - (getDiffDays(b.nextPaymentDate) ?? 999)
            return diff
        })
    const completed = installments.filter(i => i.remainingInstallments === 0)

    const overdue = active.filter(i => urgencyOf(i) === 'overdue')
    const currency = active[0]?.currencyCode ?? 'TRY'
    const totalMonthly = active.reduce((s, i) => s + (i.monthlyPayment ?? 0), 0)
    const totalRemaining = active.reduce((s, i) => s + (i.remainingAmount ?? 0), 0)

    if (loading) {
        return (
            <AppPageShell
                header={{
                    title: 'Taksit Ödemeleri',
                    description: 'Aylık ödeme takviminizi yönetin',
                    breadcrumbs: [{ label: 'Taksit Ödemeleri' }],
                    actions: (
                        <Button onClick={openCreateDrawer} disabled>
                            <Plus className="mr-2 h-4 w-4" />
                            Yeni Taksit
                        </Button>
                    ),
                }}
            >
                <div className="space-y-6">
                    <StatsGrid>
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-32 rounded-2xl" />
                        ))}
                    </StatsGrid>
                    <Skeleton className="h-[460px] rounded-2xl" />
                </div>
            </AppPageShell>
        )
    }

    return (
        <>
        <AppPageShell
            header={{
                title: 'Taksit Ödemeleri',
                description: 'Aktif taksitlerinizi takip edin ve ödemelerinizi kaydedin',
                breadcrumbs: [{ label: 'Taksit Ödemeleri' }],
                actions: (
                    <>
                        <Button variant="outline" onClick={() => void fetchData()}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Yenile
                        </Button>
                        <Button onClick={openCreateDrawer}>
                            <Plus className="mr-2 h-4 w-4" />
                            Yeni Taksit
                        </Button>
                    </>
                ),
            }}
        >
            {/* Özet istatistikler */}
            <StatsGrid>
                <StatCard
                    title="Aktif Taksit"
                    value={active.length}
                    icon={CalendarClock}
                    color="indigo"
                    subtitle={`${completed.length} tamamlandı`}
                />
                <StatCard
                    title="Bu Ayki Toplam"
                    value={formatCurrency(totalMonthly, currency)}
                    icon={Wallet}
                    color="amber"
                    subtitle="Bu ay ödenecek tutar"
                />
                <StatCard
                    title="Toplam Kalan Borç"
                    value={formatCurrency(totalRemaining, currency)}
                    icon={TrendingDown}
                    color="red"
                    subtitle="Tüm aktif taksitler"
                />
                <StatCard
                    title="Tamamlanan"
                    value={completed.length}
                    icon={CheckCircle2}
                    color="green"
                    subtitle="Kapatılan taksitler"
                />
            </StatsGrid>

            {/* Gecikmiş ödeme uyarısı */}
            {overdue.length > 0 && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/8 px-5 py-4">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                    <div>
                        <p className="font-semibold text-red-300">
                            {overdue.length} gecikmiş ödeme
                        </p>
                        <p className="mt-0.5 text-sm text-red-400/80">
                            {overdue.map(i => i.name).join(', ')} — lütfen en kısa sürede ödeyin.
                        </p>
                    </div>
                </div>
            )}

            {/* Ödeme listesi */}
            <DashboardCard
                title="Ödeme Takvimi"
                description={active.length > 0 ? `${active.length} aktif taksit · en yakın tarihe göre sıralı` : 'Henüz aktif taksit yok'}
                icon={CalendarDays}
                iconColor="text-indigo-400"
            >
                {active.length > 0 ? (
                    <div className="space-y-3">
                        {active.map(item => {
                            const total = item.totalInstallments || 1
                            const paid = item.paidInstallments || 0
                            const progress = Math.round((paid / total) * 100)
                            const urgency = urgencyOf(item)
                            const dateLabel = paymentDateLabel(item.nextPaymentDate)

                            const badgeProps =
                                urgency === 'overdue'
                                    ? { label: dateLabel, variant: 'destructive' as const }
                                    : urgency === 'today'
                                        ? { label: 'Bugün', variant: 'warning' as const }
                                        : urgency === 'soon'
                                            ? { label: dateLabel, variant: 'warning' as const }
                                            : { label: dateLabel, variant: 'secondary' as const }

                            const borderAccent =
                                urgency === 'overdue'
                                    ? 'border-l-red-500/70'
                                    : urgency === 'today' || urgency === 'soon'
                                        ? 'border-l-amber-500/70'
                                        : 'border-l-indigo-500/40'

                            return (
                                <Card
                                    key={item.id}
                                    className={`group overflow-hidden border-l-2 border-border/60 bg-card/80 transition-all duration-200 hover:bg-card hover:shadow-md ${borderAccent}`}
                                >
                                    <CardContent className="p-5">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            {/* Sol: ikon + isim + tarih badge */}
                                            <div className="flex min-w-0 items-start gap-3">
                                                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/12 ring-1 ring-indigo-500/20">
                                                    <Landmark className="h-5 w-5 text-indigo-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-semibold text-foreground">{item.name}</p>
                                                        <Badge variant={badgeProps.variant} className="text-[10px] font-medium">
                                                            {badgeProps.label}
                                                        </Badge>
                                                    </div>
                                                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                        {item.bankName && (
                                                            <span>{item.bankName}</span>
                                                        )}
                                                        {item.paymentDay && (
                                                            <span className="flex items-center gap-1">
                                                                <CalendarDays className="h-3 w-3" />
                                                                Her ayın {item.paymentDay}. günü
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Sağ: tutar + buton */}
                                            <div className="flex flex-shrink-0 items-center gap-3">
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-foreground">
                                                        {formatCurrency(item.monthlyPayment ?? 0, item.currencyCode ?? 'TRY')}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Kalan: <span className="text-red-400 font-medium">{formatCurrency(item.remainingAmount ?? 0, item.currencyCode ?? 'TRY')}</span>
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="success"
                                                    onClick={() => handleProcessPayment(item.id)}
                                                    disabled={processingId === item.id}
                                                    loading={processingId === item.id}
                                                >
                                                    Ödedim
                                                </Button>
                                            </div>
                                        </div>

                                        {/* İlerleme */}
                                        <div className="mt-4 space-y-1.5">
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{paid} / {total} taksit ödendi</span>
                                                <span className="font-medium text-indigo-400">%{progress}</span>
                                            </div>
                                            <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <EmptyState
                        title="Aktif taksit yok"
                        description="Tüm taksitler tamamlandı ya da henüz kredi tanımlanmadı."
                        icon={<CheckCircle2 className="h-10 w-10 text-green-400" />}
                    />
                )}
            </DashboardCard>

            {/* Dağılım özeti */}
            {installments.length > 0 && (
                <DashboardCard
                    title="Taksit Dağılımı"
                    description="Ödemelerinizin genel durumu"
                    icon={TrendingDown}
                    iconColor="text-violet-400"
                >
                    <div className="space-y-4">
                        <DistributionBar
                            label="Aktif taksitler"
                            value={`${active.length} adet`}
                            percentage={installments.length ? (active.length / installments.length) * 100 : 0}
                            tone="blue"
                            hint="Ödemeye devam eden krediler"
                        />
                        {overdue.length > 0 && (
                            <DistributionBar
                                label="Gecikmiş ödemeler"
                                value={`${overdue.length} adet`}
                                percentage={installments.length ? (overdue.length / installments.length) * 100 : 0}
                                tone="rose"
                                hint="Vadesi geçmiş taksitler"
                            />
                        )}
                        <DistributionBar
                            label="Tamamlanan"
                            value={`${completed.length} adet`}
                            percentage={installments.length ? (completed.length / installments.length) * 100 : 0}
                            tone="emerald"
                            hint="Kapatılan krediler"
                        />
                    </div>
                </DashboardCard>
            )}

            {/* Tamamlananlar */}
            {completed.length > 0 && (
                <DashboardCard
                    title="Tamamlanan Taksitler"
                    description={`${completed.length} kredi tamamen kapatıldı`}
                    icon={CheckCircle2}
                    iconColor="text-green-400"
                >
                    <div className="space-y-2">
                        {completed.map(item => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/15 px-4 py-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                                        {item.bankName && (
                                            <p className="text-xs text-muted-foreground">{item.bankName}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-foreground">
                                            {formatCurrency(item.totalAmount ?? 0, item.currencyCode ?? 'TRY')}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.totalInstallments} taksit
                                        </p>
                                    </div>
                                    <Badge variant="success" className="text-[10px]">Kapatıldı</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </DashboardCard>
            )}
        </AppPageShell>

        <Drawer open={drawerOpen} onOpenChange={open => { if (!open) { setDrawerOpen(false) } else { setDrawerOpen(true) } }}>
            <DrawerContent className="sm:max-w-lg">
                <DrawerHeader>
                    <DrawerTitle>Yeni Taksit Ekle</DrawerTitle>
                </DrawerHeader>
                <DrawerBody>
                    <form id="installment-form" onSubmit={e => { void handleCreateInstallment(e) }} className="space-y-4">
                        <FormField label="Taksit Adı" required error={formErrors.name}>
                            <Input
                                value={createForm.name}
                                onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Örn: Konut Kredisi, Araç Kredisi"
                            />
                        </FormField>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField label="Banka" required error={formErrors.bankId}>
                                <Select value={createForm.bankId} onValueChange={v => setCreateForm(prev => ({ ...prev, bankId: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Banka seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {referenceData?.banks.map(bank => (
                                            <SelectItem key={bank.id} value={String(bank.id)}>{bank.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>

                            <FormField label="Kredi Türü">
                                <Select value={createForm.loanType} onValueChange={v => setCreateForm(prev => ({ ...prev, loanType: v }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LOAN_TYPES.map(t => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField label="Toplam Tutar" required error={formErrors.totalAmount}>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={createForm.totalAmount}
                                    onChange={e => setCreateForm(prev => ({ ...prev, totalAmount: e.target.value }))}
                                    placeholder="0.00"
                                />
                            </FormField>

                            <FormField label="Para Birimi" required error={formErrors.currencyId}>
                                <Select value={createForm.currencyId} onValueChange={v => setCreateForm(prev => ({ ...prev, currencyId: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Para birimi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {referenceData?.currencies.map(c => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.code} — {c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField label="Toplam Taksit Sayısı" required error={formErrors.installmentCount}>
                                <Input
                                    type="number"
                                    min="1"
                                    value={createForm.installmentCount}
                                    onChange={e => setCreateForm(prev => ({ ...prev, installmentCount: e.target.value }))}
                                    placeholder="Örn: 36"
                                />
                            </FormField>

                            <FormField label="Kalan Taksit" hint="Boş bırakılırsa toplam taksit sayısı kullanılır">
                                <Input
                                    type="number"
                                    min="0"
                                    value={createForm.remainingInstallments}
                                    onChange={e => setCreateForm(prev => ({ ...prev, remainingInstallments: e.target.value }))}
                                    placeholder="Devam eden taksit varsa"
                                />
                            </FormField>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField label="Faiz Oranı (%)" hint="İsteğe bağlı">
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={createForm.interestRate}
                                    onChange={e => setCreateForm(prev => ({ ...prev, interestRate: e.target.value }))}
                                    placeholder="Örn: 2.5"
                                />
                            </FormField>

                            <FormField label="Ödeme Günü (1-31)" required error={formErrors.paymentDay}>
                                <Input
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={createForm.paymentDay}
                                    onChange={e => setCreateForm(prev => ({ ...prev, paymentDay: e.target.value }))}
                                />
                            </FormField>
                        </div>

                        <FormField label="Başlangıç Tarihi" required error={formErrors.startDate}>
                            <Input
                                type="date"
                                value={createForm.startDate}
                                onChange={e => setCreateForm(prev => ({ ...prev, startDate: e.target.value }))}
                            />
                        </FormField>
                    </form>
                </DrawerBody>
                <DrawerFooter>
                    <Button variant="outline" onClick={() => setDrawerOpen(false)}>İptal</Button>
                    <Button type="submit" form="installment-form" loading={saving}>
                        Taksit Ekle
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
        </>
    )
}

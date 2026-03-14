'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    FormField,
    Input,
    PageHeader,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/mosaic'
import { useToast } from '@/lib/use-toast'
import {
    Building2,
    CreditCard,
    Plus,
    Trash2,
    Calendar,
    TrendingUp
} from 'lucide-react'

interface Loan {
    id: number
    name: string
    bankId: number
    loanType: string
    totalAmount: number
    installmentCount: number
    remainingInstallments: number
    interestRate?: number
    paymentDay: number
    currencyId: number
    startDate: string
    description?: string
    isActive: boolean
    isFictional: boolean
    monthlyPayment?: number
    bankName: string
    currencyCode: string
}

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

export default function LoansPage() {
    const router = useRouter()
    const { success, error } = useToast()
    const [loans, setLoans] = useState<Loan[]>([])
    const [loading, setLoading] = useState(true)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
    const [saving, setSaving] = useState(false)
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
        isFictional: false,
    })

    useEffect(() => {
        void fetchLoans()
        void fetchReferenceData()
    }, [])

    const fetchLoans = async () => {
        try {
            const res = await fetch('/api/loans')
            if (res.ok) {
                const data = await res.json()
                setLoans(data)
            }
        } catch (err) {
            console.error('Krediler yüklenemedi:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchReferenceData = async () => {
        try {
            const response = await fetch('/api/reference-data')
            if (!response.ok) {
                return
            }

            const data = (await response.json()) as ReferenceData
            setReferenceData(data)

            const tryCurrency = data.currencies.find(currency => currency.code === 'TRY')
            if (tryCurrency) {
                setCreateForm(prev => ({ ...prev, currencyId: String(tryCurrency.id) }))
            }
        } catch (err) {
            console.error('Referans veriler yüklenemedi:', err)
        }
    }

    const openCreateDrawer = () => {
        setFormErrors({})
        setCreateForm(prev => ({
            ...prev,
            name: '',
            bankId: '',
            totalAmount: '',
            installmentCount: '',
            remainingInstallments: '',
            interestRate: '',
            paymentDay: '15',
            startDate: new Date().toISOString().split('T')[0],
            isFictional: false,
        }))
        setDrawerOpen(true)
    }

    const validateCreateForm = () => {
        const nextErrors: Record<string, string> = {}

        if (!createForm.name.trim()) {
            nextErrors.name = 'Kredi adı zorunludur'
        }
        if (!createForm.bankId) {
            nextErrors.bankId = 'Banka seçimi zorunludur'
        }
        if (!createForm.currencyId) {
            nextErrors.currencyId = 'Para birimi seçimi zorunludur'
        }

        const totalAmount = Number(createForm.totalAmount)
        if (!createForm.totalAmount || Number.isNaN(totalAmount) || totalAmount <= 0) {
            nextErrors.totalAmount = 'Geçerli bir toplam tutar girin'
        }

        const installmentCount = Number(createForm.installmentCount)
        if (!createForm.installmentCount || Number.isNaN(installmentCount) || installmentCount <= 0) {
            nextErrors.installmentCount = 'Geçerli bir taksit sayısı girin'
        }

        if (createForm.remainingInstallments) {
            const remainingInstallments = Number(createForm.remainingInstallments)
            if (Number.isNaN(remainingInstallments) || remainingInstallments < 0) {
                nextErrors.remainingInstallments = 'Kalan taksit 0 veya daha büyük olmalı'
            }
        }

        const paymentDay = Number(createForm.paymentDay)
        if (!createForm.paymentDay || Number.isNaN(paymentDay) || paymentDay < 1 || paymentDay > 31) {
            nextErrors.paymentDay = 'Ödeme günü 1-31 arasında olmalıdır'
        }

        if (!createForm.startDate) {
            nextErrors.startDate = 'Başlangıç tarihi zorunludur'
        }

        setFormErrors(nextErrors)
        return Object.keys(nextErrors).length === 0
    }

    const handleCreateLoan = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateCreateForm()) {
            return
        }

        setSaving(true)
        try {
            const response = await fetch('/api/loans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: createForm.name.trim(),
                    bankId: Number(createForm.bankId),
                    loanType: createForm.loanType,
                    totalAmount: Number(createForm.totalAmount),
                    installmentCount: Number(createForm.installmentCount),
                    remainingInstallments: createForm.remainingInstallments
                        ? Number(createForm.remainingInstallments)
                        : Number(createForm.installmentCount),
                    interestRate: createForm.interestRate ? Number(createForm.interestRate) : null,
                    paymentDay: Number(createForm.paymentDay),
                    currencyId: Number(createForm.currencyId),
                    startDate: createForm.startDate,
                    isFictional: createForm.isFictional,
                }),
            })

            if (!response.ok) {
                const payload = (await response.json()) as { error?: string }
                throw new Error(payload.error || 'Kredi eklenemedi')
            }

            success('Başarılı', 'Kredi başarıyla eklendi')
            setDrawerOpen(false)
            await fetchLoans()
        } catch (err) {
            error('Hata', err instanceof Error ? err.message : 'Kredi eklenemedi')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Bu krediyi silmek istediğinize emin misiniz?')) {
            return
        }

        try {
            const res = await fetch(`/api/loans/${id}`, { method: 'DELETE' })
            if (res.ok) {
                success('Başarılı', 'Kredi başarıyla silindi')
                fetchLoans()
            } else {
                error('Hata', 'Kredi silinemedi')
            }
        } catch (err) {
            error('Hata', 'Kredi silinirken bir hata oluştu')
        }
    }

    if (loading) {
        return <div className="p-6">Yükleniyor...</div>
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Kredi ve Borç Yönetimi"
                description="Kredilerinizi takip edin, ödeme planınızı görün ve yeni kredi ekleyin."
                breadcrumbs={[{ label: 'Krediler' }]}
                actions={(
                    <Button onClick={openCreateDrawer}>
                        <Plus className="mr-2 h-4 w-4" /> Yeni Kredi Ekle
                    </Button>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loans.map((loan) => (
                    <Card key={loan.id} className="relative overflow-hidden border-l-4 border-l-blue-500">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl">{loan.name}</CardTitle>
                                    <CardDescription className="flex items-center mt-1">
                                        <Building2 className="h-3 w-3 mr-1" /> {loan.bankName}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${loan.isActive ? 'bg-green-500/15 text-green-400' : 'bg-gray-100 text-gray-700'}`}>
                                        {loan.isActive ? 'Aktif' : 'Tamamlandı'}
                                    </div>
                                    {loan.isFictional && (
                                        <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500/15 text-blue-400">
                                            📋 Kurgu
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm text-muted-foreground">Toplam Tutar</p>
                                    <p className="text-2xl font-bold text-blue-400">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: loan.currencyCode }).format(loan.totalAmount)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Kalan Taksit</p>
                                    <p className="text-lg font-semibold">{loan.remainingInstallments} / {loan.installmentCount}</p>
                                </div>
                            </div>

                            {/* Aylık Ödeme */}
                            {loan.monthlyPayment && (
                                <div className="p-3 bg-accent/20 rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">Aylık Ödeme</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: loan.currencyCode }).format(loan.monthlyPayment)}
                                    </p>
                                </div>
                            )}

                            {/* Progress Bar */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>İlerleme</span>
                                    <span>%{Math.round(((loan.installmentCount - loan.remainingInstallments) / loan.installmentCount) * 100)}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${((loan.installmentCount - loan.remainingInstallments) / loan.installmentCount) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                <div className="flex items-center text-sm">
                                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span>Her ayın {loan.paymentDay}. günü</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span>%{loan.interestRate?.toString() || '0'} Faiz</span>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => router.push(`/loans/${loan.id}`)}
                                >
                                    Detay
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-400 hover:text-red-400 hover:bg-red-50"
                                    onClick={() => handleDelete(loan.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {loans.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-accent/20 rounded-lg border-2 border-dashed">
                        <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold">Henüz kredi eklenmemiş</h3>
                        <p className="text-muted-foreground mb-6">Hemen ilk kredinizi ekleyerek taksitlerinizi takip etmeye başlayın.</p>
                        <Button onClick={openCreateDrawer} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> Yeni Kredi Ekle
                        </Button>
                    </div>
                )}
            </div>

            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerContent className="border-white/10 bg-slate-950 sm:max-w-xl">
                    <form onSubmit={e => void handleCreateLoan(e)} className="flex h-full flex-col">
                        <DrawerHeader>
                            <DrawerTitle>Yeni Kredi Ekle</DrawerTitle>
                            <DrawerDescription>
                                Kredinizi sayfadan ayrılmadan oluşturun ve ödeme planınızı hemen izlemeye başlayın.
                            </DrawerDescription>
                        </DrawerHeader>

                        <DrawerBody className="space-y-5">
                            <FormField label="Kredi Adı" required error={formErrors.name}>
                                <Input
                                    value={createForm.name}
                                    onChange={event => {
                                        setCreateForm(prev => ({ ...prev, name: event.target.value }))
                                        if (formErrors.name) {
                                            setFormErrors(prev => ({ ...prev, name: '' }))
                                        }
                                    }}
                                    placeholder="Örn: Konut Kredisi"
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

                                <FormField label="Kredi Türü" required>
                                    <Select
                                        value={createForm.loanType}
                                        onValueChange={value => setCreateForm(prev => ({ ...prev, loanType: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LOAN_TYPES.map(type => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormField>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField label="Toplam Tutar" required error={formErrors.totalAmount}>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={createForm.totalAmount}
                                        onChange={event => {
                                            setCreateForm(prev => ({ ...prev, totalAmount: event.target.value }))
                                            if (formErrors.totalAmount) {
                                                setFormErrors(prev => ({ ...prev, totalAmount: '' }))
                                            }
                                        }}
                                        placeholder="150000"
                                        variant={formErrors.totalAmount ? 'error' : 'default'}
                                    />
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
                                <FormField label="Toplam Taksit" required error={formErrors.installmentCount}>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={createForm.installmentCount}
                                        onChange={event => {
                                            setCreateForm(prev => ({ ...prev, installmentCount: event.target.value }))
                                            if (formErrors.installmentCount) {
                                                setFormErrors(prev => ({ ...prev, installmentCount: '' }))
                                            }
                                        }}
                                        placeholder="36"
                                        variant={formErrors.installmentCount ? 'error' : 'default'}
                                    />
                                </FormField>

                                <FormField
                                    label="Kalan Taksit"
                                    hint="Boşsa toplam taksit kabul edilir"
                                    error={formErrors.remainingInstallments}
                                >
                                    <Input
                                        type="number"
                                        min="0"
                                        value={createForm.remainingInstallments}
                                        onChange={event => {
                                            setCreateForm(prev => ({ ...prev, remainingInstallments: event.target.value }))
                                            if (formErrors.remainingInstallments) {
                                                setFormErrors(prev => ({ ...prev, remainingInstallments: '' }))
                                            }
                                        }}
                                        placeholder="24"
                                        variant={formErrors.remainingInstallments ? 'error' : 'default'}
                                    />
                                </FormField>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <FormField label="Faiz (%)">
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={createForm.interestRate}
                                        onChange={event => setCreateForm(prev => ({ ...prev, interestRate: event.target.value }))}
                                        placeholder="12.5"
                                    />
                                </FormField>

                                <FormField label="Ödeme Günü" required error={formErrors.paymentDay}>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={createForm.paymentDay}
                                        onChange={event => {
                                            setCreateForm(prev => ({ ...prev, paymentDay: event.target.value }))
                                            if (formErrors.paymentDay) {
                                                setFormErrors(prev => ({ ...prev, paymentDay: '' }))
                                            }
                                        }}
                                        variant={formErrors.paymentDay ? 'error' : 'default'}
                                    />
                                </FormField>

                                <FormField label="Başlangıç" required error={formErrors.startDate}>
                                    <Input
                                        type="date"
                                        value={createForm.startDate}
                                        onChange={event => {
                                            setCreateForm(prev => ({ ...prev, startDate: event.target.value }))
                                            if (formErrors.startDate) {
                                                setFormErrors(prev => ({ ...prev, startDate: '' }))
                                            }
                                        }}
                                        variant={formErrors.startDate ? 'error' : 'default'}
                                    />
                                </FormField>
                            </div>

                            <label className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={createForm.isFictional}
                                    onChange={event => setCreateForm(prev => ({ ...prev, isFictional: event.target.checked }))}
                                    className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                                />
                                <span>Kurgu kredi olarak işaretle (planlama amaçlı)</span>
                            </label>
                        </DrawerBody>

                        <DrawerFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>
                                Vazgeç
                            </Button>
                            <Button type="submit" variant="glow" loading={saving} disabled={saving}>
                                Krediyi Kaydet
                            </Button>
                        </DrawerFooter>
                    </form>
                </DrawerContent>
            </Drawer>
        </div>
    )
}

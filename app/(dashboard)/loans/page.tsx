'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

export default function LoansPage() {
    const router = useRouter()
    const { success, error } = useToast()
    const [loans, setLoans] = useState<Loan[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLoans()
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Kredi ve Borç Yönetimi</h1>
                    <p className="text-muted-foreground">Kredilerinizi takip edin ve ödemelerinizi planlayın</p>
                </div>
                <Button onClick={() => router.push('/loans/new')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Yeni Kredi Ekle
                </Button>
            </div>

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
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${loan.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {loan.isActive ? 'Aktif' : 'Tamamlandı'}
                                    </div>
                                    {loan.isFictional && (
                                        <div className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
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
                                    <p className="text-2xl font-bold text-blue-600">
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
                                <div className="p-3 bg-gray-50 rounded-lg">
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
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDelete(loan.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {loans.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-lg border-2 border-dashed">
                        <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold">Henüz kredi eklenmemiş</h3>
                        <p className="text-muted-foreground mb-6">Hemen ilk kredinizi ekleyerek taksitlerinizi takip etmeye başlayın.</p>
                        <Button onClick={() => router.push('/loans/new')} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> Yeni Kredi Ekle
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

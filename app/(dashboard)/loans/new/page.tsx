'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/lib/use-toast'
import { ArrowLeft, Save, Building2, CreditCard } from 'lucide-react'

interface ReferenceData {
    banks: Array<{ id: number; name: string }>
    currencies: Array<{ id: number; code: string; name: string }>
}

export default function NewLoanPage() {
    const router = useRouter()
    const { success, error } = useToast()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [refData, setRefData] = useState<ReferenceData | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        bankId: 0,
        loanType: 'PERSONAL',
        totalAmount: '',
        installmentCount: '',
        remainingInstallments: '',
        interestRate: '',
        paymentDay: 15,
        currencyId: 0,
        startDate: new Date().toISOString().split('T')[0],
        description: ''
    })

    useEffect(() => {
        fetchReferenceData()
    }, [])

    const fetchReferenceData = async () => {
        try {
            const res = await fetch('/api/reference-data')
            if (res.ok) {
                setRefData(await res.json())
            }
        } catch (err) {
            console.error('Referans verileri alınamadı:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const res = await fetch('/api/loans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    bankId: Number(formData.bankId),
                    currencyId: Number(formData.currencyId),
                    totalAmount: Number(formData.totalAmount),
                    installmentCount: Number(formData.installmentCount),
                    remainingInstallments: Number(formData.remainingInstallments || formData.installmentCount),
                    interestRate: formData.interestRate ? Number(formData.interestRate) : null,
                    paymentDay: Number(formData.paymentDay),
                })
            })

            if (res.ok) {
                success('Başarılı', 'Kredi başarıyla eklendi')
                router.push('/loans')
            } else {
                error('Hata', 'Kredi eklenirken bir hata oluştu')
            }
        } catch (err) {
            error('Hata', 'Kredi eklenirken bir hata oluştu')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-6">Yükleniyor...</div>

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Yeni Kredi Ekle</h1>
                    <p className="text-muted-foreground">Kredi detaylarını doldurarak takip etmeye başlayın</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        Kredi Bilgileri
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Kredi Adı *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Örn: Konut Kredisi, Garanti Borç"
                                    value={formData.name}
                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Banka *</label>
                                <select
                                    required
                                    className="w-full p-2 border rounded-md"
                                    value={formData.bankId}
                                    onChange={e => setFormData(prev => ({ ...prev, bankId: Number(e.target.value) }))}
                                >
                                    <option value={0}>Seçiniz</option>
                                    {refData?.banks.map(bank => (
                                        <option key={bank.id} value={bank.id}>{bank.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Kredi Türü *</label>
                                <select
                                    required
                                    className="w-full p-2 border rounded-md"
                                    value={formData.loanType}
                                    onChange={e => setFormData(prev => ({ ...prev, loanType: e.target.value }))}
                                >
                                    <option value="PERSONAL">İhtiyaç Kredisi</option>
                                    <option value="HOUSING">Konut Kredisi</option>
                                    <option value="VEHICLE">Taşıt Kredisi</option>
                                    <option value="CREDIT_CARD">Kredi Kartı Borcu</option>
                                    <option value="OTHER">Diğer</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Toplam Borç Tutar *</label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    className="w-full p-2 border rounded-md"
                                    value={formData.totalAmount}
                                    onChange={e => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Para Birimi *</label>
                                <select
                                    required
                                    className="w-full p-2 border rounded-md"
                                    value={formData.currencyId}
                                    onChange={e => setFormData(prev => ({ ...prev, currencyId: Number(e.target.value) }))}
                                >
                                    <option value={0}>Seçiniz</option>
                                    {refData?.currencies.map(curr => (
                                        <option key={curr.id} value={curr.id}>{curr.code}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Toplam Taksit Sayısı *</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full p-2 border rounded-md"
                                    value={formData.installmentCount}
                                    onChange={e => setFormData(prev => ({ ...prev, installmentCount: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Kalan Taksit Sayısı</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Boş bırakılırsa tamamı"
                                    value={formData.remainingInstallments}
                                    onChange={e => setFormData(prev => ({ ...prev, remainingInstallments: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Yıllık Faiz Oranı (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full p-2 border rounded-md"
                                    value={formData.interestRate}
                                    onChange={e => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Ödeme Günü (1-31) *</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    required
                                    className="w-full p-2 border rounded-md"
                                    value={formData.paymentDay}
                                    onChange={e => setFormData(prev => ({ ...prev, paymentDay: Number(e.target.value) }))}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Başlangıç Tarihi *</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full p-2 border rounded-md"
                                    value={formData.startDate}
                                    onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                                İptal
                            </Button>
                            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={saving}>
                                <Save className="mr-2 h-4 w-4" /> {saving ? 'Kaydediliyor...' : 'Krediyi Kaydet'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

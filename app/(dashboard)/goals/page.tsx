'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/lib/use-toast'
import { formatCurrency } from '@/lib/validators'
import {
    Target,
    Plus,
    Trophy,
    Calendar,
    ArrowLeft,
    Home,
    Trash2,
    Edit3,
    CheckCircle2,
    Star,
    Zap
} from 'lucide-react'

interface Goal {
    id: number
    name: string
    targetAmount: number
    currentAmount: number
    currencyId: number
    targetDate: string | null
    category: string | null
    status: 'active' | 'completed' | 'cancelled'
    icon: string | null
    color: string | null
    notes: string | null
    currency: {
        code: string
        symbol: string
    }
}

export default function GoalsPage() {
    const router = useRouter()
    const { success: toastSuccess, error: toastError } = useToast()
    const [goals, setGoals] = useState<Goal[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        targetAmount: '',
        currencyId: '1', // Default to TRY
        targetDate: '',
        category: 'Genel',
        notes: ''
    })
    const [currencies, setCurrencies] = useState<{ id: number; code: string; symbol: string }[]>([])
    const fetchedRef = useRef(false)

    useEffect(() => {
        if (fetchedRef.current) {
            return
        }
        fetchedRef.current = true
        void fetchData()
    }, [])

    async function fetchData() {
        try {
            setLoading(true)
            const [goalsRes, currenciesRes] = await Promise.all([
                fetch('/api/goals'),
                fetch('/api/reference-data?type=currency')
            ])

            if (goalsRes.ok) {
                const data = await goalsRes.json()
                setGoals(data)
            }

            if (currenciesRes.ok) {
                const data = await currenciesRes.json()
                setCurrencies(data)
            }
        } catch (error) {
            console.error('Goals fetch error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                toastSuccess('Başarılı', 'Hedef başarıyla oluşturuldu')
                setIsAdding(false)
                setFormData({
                    name: '',
                    targetAmount: '',
                    currencyId: '1',
                    targetDate: '',
                    category: 'Genel',
                    notes: ''
                })
                void fetchData()
            } else {
                toastError('Hata', 'Hedef oluşturulamadı')
            }
        } catch (error) {
            toastError('Hata', 'Bir hata oluştu')
        }
    }

    const handleDeleteGoal = async (id: number) => {
        if (!confirm('Bu hedefi silmek istediğinize emin misiniz?')) {
            return
        }
        try {
            const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' })
            if (res.ok) {
                toastSuccess('Başarılı', 'Hedef silindi')
                setGoals(goals.filter(g => g.id !== id))
            }
        } catch (error) {
            toastError('Hata', 'Hedef silinemedi')
        }
    }

    const calculateProgress = (current: number, target: number) => {
        return Math.min(100, Math.max(0, (current / target) * 100))
    }

    const getDaysRemaining = (date: string | null) => {
        if (!date) {
            return null
        }
        const target = new Date(date)
        const now = new Date()
        const diff = target.getTime() - now.getTime()
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white/80 rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </button>
                    <Link href="/dashboard" className="p-2 hover:bg-white/80 rounded-lg transition-colors">
                        <Home className="h-5 w-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-2">
                            <Target className="h-7 w-7 text-blue-600" />
                            Finansal Hedeflerim
                        </h1>
                        <p className="text-sm text-slate-600">Hayallerinize giden yolu takip edin</p>
                    </div>
                </div>
                <Button
                    onClick={() => setIsAdding(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Hedef
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Trophy className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full text-white">Toplam</span>
                        </div>
                        <p className="text-sm text-blue-100 mb-1">Aktif Hedefler</p>
                        <p className="text-3xl font-bold">{goals.length}</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <span className="text-xs font-medium bg-green-50 px-2 py-1 rounded-full text-green-600">Başarı</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-1">Tamamlanan</p>
                        <p className="text-3xl font-bold text-slate-800">{goals.filter(g => g.status === 'completed').length}</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Star className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 mb-1">En Yakın Hedef</p>
                        <p className="text-xl font-bold text-slate-800 truncate">
                            {goals.length > 0 ? goals[0].name : 'Henüz yok'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Adding Goal Form */}
            {isAdding && (
                <Card className="border-2 border-blue-100 shadow-xl bg-white animate-in slide-in-from-top-4 duration-300">
                    <CardHeader>
                        <CardTitle>Yeni Finansal Hedef Oluştur</CardTitle>
                        <CardDescription>Hedefinizi belirleyin ve tasarruf etmeye başlayın</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Hedef Adı</label>
                                <Input
                                    placeholder="Örn: Yeni Araba"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Hedef Tutar</label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.targetAmount}
                                    onChange={e => setFormData({ ...formData, targetAmount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Para Birimi</label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm"
                                    value={formData.currencyId}
                                    onChange={e => setFormData({ ...formData, currencyId: e.target.value })}
                                >
                                    {currencies.map(c => (
                                        <option key={c.id} value={c.id}>{c.code} ({c.symbol})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Hedef Tarih (İsteğe bağlı)</label>
                                <Input
                                    type="date"
                                    value={formData.targetDate}
                                    onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>İptal</Button>
                                <Button type="submit" className="bg-blue-600 text-white">Oluştur</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Goals List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {goals.map(goal => {
                    const progress = calculateProgress(goal.currentAmount, goal.targetAmount)
                    const daysLeft = getDaysRemaining(goal.targetDate)

                    return (
                        <Card key={goal.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                            <div className={`h-1.5 w-full bg-slate-100`}>
                                <div
                                    className={`h-full transition-all duration-1000 bg-gradient-to-r from-blue-500 to-indigo-600`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-blue-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            <Zap className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800">{goal.name}</h3>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider">{goal.category || 'Genel'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDeleteGoal(goal.id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Mevcut</p>
                                        <p className="font-bold text-slate-800">{formatCurrency(goal.currentAmount, goal.currency.code)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 mb-1">Hedef</p>
                                        <p className="font-bold text-blue-600">{formatCurrency(goal.targetAmount, goal.currency.code)}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 font-medium">İlerleme</span>
                                        <span className="font-bold text-blue-600">%{progress.toFixed(1)}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString('tr-TR') : 'Tarih belirtilmedi'}
                                    </div>
                                    {daysLeft !== null && daysLeft > 0 && (
                                        <div className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                                            {daysLeft} gün kaldı
                                        </div>
                                    )}
                                    {progress >= 100 && (
                                        <div className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Tamamlandı
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}

                {goals.length === 0 && !isAdding && (
                    <div className="lg:col-span-2 text-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-slate-200">
                        <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Henüz bir hedefiniz yok</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mt-2">Finansal özgürlüğe giden yol bir hedefle başlar. Hemen ilk hedefinizi oluşturun!</p>
                        <Button
                            onClick={() => setIsAdding(true)}
                            className="mt-6 bg-blue-600 text-white"
                        >
                            İlk Hedefimi Oluştur
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

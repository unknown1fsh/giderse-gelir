'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Rocket, ArrowLeft, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import BrandLogo from '@/components/brand-logo'
import DemoDashboard from '@/components/demo/demo-dashboard'
import DemoTransactions from '@/components/demo/demo-transactions'
import DemoAccounts from '@/components/demo/demo-accounts'
import {
  demoAccounts as initialDemoAccounts,
  demoTransactions as initialDemoTransactions,
  demoSummary as initialDemoSummary,
  DemoTransaction,
  DemoAccount,
  DemoSummary,
} from '@/lib/demo-data'

export default function DemoPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<DemoTransaction[]>(initialDemoTransactions)
  const [accounts] = useState<DemoAccount[]>(initialDemoAccounts)
  const [summary, setSummary] = useState<DemoSummary>(initialDemoSummary)

  // İşlemler değiştiğinde özeti güncelle
  useEffect(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const balance = totalIncome - totalExpense
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0

    setSummary({
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
    })
  }, [transactions])

  const handleAddTransaction = (transaction: Omit<DemoTransaction, 'id'>) => {
    const newTransaction: DemoTransaction = {
      ...transaction,
      id: Date.now().toString(),
    }
    setTransactions(prev => [newTransaction, ...prev])
  }

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const handleReset = () => {
    if (
      confirm('Tüm demo verilerini temizlemek istediğinize emin misiniz? Bu işlem geri alınamaz.')
    ) {
      setTransactions([])
      // Summary otomatik olarak useEffect tarafından güncellenecek
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/landing')}
                className="text-slate-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
              <div className="flex items-center gap-2">
                <BrandLogo size={24} variant="dark" textClassName="text-white font-medium" />
                <span className="text-slate-400 text-sm">Demo</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sıfırla
              </Button>
              <Button size="sm" variant="premium" onClick={() => router.push('/auth/register')}>
                <Rocket className="h-4 w-4 mr-2" />
                Gerçek Hesap Oluştur
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Banner */}
      <div className="bg-yellow-500/10 border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center gap-2 text-sm text-yellow-200">
            <span className="font-semibold">⚠️ Demo Modu:</span>
            <span>
              Bu sayfadaki tüm veriler örnek verilerdir. Gerçek hesap oluşturmak için yukarıdaki
              butona tıklayın.
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Summary */}
        <DemoDashboard summary={summary} />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions - 2 columns */}
          <div className="lg:col-span-2">
            <DemoTransactions
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>

          {/* Accounts - 1 column */}
          <div>
            <DemoAccounts accounts={accounts} />
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-8 p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Demo Hakkında</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Bu demo sayfasında uygulamanın temel özelliklerini test edebilirsiniz. İşlem
            ekleyebilir, silebilir ve finansal durumunuzun nasıl güncellendiğini görebilirsiniz. Tüm
            değişiklikler sadece tarayıcınızda saklanır ve sayfa yenilendiğinde demo verileri geri
            yüklenir. Gerçek hesap oluşturarak tüm özelliklere erişebilir ve verilerinizi güvenle
            saklayabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  )
}

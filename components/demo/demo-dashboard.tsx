'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react'
import { DemoSummary } from '@/lib/demo-data'

interface DemoDashboardProps {
  summary: DemoSummary
}

export default function DemoDashboard({ summary }: DemoDashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-emerald-500/10 to-green-600/10 border-emerald-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Toplam Gelir</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {summary.totalIncome.toLocaleString('tr-TR', {
              style: 'currency',
              currency: 'TRY',
              minimumFractionDigits: 2,
            })}
          </div>
          <p className="text-xs text-slate-400 mt-1">Bu ay</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-500/10 to-rose-600/10 border-red-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Toplam Gider</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {summary.totalExpense.toLocaleString('tr-TR', {
              style: 'currency',
              currency: 'TRY',
              minimumFractionDigits: 2,
            })}
          </div>
          <p className="text-xs text-slate-400 mt-1">Bu ay</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Net Bakiye</CardTitle>
          <Wallet className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {summary.balance.toLocaleString('tr-TR', {
              style: 'currency',
              currency: 'TRY',
              minimumFractionDigits: 2,
            })}
          </div>
          <p className="text-xs text-slate-400 mt-1">Gelir - Gider</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Tasarruf Oranı</CardTitle>
          <Target className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{summary.savingsRate.toFixed(1)}%</div>
          <p className="text-xs text-slate-400 mt-1">Gelirin yüzdesi</p>
        </CardContent>
      </Card>
    </div>
  )
}

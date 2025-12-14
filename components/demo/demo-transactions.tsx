'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { DemoTransaction } from '@/lib/demo-data'

interface DemoTransactionsProps {
  transactions: DemoTransaction[]
  onAddTransaction: (transaction: Omit<DemoTransaction, 'id'>) => void
  onDeleteTransaction: (id: string) => void
}

export default function DemoTransactions({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
}: DemoTransactionsProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    account: 'Ana Hesap',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.description || !formData.amount) {
      return
    }

    const newTransaction: Omit<DemoTransaction, 'id'> = {
      date: new Date().toISOString().split('T')[0],
      description: formData.description,
      amount:
        formData.type === 'income' ? parseFloat(formData.amount) : -parseFloat(formData.amount),
      type: formData.type,
      category: formData.category || (formData.type === 'income' ? 'Ek Gelir' : 'Diğer'),
      account: formData.account,
    }

    onAddTransaction(newTransaction)
    setFormData({
      description: '',
      amount: '',
      type: 'expense',
      category: '',
      account: 'Ana Hesap',
    })
    setShowAddForm(false)
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Son İşlemler</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm(!showAddForm)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            İşlem Ekle
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <form onSubmit={handleSubmit} className="mb-4 p-4 bg-slate-700/50 rounded-lg space-y-3">
            <div>
              <input
                type="text"
                placeholder="Açıklama"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-400"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Tutar"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-400"
                required
                step="0.01"
                min="0"
              />
              <select
                value={formData.type}
                onChange={e =>
                  setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })
                }
                className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
              >
                <option value="expense">Gider</option>
                <option value="income">Gelir</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                Ekle
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="border-slate-600 text-slate-300"
              >
                İptal
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {transactions.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Henüz işlem yok</p>
          ) : (
            transactions.map(transaction => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`p-2 rounded-lg ${
                      transaction.type === 'income'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {transaction.type === 'income' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{transaction.description}</div>
                    <div className="text-xs text-slate-400">
                      {transaction.category} • {transaction.account} • {transaction.date}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-semibold ${
                      transaction.amount >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {transaction.amount >= 0 ? '+' : ''}
                    {transaction.amount.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteTransaction(transaction.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

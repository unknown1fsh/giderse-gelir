'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet } from 'lucide-react'
import { DemoAccount } from '@/lib/demo-data'

interface DemoAccountsProps {
  accounts: DemoAccount[]
}

export default function DemoAccounts({ accounts }: DemoAccountsProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Hesaplar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {accounts.map(account => (
            <div
              key={account.id}
              className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{account.name}</div>
                  <div className="text-sm text-slate-400">
                    {account.bankName} • {account.accountType}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {account.balance.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: account.currency,
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-xs text-slate-400">{account.currency}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

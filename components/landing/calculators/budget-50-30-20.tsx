'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/mosaic'
import { Input } from '@/components/mosaic'
import { Label } from '@/components/mosaic'
import { Button } from '@/components/mosaic'
import { formatCurrency } from '@/lib/validators'
import { budget503020, parseNumber } from '@/lib/finance-calculators'

export default function BudgetCalculator() {
  const [income, setIncome] = useState('50000')

  const result = useMemo(() => {
    const i = parseNumber(income)
    if (i === null) {
      return null
    }
    const net = Math.max(0, i)
    return budget503020(net)
  }, [income])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-slate-200">Aylık Net Gelir (₺)</Label>
          <Input
            value={income}
            onChange={e => setIncome(e.target.value)}
            inputMode="decimal"
            className="bg-white/5 border-white/20 text-white"
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
            onClick={() => setIncome('50000')}
          >
            Sıfırla
          </Button>
        </div>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {!result ? (
            <div className="text-slate-300 text-sm">
              Geçerli değerler girince sonuçlar görünecek.
            </div>
          ) : (
            <>
              <div>
                <div className="text-xs text-slate-300">İhtiyaçlar (50%)</div>
                <div className="text-xl font-bold text-white">
                  {formatCurrency(result.needs, 'TRY')}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-300">İstekler (30%)</div>
                <div className="text-xl font-bold text-white">
                  {formatCurrency(result.wants, 'TRY')}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-300">Tasarruf (20%)</div>
                <div className="text-xl font-bold text-white">
                  {formatCurrency(result.savings, 'TRY')}
                </div>
              </div>
              <div className="sm:col-span-3 text-xs text-slate-400">
                Bu kural, bütçeyi hızlıca dengelemek için pratik bir başlangıç noktasıdır.
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

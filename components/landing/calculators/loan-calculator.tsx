'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/validators'
import { clamp, loanMonthlyPayment, parseNumber } from '@/lib/finance-calculators'

export default function LoanCalculator() {
  const [principal, setPrincipal] = useState('200000')
  const [annualRate, setAnnualRate] = useState('55')
  const [months, setMonths] = useState('24')

  const result = useMemo(() => {
    const p = parseNumber(principal)
    const rPct = parseNumber(annualRate)
    const m = parseNumber(months)
    if (p === null || rPct === null || m === null) {
      return null
    }
    const principalVal = Math.max(0, p)
    const rate = clamp(rPct, 0, 500) / 100
    const n = Math.round(clamp(m, 1, 600))
    const pmt = loanMonthlyPayment({ principal: principalVal, annualRate: rate, months: n })
    const total = pmt * n
    const interest = total - principalVal
    return { pmt, total, interest, n }
  }, [principal, annualRate, months])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label className="text-slate-200">Kredi Tutarı (₺)</Label>
          <Input
            value={principal}
            onChange={e => setPrincipal(e.target.value)}
            inputMode="decimal"
            className="bg-white/5 border-white/20 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-200">Yıllık Faiz (%)</Label>
          <Input
            value={annualRate}
            onChange={e => setAnnualRate(e.target.value)}
            inputMode="decimal"
            className="bg-white/5 border-white/20 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-200">Vade (ay)</Label>
          <Input
            value={months}
            onChange={e => setMonths(e.target.value)}
            inputMode="numeric"
            className="bg-white/5 border-white/20 text-white"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
          onClick={() => {
            setPrincipal('200000')
            setAnnualRate('55')
            setMonths('24')
          }}
        >
          Sıfırla
        </Button>
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
                <div className="text-xs text-slate-300">Aylık Taksit</div>
                <div className="text-xl font-bold text-white">
                  {formatCurrency(result.pmt, 'TRY')}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-300">Toplam Ödeme</div>
                <div className="text-xl font-bold text-white">
                  {formatCurrency(result.total, 'TRY')}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-300">Toplam Faiz</div>
                <div className="text-xl font-bold text-white">
                  {formatCurrency(result.interest, 'TRY')}
                </div>
              </div>
              <div className="sm:col-span-3 text-xs text-slate-400">
                Not: Bu hesap, standart “eşit taksit” (annuity) formülüyle yaklaşık sonuç verir.
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

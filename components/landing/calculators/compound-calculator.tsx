'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/validators'
import { clamp, compoundFutureValue, parseNumber } from '@/lib/finance-calculators'

export default function CompoundCalculator() {
  const [principal, setPrincipal] = useState('10000')
  const [annualRate, setAnnualRate] = useState('45')
  const [years, setYears] = useState('5')
  const [monthlyContribution, setMonthlyContribution] = useState('1000')

  const result = useMemo(() => {
    const p = parseNumber(principal)
    const rPct = parseNumber(annualRate)
    const y = parseNumber(years)
    const m = parseNumber(monthlyContribution)
    if (p === null || rPct === null || y === null) {
      return null
    }
    const rate = clamp(rPct, 0, 500) / 100
    const t = clamp(y, 0, 100)
    const monthly = m === null ? 0 : Math.max(0, m)
    const fv = compoundFutureValue({
      principal: Math.max(0, p),
      annualRate: rate,
      years: t,
      compoundsPerYear: 12,
      monthlyContribution: monthly,
    })
    const totalContrib = Math.max(0, p) + monthly * Math.round(t * 12)
    const gain = fv - totalContrib
    return { fv, totalContrib, gain }
  }, [principal, annualRate, years, monthlyContribution])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-slate-200">Başlangıç Birikim (₺)</Label>
          <Input
            value={principal}
            onChange={e => setPrincipal(e.target.value)}
            inputMode="decimal"
            className="bg-white/5 border-white/20 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-200">Aylık Katkı (₺)</Label>
          <Input
            value={monthlyContribution}
            onChange={e => setMonthlyContribution(e.target.value)}
            inputMode="decimal"
            className="bg-white/5 border-white/20 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-200">Yıllık Getiri (%)</Label>
          <Input
            value={annualRate}
            onChange={e => setAnnualRate(e.target.value)}
            inputMode="decimal"
            className="bg-white/5 border-white/20 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-200">Süre (yıl)</Label>
          <Input
            value={years}
            onChange={e => setYears(e.target.value)}
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
            setPrincipal('10000')
            setAnnualRate('45')
            setYears('5')
            setMonthlyContribution('1000')
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
                <div className="text-xs text-slate-300">Toplam Birikim</div>
                <div className="text-xl font-bold text-white">
                  {formatCurrency(result.fv, 'TRY')}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-300">Toplam Yatırılan</div>
                <div className="text-xl font-bold text-white">
                  {formatCurrency(result.totalContrib, 'TRY')}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-300">Kazanç</div>
                <div className="text-xl font-bold text-white">
                  {formatCurrency(result.gain, 'TRY')}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/mosaic'
import { Input } from '@/components/mosaic'
import { Label } from '@/components/mosaic'
import { Button } from '@/components/mosaic'
import { formatCurrency } from '@/lib/validators'
import {
  inflationRealValue,
  inflationRequiredNominal,
  parseNumber,
  clamp,
} from '@/lib/finance-calculators'

export default function InflationCalculator() {
  const [amount, setAmount] = useState('10000')
  const [inflation, setInflation] = useState('50')
  const [years, setYears] = useState('3')

  const result = useMemo(() => {
    const a = parseNumber(amount)
    const iPct = parseNumber(inflation)
    const y = parseNumber(years)
    if (a === null || iPct === null || y === null) {
      return null
    }
    const annual = clamp(iPct, 0, 500) / 100
    const t = clamp(y, 0, 100)
    const real = inflationRealValue(a, annual, t)
    const required = inflationRequiredNominal(a, annual, t)
    return { real, required, annual, t }
  }, [amount, inflation, years])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label className="text-slate-200">Bugünkü Tutar (₺)</Label>
          <Input
            value={amount}
            onChange={e => setAmount(e.target.value)}
            inputMode="decimal"
            className="bg-white/5 border-white/20 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-200">Yıllık Enflasyon (%)</Label>
          <Input
            value={inflation}
            onChange={e => setInflation(e.target.value)}
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
            setAmount('10000')
            setInflation('50')
            setYears('3')
          }}
        >
          Sıfırla
        </Button>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4 space-y-2">
          {!result ? (
            <div className="text-slate-300 text-sm">
              Geçerli değerler girince sonuçlar görünecek.
            </div>
          ) : (
            <>
              <div className="text-slate-200 text-sm">
                {result.t} yıl sonra bugünkü {formatCurrency(parseNumber(amount) ?? 0, 'TRY')}{' '}
                tutarın alım gücü:
              </div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(result.real, 'TRY')}
              </div>
              <div className="text-slate-300 text-sm">
                Aynı alım gücünü korumak için gereken nominal tutar:{' '}
                <span className="font-semibold text-white">
                  {formatCurrency(result.required, 'TRY')}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

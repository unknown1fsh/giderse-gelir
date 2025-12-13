'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/validators'
import { currencyConvert, parseNumber } from '@/lib/finance-calculators'

export default function CurrencyCalculator() {
  const [amount, setAmount] = useState('100')
  const [rate, setRate] = useState('32')
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('TRY')

  const result = useMemo(() => {
    const a = parseNumber(amount)
    const r = parseNumber(rate)
    if (a === null || r === null) {
      return null
    }
    const converted = currencyConvert(a, r)
    return { converted }
  }, [amount, rate])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-slate-200">Tutar</Label>
          <Input
            value={amount}
            onChange={e => setAmount(e.target.value)}
            inputMode="decimal"
            className="bg-white/5 border-white/20 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-200">
            Kur (1 {from} = ? {to})
          </Label>
          <Input
            value={rate}
            onChange={e => setRate(e.target.value)}
            inputMode="decimal"
            className="bg-white/5 border-white/20 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-200">Kaynak</Label>
          <Input
            value={from}
            onChange={e => setFrom(e.target.value.toUpperCase())}
            className="bg-white/5 border-white/20 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-200">Hedef</Label>
          <Input
            value={to}
            onChange={e => setTo(e.target.value.toUpperCase())}
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
            setAmount('100')
            setRate('32')
            setFrom('USD')
            setTo('TRY')
          }}
        >
          Sıfırla
        </Button>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4 space-y-1">
          {!result ? (
            <div className="text-slate-300 text-sm">
              Geçerli değerler girince sonuçlar görünecek.
            </div>
          ) : (
            <>
              <div className="text-slate-200 text-sm">
                {amount} {from} ≈
              </div>
              <div className="text-2xl font-bold text-white">
                {to === 'TRY'
                  ? formatCurrency(result.converted, 'TRY')
                  : `${result.converted.toFixed(2)} ${to}`}
              </div>
              <div className="text-xs text-slate-400">
                Not: Kur manuel girilir, API kullanılmaz.
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

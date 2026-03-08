'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/mosaic'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/mosaic'
import { Calculator } from 'lucide-react'
import InflationCalculator from '@/components/landing/calculators/inflation-calculator'
import CompoundCalculator from '@/components/landing/calculators/compound-calculator'
import LoanCalculator from '@/components/landing/calculators/loan-calculator'
import BudgetCalculator from '@/components/landing/calculators/budget-50-30-20'
import CurrencyCalculator from '@/components/landing/calculators/currency-converter'

type CalcId = 'inflation' | 'compound' | 'loan' | 'budget' | 'currency'

const items: { id: CalcId; title: string; description: string }[] = [
  {
    id: 'inflation',
    title: 'Enflasyon',
    description: 'Paranın alım gücü zamanla nasıl değişir?',
  },
  {
    id: 'compound',
    title: 'Bileşik Faiz',
    description: 'Birikim + düzenli katkı ile hedef hesabı',
  },
  {
    id: 'loan',
    title: 'Kredi Taksit',
    description: 'Aylık taksit ve toplam maliyet hesabı',
  },
  {
    id: 'budget',
    title: '50/30/20',
    description: 'Gelirinizi önerilen bütçeye bölün',
  },
  {
    id: 'currency',
    title: 'Kur Dönüşüm',
    description: 'Manuel kur ile hızlı dönüşüm',
  },
]

function RenderCalculator({ id }: { id: CalcId }) {
  switch (id) {
    case 'inflation':
      return <InflationCalculator />
    case 'compound':
      return <CompoundCalculator />
    case 'loan':
      return <LoanCalculator />
    case 'budget':
      return <BudgetCalculator />
    case 'currency':
      return <CurrencyCalculator />
  }
}

export default function LandingCalculators() {
  const defaultId = useMemo<CalcId>(() => 'inflation', [])
  const [active, setActive] = useState<CalcId>(defaultId)

  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="inline-flex p-2 rounded-lg bg-white/10 border border-white/20">
                <Calculator className="h-5 w-5 text-purple-300" />
              </span>
              Finans Araçları
            </CardTitle>
            <CardDescription className="text-slate-300">
              Hızlı hesap yapın: enflasyon, birikim, kredi, bütçe ve kur dönüşümü.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Desktop */}
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {items.map(it => {
                  const isActive = active === it.id
                  return (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => setActive(it.id)}
                      className={[
                        'shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-colors',
                        isActive
                          ? 'bg-white/15 border-white/30 text-white'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white',
                      ].join(' ')}
                    >
                      {it.title}
                    </button>
                  )
                })}
              </div>

              <div className="mt-4">
                <div className="mb-3 text-sm text-slate-300">
                  {items.find(it => it.id === active)?.description}
                </div>
                <RenderCalculator id={active} />
              </div>
            </div>

            {/* Mobile */}
            <div className="sm:hidden">
              <Accordion type="single" collapsible defaultValue={defaultId} className="text-white">
                {items.map(it => (
                  <AccordionItem key={it.id} value={it.id} className="border-white/10">
                    <AccordionTrigger className="text-white hover:no-underline">
                      <div className="text-left">
                        <div className="font-semibold">{it.title}</div>
                        <div className="text-xs text-slate-300">{it.description}</div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <RenderCalculator id={it.id} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

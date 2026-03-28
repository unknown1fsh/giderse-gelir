'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { Badge, Card, CardContent, Input } from '@/components/mosaic'
import type { GlobalSearchResultItem } from '@/lib/search'

type SearchResponse = Record<string, GlobalSearchResultItem[]>

const groupLabels: Record<string, string> = {
  transactions: 'İşlemler',
  accounts: 'Hesaplar',
  cards: 'Kartlar',
  goals: 'Hedefler',
  autoPayments: 'Otomatik Ödemeler',
}

export function GlobalOmnibox() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<SearchResponse>({
    transactions: [],
    accounts: [],
    cards: [],
    goals: [],
    autoPayments: [],
  })
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults({
        transactions: [],
        accounts: [],
        cards: [],
        goals: [],
        autoPayments: [],
      })
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&limit=4`, {
          credentials: 'include',
        })
        if (!response.ok) {
          throw new Error('Arama başarısız')
        }

        const data = (await response.json()) as SearchResponse
        setResults(data)
        setOpen(true)
      } catch (error) {
        console.error('Global search error:', error)
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => window.clearTimeout(timer)
  }, [query])

  const flatCount = useMemo(
    () => Object.values(results).reduce((sum, items) => sum + items.length, 0),
    [results]
  )

  const handleNavigate = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        value={query}
        onFocus={() => {
          if (flatCount > 0) {
            setOpen(true)
          }
        }}
        onChange={event => setQuery(event.target.value)}
        placeholder="İşlem, hesap, kart, hedef veya ödeme ara..."
        className="h-11 rounded-xl border-border/70 bg-muted/40 pl-10 pr-10 sm:pl-10 sm:pr-10 text-sm"
      />
      {loading ? (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : null}

      {open && query.trim() ? (
        <Card className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 border-border/80 shadow-2xl">
          <CardContent className="max-h-[28rem] overflow-y-auto p-3">
            {flatCount === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                Sonuç bulunamadı.
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(results).map(([groupKey, items]) => {
                  if (items.length === 0) {
                    return null
                  }

                  return (
                    <div key={groupKey} className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                          {groupLabels[groupKey] || groupKey}
                        </p>
                        <Badge variant="outline" className="text-[10px]">
                          {items.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {items.map(item => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleNavigate(item.href)}
                            className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-left transition hover:border-primary/40 hover:bg-muted/40"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {item.title}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {item.subtitle}
                                </p>
                              </div>
                              {item.meta ? (
                                <span className="shrink-0 text-[11px] text-muted-foreground">
                                  {item.meta}
                                </span>
                              ) : null}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

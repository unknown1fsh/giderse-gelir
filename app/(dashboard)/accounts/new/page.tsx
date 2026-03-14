'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AppPageShell,
  Button,
  Card,
  CardContent,
  FormField,
  Input,
  Select,
  import { redirect } from 'next/navigation'

  interface AccountsNewPageProps {
    searchParams?: {
      type?: string
    }
  }

  export default function AccountsNewPage({ searchParams }: AccountsNewPageProps) {
    const type = searchParams?.type

    if (type && ['bank', 'credit_card', 'gold'].includes(type)) {
      redirect(`/accounts?openNew=1&type=${type}`)
    }

    redirect('/accounts?openNew=1')
  }
                          {referansVeri?.goldPurities.map(p => (
                            <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      label="Ağırlık (gram)"
                      required
                      error={hatalar.agirlik}
                      hint="Eşyanızın gramaj miktarı"
                    >
                      <Input
                        type="number"
                        step="0.001"
                        min="0"
                        value={formVeri.agirlik}
                        onChange={e => guncelle('agirlik', e.target.value)}
                        placeholder="Ör: 14,50"
                        variant={hatalar.agirlik ? 'error' : 'default'}
                      />
                    </FormField>

                    <FormField
                      label="Alış Fiyatı (₺)"
                      required
                      error={hatalar.alisFiyati}
                      hint="Aldığınız andaki toplam ödeme"
                    >
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formVeri.alisFiyati}
                        onChange={e => guncelle('alisFiyati', e.target.value)}
                        placeholder="Ör: 45.000,00"
                        variant={hatalar.alisFiyati ? 'error' : 'default'}
                      />
                    </FormField>
                  </div>

                  {/* Bilgi kartı */}
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 p-4">
                    <p className="mb-1 text-xs font-semibold text-amber-300">Güncel değer takibi</p>
                    <p className="text-sm text-muted-foreground">
                      Güncel TRY karşılığı, gram altın fiyatlarına göre otomatik olarak hesaplanır
                      ve portföyünüzde görüntülenir.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Eylem butonları ──────────────────────────────────── */}
              <div className="flex flex-col-reverse gap-3 border-t border-border/50 pt-5 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={kaydediliyor}
                >
                  Vazgeç
                </Button>
                <Button
                  type="submit"
                  variant="glow"
                  loading={kaydediliyor}
                >
                  {!kaydediliyor && (
                    hesapTuru === 'bank' ? 'Hesabı Kaydet' :
                    hesapTuru === 'credit_card' ? 'Kartı Kaydet' :
                    'Altını Kaydet'
                  )}
                </Button>
              </div>

            </CardContent>
          </Card>
        </form>
      </div>
    </AppPageShell>
  )
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default function YeniHesapSayfasi() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    }>
      <YeniHesapFormu />
    </Suspense>
  )
}

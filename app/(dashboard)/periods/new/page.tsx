'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePeriod } from '@/lib/period-context'
import { calculatePeriodDates, getPeriodTypeLabel } from '@/lib/period-helpers'
import {
  AppPageShell,
  Button,
  Card,
  CardContent,
  FormField,
  Input,
  Textarea,
} from '@/components/mosaic'
import { Calendar, CheckCircle2, ChevronRight, AlertTriangle, Info } from 'lucide-react'

type PeriodType = 'YEARLY' | 'FISCAL_YEAR' | 'MONTHLY' | 'CUSTOM'

const DONEM_TURLERI: { deger: PeriodType; etiket: string; aciklama: string }[] = [
  {
    deger: 'YEARLY',
    etiket: 'Yıllık Dönem',
    aciklama: 'Takvim yılı: 1 Ocak – 31 Aralık',
  },
  {
    deger: 'FISCAL_YEAR',
    etiket: 'Mali Yıl',
    aciklama: 'Özelleştirilebilir başlangıç tarihli mali yıl',
  },
  {
    deger: 'MONTHLY',
    etiket: 'Aylık Dönem',
    aciklama: 'Tek bir aylık dönem',
  },
  {
    deger: 'CUSTOM',
    etiket: 'Özel Dönem',
    aciklama: 'Başlangıç ve bitiş tarihlerini siz belirleyin',
  },
]

export default function YeniDonemSayfasi() {
  const router = useRouter()
  const { createPeriod, periods } = usePeriod()

  const [adim, setAdim] = useState<1 | 2>(1)
  const [donemTuru, setDonemTuru] = useState<PeriodType>('YEARLY')
  const [ad, setAd] = useState('')
  const [baslangic, setBaslangic] = useState('')
  const [bitis, setBitis] = useState('')
  const [aciklama, setAciklama] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)
  const [hata, setHata] = useState<string | null>(null)
  const [mevcutGoster, setMevcutGoster] = useState(false)

  const donemTuruSec = (tur: PeriodType) => {
    setDonemTuru(tur)
    if (tur !== 'CUSTOM') {
      const tarihler = calculatePeriodDates(tur)
      setBaslangic(tarihler.start.toISOString().split('T')[0])
      setBitis(tarihler.end.toISOString().split('T')[0])
      const simdi = new Date()
      switch (tur) {
        case 'YEARLY':
          setAd(`${simdi.getFullYear()} Yılı`)
          break
        case 'FISCAL_YEAR':
          setAd(`${simdi.getFullYear()}–${simdi.getFullYear() + 1} Mali Yılı`)
          break
        case 'MONTHLY':
          setAd(simdi.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }))
          break
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!ad.trim()) {
      setHata('Dönem adı zorunludur')
      return
    }
    if (!baslangic || !bitis) {
      setHata('Başlangıç ve bitiş tarihleri zorunludur')
      return
    }
    if (new Date(baslangic) >= new Date(bitis)) {
      setHata('Başlangıç tarihi bitiş tarihinden önce olmalıdır')
      return
    }

    setYukleniyor(true)
    setHata(null)

    try {
      const sonuc = await createPeriod({
        name: ad.trim(),
        periodType: donemTuru,
        startDate: new Date(baslangic),
        endDate: new Date(bitis),
        description: aciklama.trim() || undefined,
      })

      if (sonuc.success) {
        setTimeout(() => router.push('/periods'), 800)
        setHata('success')
      } else {
        setHata(sonuc.error || 'Dönem oluşturulamadı')
      }
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu')
    } finally {
      setYukleniyor(false)
    }
  }

  return (
    <AppPageShell
      header={{
        title: 'Yeni Dönem',
        description: 'Gelir ve giderlerinizi takip etmek için dönem oluşturun',
        onBack: () => router.back(),
      }}
    >
      <div className="max-w-2xl space-y-6">
        {/* Adım Göstergesi */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            adim >= 1 ? 'bg-primary/15 text-primary' : 'bg-muted/30 text-muted-foreground'
          }`}>
            {adim > 1 ? <CheckCircle2 className="h-4 w-4" /> : <span className="h-4 w-4 rounded-full bg-primary text-[10px] text-white flex items-center justify-center font-bold">1</span>}
            Dönem Türü
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            adim >= 2 ? 'bg-primary/15 text-primary' : 'bg-muted/30 text-muted-foreground'
          }`}>
            <span className={`h-4 w-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
              adim >= 2 ? 'bg-primary text-white' : 'bg-muted-foreground/30 text-muted-foreground'
            }`}>2</span>
            Dönem Bilgileri
          </div>
        </div>

        {/* Mevcut Dönemler Uyarısı */}
        {periods.length > 0 && (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/8 p-4">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {periods.length} mevcut dönem bulunuyor
                </p>
                <button
                  type="button"
                  onClick={() => setMevcutGoster(!mevcutGoster)}
                  className="mt-1 text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  {mevcutGoster ? 'Gizle' : 'Mevcut dönemleri göster'}
                </button>
                {mevcutGoster && (
                  <div className="mt-3 space-y-1.5">
                    {periods.map(p => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 text-xs">
                        <span className="font-medium truncate">{p.name}</span>
                        <span className="shrink-0 ml-2 text-muted-foreground">
                          {new Date(p.startDate).toLocaleDateString('tr-TR')} – {new Date(p.endDate).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={e => void handleSubmit(e)}>
          {/* Adım 1: Dönem Türü */}
          {adim === 1 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Dönem Türünü Seçin
                  </h2>
                </div>

                <div className="space-y-2">
                  {DONEM_TURLERI.map(tur => {
                    const secili = donemTuru === tur.deger
                    return (
                      <button
                        key={tur.deger}
                        type="button"
                        onClick={() => donemTuruSec(tur.deger)}
                        className={`w-full flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                          secili
                            ? 'border-primary bg-primary/8'
                            : 'border-border/60 bg-muted/10 hover:border-border hover:bg-muted/20'
                        }`}
                      >
                        <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                          secili ? 'border-primary bg-primary' : 'border-muted-foreground'
                        }`}>
                          {secili && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className={`font-medium text-sm ${secili ? 'text-primary' : 'text-foreground'}`}>
                            {tur.etiket}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{tur.aciklama}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="button" variant="glow" onClick={() => setAdim(2)}>
                    Devam Et
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Adım 2: Dönem Bilgileri */}
          {adim === 2 && (
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Dönem Bilgileri
                  </h2>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {getPeriodTypeLabel(donemTuru)}
                  </span>
                </div>

                <FormField label="Dönem Adı" required htmlFor="ad">
                  <Input
                    id="ad"
                    value={ad}
                    onChange={e => setAd(e.target.value)}
                    placeholder="Örn: 2025 Yılı, Ocak 2025"
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Başlangıç Tarihi" required htmlFor="baslangic">
                    <Input
                      id="baslangic"
                      type="date"
                      value={baslangic}
                      onChange={e => setBaslangic(e.target.value)}
                    />
                  </FormField>

                  <FormField label="Bitiş Tarihi" required htmlFor="bitis">
                    <Input
                      id="bitis"
                      type="date"
                      value={bitis}
                      onChange={e => setBitis(e.target.value)}
                    />
                  </FormField>
                </div>

                <FormField label="Açıklama" hint="İsteğe bağlı notlar" htmlFor="aciklama">
                  <Textarea
                    id="aciklama"
                    value={aciklama}
                    onChange={e => setAciklama(e.target.value)}
                    placeholder="Bu dönem hakkında notlar ekleyin..."
                    rows={2}
                  />
                </FormField>

                {/* Hata / Başarı mesajı */}
                {hata && hata !== 'success' && (
                  <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                    hata.includes('zaten bir dönem')
                      ? 'border-amber-500/20 bg-amber-500/8'
                      : 'border-destructive/20 bg-destructive/8'
                  }`}>
                    <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${
                      hata.includes('zaten bir dönem') ? 'text-amber-400' : 'text-destructive'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{hata}</p>
                      {hata.includes('zaten bir dönem') && (
                        <div className="mt-2 flex gap-2">
                          <Link
                            href="/periods"
                            className="text-xs underline text-amber-400 hover:text-amber-300"
                          >
                            Mevcut dönemleri görüntüle
                          </Link>
                          <button
                            type="button"
                            onClick={() => setHata(null)}
                            className="text-xs underline text-muted-foreground hover:text-foreground"
                          >
                            Tarihleri değiştir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {hata === 'success' && (
                  <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/8 px-4 py-3">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <p className="text-sm text-green-400">Dönem başarıyla oluşturuldu. Yönlendiriliyorsunuz...</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setAdim(1)}
                    disabled={yukleniyor}
                  >
                    Geri
                  </Button>
                  <Button
                    type="submit"
                    variant="glow"
                    className="flex-1"
                    loading={yukleniyor}
                    disabled={yukleniyor}
                  >
                    Dönem Oluştur
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>

        {/* Bilgi Notu */}
        <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/10 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Dönemler, gelir ve giderlerinizi belirli zaman aralıklarında organize etmenizi sağlar.
            Dönem kapanışında bakiyelerinizi yeni döneme devredebilirsiniz.
          </p>
        </div>
      </div>
    </AppPageShell>
  )
}

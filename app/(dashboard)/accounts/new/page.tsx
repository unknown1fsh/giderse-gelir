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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from '@/components/mosaic'
import { useToast } from '@/lib/use-toast'
import { cn } from '@/lib/utils'
import {
  Building2,
  CheckCircle2,
  Coins,
  CreditCard,
  Info,
  Wallet,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReferenceData {
  banks: Array<{ id: number; name: string; asciiName: string }>
  accountTypes: Array<{ id: number; code: string; name: string; description?: string | null }>
  goldTypes: Array<{ id: number; code: string; name: string; description?: string | null }>
  goldPurities: Array<{ id: number; code: string; name: string; purity: string }>
  currencies: Array<{ id: number; code: string; name: string; symbol: string }>
}

type HesapTuru = 'bank' | 'credit_card' | 'gold'

// ─── Tip seçici kartları ──────────────────────────────────────────────────────

const HESAP_TURLERI: Array<{
  id: HesapTuru
  baslik: string
  aciklama: string
  detay: string
  icon: React.ElementType
  renk: string
  seciliRenk: string
  ikonRenk: string
}> = [
  {
    id: 'bank',
    baslik: 'Banka Hesabı',
    aciklama: 'Vadesiz, vadeli veya nakit hesap',
    detay: 'Bakiye, IBAN ve hesap numarası takibi yapabilirsiniz.',
    icon: Building2,
    renk: 'border-border/60 hover:border-blue-500/50 hover:bg-blue-500/5',
    seciliRenk: 'border-blue-500 bg-blue-500/10',
    ikonRenk: 'bg-blue-500/15 text-blue-400',
  },
  {
    id: 'credit_card',
    baslik: 'Kredi Kartı',
    aciklama: 'Limit, ekstre ve ödeme tarihi',
    detay: 'Borç, kullanılabilir limit ve ödeme takvimini takip edebilirsiniz.',
    icon: CreditCard,
    renk: 'border-border/60 hover:border-purple-500/50 hover:bg-purple-500/5',
    seciliRenk: 'border-purple-500 bg-purple-500/10',
    ikonRenk: 'bg-purple-500/15 text-purple-400',
  },
  {
    id: 'gold',
    baslik: 'Altın & Ziynet',
    aciklama: 'Değerli maden ve ziynet eşyası',
    detay: 'Gram, ayar ve güncel TRY karşılığını otomatik takip edebilirsiniz.',
    icon: Coins,
    renk: 'border-border/60 hover:border-amber-500/50 hover:bg-amber-500/5',
    seciliRenk: 'border-amber-500 bg-amber-500/10',
    ikonRenk: 'bg-amber-500/15 text-amber-400',
  },
]

// ─── Form bölümü başlığı ──────────────────────────────────────────────────────

function BolumBasligi({
  icon: Icon,
  baslik,
  aciklama,
}: {
  icon: React.ElementType
  baslik: string
  aciklama?: string
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
      <div className="rounded-lg bg-muted p-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{baslik}</p>
        {aciklama && <p className="text-xs text-muted-foreground">{aciklama}</p>}
      </div>
    </div>
  )
}

// ─── Ana form ─────────────────────────────────────────────────────────────────

function YeniHesapFormu() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { error: toastError, success: toastSuccess } = useToast()

  const [referansVeri, setReferansVeri] = useState<ReferenceData | null>(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [hatalar, setHatalar] = useState<Record<string, string>>({})

  const typeParam = searchParams.get('type')
  const [hesapTuru, setHesapTuru] = useState<HesapTuru>(
    typeParam === 'credit_card' ? 'credit_card' : typeParam === 'gold' ? 'gold' : 'bank'
  )

  const [formVeri, setFormVeri] = useState({
    ad: '',
    bankaId: '',
    hesapTuruId: '',
    paraBirimiId: '',
    bakiye: '',
    hesapNumarasi: '',
    iban: '',
    limitTutari: '',
    ekstre_gun: '',
    odeme_gun: '',
    altinTuruId: '',
    altinAyarId: '',
    agirlik: '',
    alisFiyati: '',
  })

  useEffect(() => {
    fetch(`/api/reference-data?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((veri: ReferenceData) => {
        setReferansVeri(veri)
        const try_ = veri.currencies.find(c => c.code === 'TRY')
        if (try_) {setFormVeri(prev => ({ ...prev, paraBirimiId: String(try_.id) }))}
      })
      .catch(() => toastError('Hata', 'Referans veriler yüklenemedi'))
      .finally(() => setYukleniyor(false))
  }, [toastError])

  const guncelle = (alan: string, deger: string) => {
    setFormVeri(prev => ({ ...prev, [alan]: deger }))
    if (hatalar[alan]) {setHatalar(prev => { const y = { ...prev }; delete y[alan]; return y })}
  }

  const dogrula = (): boolean => {
    const yeniHatalar: Record<string, string> = {}

    if (!formVeri.ad.trim()) {yeniHatalar.ad = 'Ad alanı zorunludur'}

    if (hesapTuru === 'bank') {
      if (!formVeri.bankaId) {yeniHatalar.bankaId = 'Banka seçimi zorunludur'}
      if (!formVeri.hesapTuruId) {yeniHatalar.hesapTuruId = 'Hesap türü seçimi zorunludur'}
      if (!formVeri.paraBirimiId) {yeniHatalar.paraBirimiId = 'Para birimi seçimi zorunludur'}
    }

    if (hesapTuru === 'credit_card') {
      if (!formVeri.bankaId) {yeniHatalar.bankaId = 'Banka seçimi zorunludur'}
      if (!formVeri.paraBirimiId) {yeniHatalar.paraBirimiId = 'Para birimi seçimi zorunludur'}
      if (!formVeri.limitTutari || parseFloat(formVeri.limitTutari) <= 0)
        {yeniHatalar.limitTutari = 'Geçerli bir limit tutarı giriniz'}
      if (!formVeri.odeme_gun)
        {yeniHatalar.odeme_gun = 'Son ödeme günü zorunludur'}
    }

    if (hesapTuru === 'gold') {
      if (!formVeri.altinTuruId) {yeniHatalar.altinTuruId = 'Altın türü seçimi zorunludur'}
      if (!formVeri.altinAyarId) {yeniHatalar.altinAyarId = 'Ayar seçimi zorunludur'}
      if (!formVeri.agirlik || parseFloat(formVeri.agirlik) <= 0)
        {yeniHatalar.agirlik = 'Geçerli bir ağırlık giriniz'}
      if (!formVeri.alisFiyati || parseFloat(formVeri.alisFiyati) <= 0)
        {yeniHatalar.alisFiyati = 'Geçerli bir alış fiyatı giriniz'}
    }

    setHatalar(yeniHatalar)
    return Object.keys(yeniHatalar).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dogrula()) {return}
    setKaydediliyor(true)

    try {
      const gonderiVeri = {
        accountType: hesapTuru,
        name: formVeri.ad.trim(),
        bankId: formVeri.bankaId ? parseInt(formVeri.bankaId) : 0,
        accountTypeId: formVeri.hesapTuruId ? parseInt(formVeri.hesapTuruId) : 0,
        currencyId: formVeri.paraBirimiId ? parseInt(formVeri.paraBirimiId) : 0,
        balance: parseFloat(formVeri.bakiye) || 0,
        accountNumber: formVeri.hesapNumarasi || null,
        iban: formVeri.iban ? `TR${formVeri.iban.replace(/\s/g, '')}` : null,
        limitAmount: parseFloat(formVeri.limitTutari) || 0,
        dueDay: formVeri.odeme_gun ? parseInt(formVeri.odeme_gun) : 1,
        goldTypeId: formVeri.altinTuruId ? parseInt(formVeri.altinTuruId) : 0,
        goldPurityId: formVeri.altinAyarId ? parseInt(formVeri.altinAyarId) : 0,
        weight: parseFloat(formVeri.agirlik) || 0,
        purchasePrice: parseFloat(formVeri.alisFiyati) || 0,
      }

      const yanit = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gonderiVeri),
      })

      if (yanit.ok) {
        toastSuccess('Başarılı', 'Hesap başarıyla eklendi')
        router.push('/accounts')
      } else {
        const hata = (await yanit.json()) as { error?: string }
        toastError('Hata', hata.error || 'Hesap kaydedilemedi')
      }
    } catch {
      toastError('Hata', 'Beklenmedik bir hata oluştu')
    } finally {
      setKaydediliyor(false)
    }
  }

  if (yukleniyor) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-sm text-muted-foreground">Veriler yükleniyor...</p>
        </div>
      </div>
    )
  }

  const seciliTur = HESAP_TURLERI.find(t => t.id === hesapTuru)!

  return (
    <AppPageShell
      header={{
        title: 'Yeni Varlık Ekle',
        description: 'Banka hesabı, kredi kartı veya altın eşyası ekleyin',
        onBack: () => router.back(),
      }}
    >
      <div className="mx-auto max-w-2xl space-y-6">

        {/* ── Hesap türü seçici ──────────────────────────────────────── */}
        <Card className="border-border/70 bg-card/95">
          <CardContent className="p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Varlık türünü seçin
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {HESAP_TURLERI.map(tur => {
                const secili = hesapTuru === tur.id
                return (
                  <button
                    key={tur.id}
                    type="button"
                    onClick={() => {
                      setHesapTuru(tur.id)
                      setHatalar({})
                    }}
                    className={cn(
                      'relative flex flex-col gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 hover:-translate-y-0.5',
                      secili ? tur.seciliRenk : tur.renk
                    )}
                  >
                    {secili && (
                      <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-foreground/60" />
                    )}
                    <div className={cn('w-fit rounded-lg p-2', tur.ikonRenk)}>
                      <tur.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{tur.baslik}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{tur.aciklama}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Bilgi notu */}
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-border/50 bg-muted/30 p-3.5">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{seciliTur.detay}</p>
            </div>
          </CardContent>
        </Card>

        {/* ── Form ───────────────────────────────────────────────────── */}
        <form onSubmit={e => void handleSubmit(e)}>
          <Card className="border-border/70 bg-card/95">
            <CardContent className="space-y-6 p-5 pt-5">

              {/* ── Ortak: Ad ───────────────────────────────────────── */}
              <div className="space-y-5">
                <BolumBasligi
                  icon={Wallet}
                  baslik="Temel Bilgiler"
                  aciklama="Varlığınızı tanımlamanıza yardımcı olacak bilgiler"
                />
                <FormField
                  label={
                    hesapTuru === 'bank' ? 'Hesap Adı' :
                    hesapTuru === 'credit_card' ? 'Kart Adı' :
                    'Eşya Adı'
                  }
                  required
                  error={hatalar.ad}
                  hint={
                    hesapTuru === 'bank' ? 'Örn: Ziraat Bankası Vadesiz, Garanti Maaş Hesabı' :
                    hesapTuru === 'credit_card' ? 'Örn: Akbank Axess, Yapı Kredi World' :
                    'Örn: 22 Ayar Altın Bilezik, Cumhuriyet Altını'
                  }
                >
                  <Input
                    value={formVeri.ad}
                    onChange={e => guncelle('ad', e.target.value)}
                    placeholder={
                      hesapTuru === 'bank' ? 'Hesap adını yazın' :
                      hesapTuru === 'credit_card' ? 'Kart adını yazın' :
                      'Eşya adını yazın'
                    }
                    variant={hatalar.ad ? 'error' : 'default'}
                  />
                </FormField>
              </div>

              {/* ── Banka Hesabı Alanları ────────────────────────────── */}
              {hesapTuru === 'bank' && (
                <div className="space-y-5">
                  <BolumBasligi
                    icon={Building2}
                    baslik="Banka & Hesap Bilgileri"
                    aciklama="Hesabınızın bulunduğu banka ve hesap detayları"
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Banka" required error={hatalar.bankaId}>
                      <Select
                        value={formVeri.bankaId}
                        onValueChange={v => guncelle('bankaId', v)}
                      >
                        <SelectTrigger className={hatalar.bankaId ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Banka seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {referansVeri?.banks.map(b => (
                            <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Hesap Türü" required error={hatalar.hesapTuruId}>
                      <Select
                        value={formVeri.hesapTuruId}
                        onValueChange={v => guncelle('hesapTuruId', v)}
                      >
                        <SelectTrigger className={hatalar.hesapTuruId ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Hesap türü seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {referansVeri?.accountTypes.map(t => (
                            <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Para Birimi" required error={hatalar.paraBirimiId}>
                      <Select
                        value={formVeri.paraBirimiId}
                        onValueChange={v => guncelle('paraBirimiId', v)}
                      >
                        <SelectTrigger className={hatalar.paraBirimiId ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Para birimi seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {referansVeri?.currencies.map(c => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.code} — {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField
                      label="Mevcut Bakiye"
                      hint="Hesabınızdaki güncel bakiye"
                    >
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formVeri.bakiye}
                        onChange={e => guncelle('bakiye', e.target.value)}
                        placeholder="0,00"
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      label="Hesap Numarası"
                      hint="İsteğe bağlı"
                    >
                      <Input
                        value={formVeri.hesapNumarasi}
                        onChange={e => guncelle('hesapNumarasi', e.target.value)}
                        placeholder="Hesap numarasını girin"
                      />
                    </FormField>

                    <FormField
                      label="IBAN"
                      hint="TR ile başlayan 26 rakamlı numara"
                    >
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-muted-foreground">
                          TR
                        </span>
                        <Input
                          value={formVeri.iban}
                          onChange={e => {
                            const deger = e.target.value.replace(/[^0-9\s]/g, '').substring(0, 26)
                            guncelle('iban', deger)
                          }}
                          placeholder="00 0000 0000 0000 0000 0000 00"
                          className="pl-10 sm:pl-10"
                          maxLength={26}
                        />
                      </div>
                    </FormField>
                  </div>
                </div>
              )}

              {/* ── Kredi Kartı Alanları ─────────────────────────────── */}
              {hesapTuru === 'credit_card' && (
                <div className="space-y-5">
                  <BolumBasligi
                    icon={CreditCard}
                    baslik="Kart Bilgileri"
                    aciklama="Kredi kartınızın limit ve ödeme detayları"
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Banka" required error={hatalar.bankaId}>
                      <Select
                        value={formVeri.bankaId}
                        onValueChange={v => guncelle('bankaId', v)}
                      >
                        <SelectTrigger className={hatalar.bankaId ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Banka seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {referansVeri?.banks.map(b => (
                            <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Para Birimi" required error={hatalar.paraBirimiId}>
                      <Select
                        value={formVeri.paraBirimiId}
                        onValueChange={v => guncelle('paraBirimiId', v)}
                      >
                        <SelectTrigger className={hatalar.paraBirimiId ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Para birimi seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {referansVeri?.currencies.map(c => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.code} — {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      label="Kredi Limiti"
                      required
                      error={hatalar.limitTutari}
                      hint="Kartınızın toplam harcama limiti"
                    >
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formVeri.limitTutari}
                        onChange={e => guncelle('limitTutari', e.target.value)}
                        placeholder="Ör: 50.000,00"
                        variant={hatalar.limitTutari ? 'error' : 'default'}
                      />
                    </FormField>

                    <FormField
                      label="Son Ödeme Günü"
                      required
                      error={hatalar.odeme_gun}
                      hint="Her ayın kaçında ödeme yapıyorsunuz"
                    >
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        value={formVeri.odeme_gun}
                        onChange={e => guncelle('odeme_gun', e.target.value)}
                        placeholder="Ör: 15"
                        variant={hatalar.odeme_gun ? 'error' : 'default'}
                      />
                    </FormField>
                  </div>

                  {/* Bilgi kartı */}
                  <div className="rounded-xl border border-purple-500/20 bg-purple-500/8 p-4">
                    <p className="mb-1 text-xs font-semibold text-purple-300">Kullanılabilir limit</p>
                    <p className="text-sm text-muted-foreground">
                      Kart eklendiğinde kullanılabilir limit, toplam limite eşit başlar.
                      Harcama işlemleri kaydettikçe otomatik güncellenir.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Altın Alanları ───────────────────────────────────── */}
              {hesapTuru === 'gold' && (
                <div className="space-y-5">
                  <BolumBasligi
                    icon={Coins}
                    baslik="Altın & Ziynet Bilgileri"
                    aciklama="Eşyanızın türü, ayarı ve ağırlık detayları"
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Altın Türü" required error={hatalar.altinTuruId}
                      hint="Bilezik, kolye, küpe, cumhuriyet altını vb.">
                      <Select
                        value={formVeri.altinTuruId}
                        onValueChange={v => guncelle('altinTuruId', v)}
                      >
                        <SelectTrigger className={hatalar.altinTuruId ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Altın türü seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {referansVeri?.goldTypes.map(t => (
                            <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Ayar" required error={hatalar.altinAyarId}
                      hint="24K (saf), 22K (cumhuriyet), 18K, 14K, 8K">
                      <Select
                        value={formVeri.altinAyarId}
                        onValueChange={v => guncelle('altinAyarId', v)}
                      >
                        <SelectTrigger className={hatalar.altinAyarId ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Ayar seçin" />
                        </SelectTrigger>
                        <SelectContent>
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

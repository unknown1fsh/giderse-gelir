'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
} from '@/components/mosaic'
import { CreditCard, Calculator, AlertTriangle, Info } from 'lucide-react'
import { useToast } from '@/lib/use-toast'

interface ReferenceData {
  banks: Array<{ id: number; name: string }>
  currencies: Array<{ id: number; code: string; name: string }>
}

const KREDI_TURLERI = [
  { deger: 'PERSONAL', etiket: 'İhtiyaç Kredisi' },
  { deger: 'HOUSING', etiket: 'Konut Kredisi' },
  { deger: 'VEHICLE', etiket: 'Taşıt Kredisi' },
  { deger: 'CREDIT_CARD', etiket: 'Kredi Kartı Borcu' },
  { deger: 'OTHER', etiket: 'Diğer' },
]

export default function YeniKrediSayfasi() {
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useToast()
  const [refData, setRefData] = useState<ReferenceData | null>(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [hatalar, setHatalar] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    ad: '',
    bankaId: '',
    krediTuru: 'PERSONAL',
    toplamTutar: '',
    taksitSayisi: '',
    kalanTaksit: '',
    faizOrani: '',
    odemeGunu: '15',
    paraBirimiId: '',
    baslangicTarihi: new Date().toISOString().split('T')[0],
    kurgusal: false,
  })

  useEffect(() => {
    async function veriGetir() {
      try {
        const res = await fetch('/api/reference-data')
        if (res.ok) {
          const veri = (await res.json()) as ReferenceData
          setRefData(veri)
          const try_ = veri.currencies.find(c => c.code === 'TRY')
          if (try_) {setForm(f => ({ ...f, paraBirimiId: String(try_.id) }))}
        }
      } catch {
        // sessizce devam
      } finally {
        setYukleniyor(false)
      }
    }
    void veriGetir()
  }, [])

  const guncelle = (alan: string, deger: string | boolean) => {
    setForm(f => ({ ...f, [alan]: deger }))
    if (typeof deger === 'string' && hatalar[alan]) {setHatalar(h => ({ ...h, [alan]: '' }))}
  }

  // Aylık ödeme hesaplama
  const aylikOdeme = (() => {
    const toplam = Number(form.toplamTutar)
    const sayi = Number(form.taksitSayisi)
    const faiz = Number(form.faizOrani)
    if (!toplam || !sayi || sayi <= 0) {return 0}
    if (!faiz || faiz === 0) {return toplam / sayi}
    const aylikFaiz = faiz / 100 / 12
    const pay = aylikFaiz * Math.pow(1 + aylikFaiz, sayi)
    const payda = Math.pow(1 + aylikFaiz, sayi) - 1
    return toplam * (pay / payda)
  })()

  const secilenPara = refData?.currencies.find(c => c.id === parseInt(form.paraBirimiId))

  const dogrula = () => {
    const yeni: Record<string, string> = {}
    if (!form.ad.trim()) {yeni.ad = 'Kredi adı zorunludur'}
    if (!form.bankaId) {yeni.bankaId = 'Banka seçimi zorunludur'}
    if (!form.paraBirimiId) {yeni.paraBirimiId = 'Para birimi seçimi zorunludur'}
    if (!form.toplamTutar || Number(form.toplamTutar) <= 0) {yeni.toplamTutar = 'Geçerli bir tutar girin'}
    if (!form.taksitSayisi || Number(form.taksitSayisi) <= 0) {yeni.taksitSayisi = 'Geçerli bir taksit sayısı girin'}
    const gun = Number(form.odemeGunu)
    if (!form.odemeGunu || gun < 1 || gun > 31) {yeni.odemeGunu = 'Ödeme günü 1-31 arasında olmalıdır'}
    setHatalar(yeni)
    return Object.keys(yeni).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dogrula()) {return}
    setKaydediliyor(true)
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.ad,
          bankId: parseInt(form.bankaId),
          loanType: form.krediTuru,
          totalAmount: Number(form.toplamTutar),
          installmentCount: Number(form.taksitSayisi),
          remainingInstallments: form.kalanTaksit ? Number(form.kalanTaksit) : Number(form.taksitSayisi),
          interestRate: form.faizOrani ? Number(form.faizOrani) : null,
          paymentDay: Number(form.odemeGunu),
          currencyId: parseInt(form.paraBirimiId),
          startDate: form.baslangicTarihi,
          isFictional: form.kurgusal,
        }),
      })
      if (res.ok) {
        toastSuccess('Başarılı', 'Kredi başarıyla eklendi')
        router.push('/loans')
      } else {
        const hata = (await res.json()) as { error?: string }
        toastError('Hata', hata.error || 'Kredi eklenemedi')
      }
    } catch {
      toastError('Hata', 'Kredi eklenirken hata oluştu')
    } finally {
      setKaydediliyor(false)
    }
  }

  return (
    <AppPageShell
      header={{
        title: 'Yeni Kredi',
        description: 'Banka kredisi veya borç takibini başlatın',
        onBack: () => router.back(),
      }}
    >
      <div className="max-w-2xl">
        <form onSubmit={e => void handleSubmit(e)} className="space-y-6">
          {/* Temel Bilgiler */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <CreditCard className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Kredi Bilgileri
                </h2>
              </div>

              <FormField label="Kredi Adı" required error={hatalar.ad} htmlFor="ad">
                <Input
                  id="ad"
                  value={form.ad}
                  onChange={e => guncelle('ad', e.target.value)}
                  placeholder="Konut Kredisi, Taşıt Kredisi, Garanti Borç..."
                  variant={hatalar.ad ? 'error' : 'default'}
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Banka" required error={hatalar.bankaId} htmlFor="banka">
                  <Select
                    value={form.bankaId}
                    onValueChange={v => guncelle('bankaId', v)}
                    disabled={yukleniyor}
                  >
                    <SelectTrigger id="banka" className={hatalar.bankaId ? 'border-destructive' : ''}>
                      <SelectValue placeholder={yukleniyor ? 'Yükleniyor...' : 'Banka seçin'} />
                    </SelectTrigger>
                    <SelectContent>
                      {refData?.banks.map(b => (
                        <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Kredi Türü" required htmlFor="krediTuru">
                  <Select
                    value={form.krediTuru}
                    onValueChange={v => guncelle('krediTuru', v)}
                  >
                    <SelectTrigger id="krediTuru">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KREDI_TURLERI.map(t => (
                        <SelectItem key={t.deger} value={t.deger}>{t.etiket}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              {/* Kurgusal Kredi */}
              <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-border/60 bg-muted/20 p-4 hover:bg-muted/40 transition-colors">
                <input
                  type="checkbox"
                  checked={form.kurgusal}
                  onChange={e => guncelle('kurgusal', e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                />
                <div>
                  <p className="text-sm font-medium">Kurgu / Planlama Kredisi</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    İşaretlenirse aylık ödeme nakit bakiyenizden otomatik düşülür (gerçek ödeme değil)
                  </p>
                </div>
              </label>

              {form.kurgusal && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <p className="text-sm text-muted-foreground">
                    Kurgu kredi olarak eklenen kayıt, planlama amaçlıdır ve nakit bakiyenizi etkiler.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Finansal Detaylar */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <span className="text-base font-bold text-primary">₺</span>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Finansal Detaylar
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Toplam Borç Tutarı"
                  required
                  error={hatalar.toplamTutar}
                  htmlFor="toplamTutar"
                >
                  <Input
                    id="toplamTutar"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.toplamTutar}
                    onChange={e => guncelle('toplamTutar', e.target.value)}
                    placeholder="150000"
                    variant={hatalar.toplamTutar ? 'error' : 'default'}
                  />
                </FormField>

                <FormField label="Para Birimi" required error={hatalar.paraBirimiId} htmlFor="paraBirimi">
                  <Select
                    value={form.paraBirimiId}
                    onValueChange={v => guncelle('paraBirimiId', v)}
                    disabled={yukleniyor}
                  >
                    <SelectTrigger id="paraBirimi" className={hatalar.paraBirimiId ? 'border-destructive' : ''}>
                      <SelectValue placeholder={yukleniyor ? 'Yükleniyor...' : 'Para birimi seçin'} />
                    </SelectTrigger>
                    <SelectContent>
                      {refData?.currencies.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.code} — {c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  label="Toplam Taksit Sayısı"
                  required
                  error={hatalar.taksitSayisi}
                  htmlFor="taksitSayisi"
                >
                  <Input
                    id="taksitSayisi"
                    type="number"
                    min="1"
                    value={form.taksitSayisi}
                    onChange={e => guncelle('taksitSayisi', e.target.value)}
                    placeholder="36"
                    variant={hatalar.taksitSayisi ? 'error' : 'default'}
                  />
                </FormField>

                <FormField
                  label="Kalan Taksit Sayısı"
                  hint="Boş bırakılırsa toplam taksit alınır"
                  htmlFor="kalanTaksit"
                >
                  <Input
                    id="kalanTaksit"
                    type="number"
                    min="0"
                    value={form.kalanTaksit}
                    onChange={e => guncelle('kalanTaksit', e.target.value)}
                    placeholder="24"
                  />
                </FormField>

                <FormField
                  label="Yıllık Faiz Oranı (%)"
                  hint="İsteğe bağlı — aylık ödeme hesabı için"
                  htmlFor="faizOrani"
                >
                  <Input
                    id="faizOrani"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.faizOrani}
                    onChange={e => guncelle('faizOrani', e.target.value)}
                    placeholder="12,50"
                  />
                </FormField>

                <FormField
                  label="Ödeme Günü (1–31)"
                  required
                  error={hatalar.odemeGunu}
                  htmlFor="odemeGunu"
                >
                  <Input
                    id="odemeGunu"
                    type="number"
                    min="1"
                    max="31"
                    value={form.odemeGunu}
                    onChange={e => guncelle('odemeGunu', e.target.value)}
                    variant={hatalar.odemeGunu ? 'error' : 'default'}
                  />
                </FormField>

                <FormField
                  label="Başlangıç Tarihi"
                  required
                  htmlFor="baslangicTarihi"
                >
                  <Input
                    id="baslangicTarihi"
                    type="date"
                    value={form.baslangicTarihi}
                    onChange={e => guncelle('baslangicTarihi', e.target.value)}
                  />
                </FormField>
              </div>

              {/* Hesaplanan Aylık Ödeme */}
              {aylikOdeme > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-green-500/20 bg-green-500/8 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-muted-foreground">Hesaplanan Aylık Ödeme</span>
                  </div>
                  <span className="text-lg font-bold text-green-400">
                    {aylikOdeme.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    {secilenPara ? ` ${secilenPara.code}` : ''}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bilgi Notu */}
          <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/8 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
            <p className="text-sm text-muted-foreground">
              Faiz oranı girilirse aylık ödeme tutarı otomatik hesaplanır. Kalan taksit boş bırakılırsa toplam taksit sayısı esas alınır.
            </p>
          </div>

          {/* Butonlar */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={kaydediliyor}
            >
              İptal
            </Button>
            <Button
              type="submit"
              variant="glow"
              className="flex-1"
              loading={kaydediliyor}
              disabled={kaydediliyor}
            >
              Kredi Ekle
            </Button>
          </div>
        </form>
      </div>
    </AppPageShell>
  )
}

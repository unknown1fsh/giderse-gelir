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
import { Wallet, Mail, Phone, Info } from 'lucide-react'
import { parseCurrencyInput } from '@/lib/validators'
import { useToast } from '@/lib/use-toast'

interface Currency {
  id: number
  code: string
  name: string
  symbol: string
}

interface ReferenceData {
  currencies: Currency[]
}

const SAGLAIYICILAR = [
  'Papara',
  'PayPal',
  'İninal',
  'Paycell',
  'BKM Express',
  'Google Pay',
  'Apple Pay',
  'Diğer',
]

export default function YeniECuzdanSayfasi() {
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useToast()
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [hatalar, setHatalar] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    ad: '',
    saglayici: '',
    eposta: '',
    telefon: '',
    bakiye: '',
    paraBirimiId: '',
  })

  useEffect(() => {
    async function veriGetir() {
      try {
        const res = await fetch('/api/reference-data')
        if (res.ok) {
          const veri = (await res.json()) as ReferenceData
          setReferenceData(veri)
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

  const guncelle = (alan: string, deger: string) => {
    setForm(f => ({ ...f, [alan]: deger }))
    if (hatalar[alan]) {setHatalar(h => ({ ...h, [alan]: '' }))}
  }

  const dogrula = () => {
    const yeni: Record<string, string> = {}
    if (!form.ad.trim()) {yeni.ad = 'E-cüzdan adı zorunludur'}
    if (!form.saglayici) {yeni.saglayici = 'Sağlayıcı seçimi zorunludur'}
    if (!form.paraBirimiId) {yeni.paraBirimiId = 'Para birimi seçimi zorunludur'}
    if (!form.eposta && !form.telefon)
      {yeni.eposta = 'En az bir iletişim bilgisi (e-posta veya telefon) zorunludur'}
    setHatalar(yeni)
    return Object.keys(yeni).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dogrula()) {return}
    setKaydediliyor(true)
    try {
      const res = await fetch('/api/ewallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.ad.trim(),
          provider: form.saglayici,
          accountEmail: form.eposta.trim() || null,
          accountPhone: form.telefon.trim() || null,
          balance: form.bakiye ? parseCurrencyInput(form.bakiye) : 0,
          currencyId: parseInt(form.paraBirimiId),
        }),
      })
      if (res.ok) {
        toastSuccess('Başarılı', 'E-cüzdan başarıyla eklendi')
        router.push('/ewallets')
      } else {
        const hata = (await res.json()) as { error?: string }
        toastError('Hata', hata.error || 'E-cüzdan eklenemedi')
      }
    } catch {
      toastError('Hata', 'E-cüzdan eklenirken hata oluştu')
    } finally {
      setKaydediliyor(false)
    }
  }

  return (
    <AppPageShell
      header={{
        title: 'Yeni E-Cüzdan',
        description: 'Papara, PayPal, İninal gibi dijital cüzdanınızı ekleyin',
        onBack: () => router.back(),
      }}
    >
      <div className="max-w-2xl">
        <form onSubmit={e => void handleSubmit(e)} className="space-y-6">
          {/* Temel Bilgiler */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <Wallet className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Temel Bilgiler
                </h2>
              </div>

              <FormField label="E-Cüzdan Adı" required error={hatalar.ad} htmlFor="ad">
                <Input
                  id="ad"
                  value={form.ad}
                  onChange={e => guncelle('ad', e.target.value)}
                  placeholder="Papara Hesabım, PayPal Ana Cüzdan..."
                  variant={hatalar.ad ? 'error' : 'default'}
                />
              </FormField>

              <FormField label="Sağlayıcı" required error={hatalar.saglayici} htmlFor="saglayici">
                <Select value={form.saglayici} onValueChange={v => guncelle('saglayici', v)}>
                  <SelectTrigger id="saglayici" className={hatalar.saglayici ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Sağlayıcı seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {SAGLAIYICILAR.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </CardContent>
          </Card>

          {/* İletişim Bilgileri */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <Mail className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  İletişim Bilgileri
                </h2>
                <span className="ml-auto text-xs text-muted-foreground">En az biri zorunlu</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="E-posta Adresi"
                  error={hatalar.eposta}
                  hint="E-cüzdan hesabı e-postası"
                  htmlFor="eposta"
                >
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="eposta"
                      type="email"
                      value={form.eposta}
                      onChange={e => guncelle('eposta', e.target.value)}
                      placeholder="ornek@eposta.com"
                      className="pl-9 sm:pl-9"
                      variant={hatalar.eposta ? 'error' : 'default'}
                    />
                  </div>
                </FormField>

                <FormField
                  label="Telefon Numarası"
                  hint="E-cüzdan hesabı telefonu"
                  htmlFor="telefon"
                >
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="telefon"
                      type="tel"
                      value={form.telefon}
                      onChange={e => guncelle('telefon', e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="pl-9 sm:pl-9"
                    />
                  </div>
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* Bakiye Bilgileri */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <span className="text-base font-bold text-primary">₺</span>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Bakiye Bilgileri
                </h2>
                <span className="ml-auto text-xs text-muted-foreground">İsteğe bağlı</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Mevcut Bakiye" hint="Örn: 1.500 veya 1.500,50" htmlFor="bakiye">
                  <Input
                    id="bakiye"
                    value={form.bakiye}
                    onChange={e => guncelle('bakiye', e.target.value)}
                    placeholder="0,00"
                  />
                </FormField>

                <FormField
                  label="Para Birimi"
                  required
                  error={hatalar.paraBirimiId}
                  htmlFor="paraBirimi"
                >
                  <Select
                    value={form.paraBirimiId}
                    onValueChange={v => guncelle('paraBirimiId', v)}
                    disabled={yukleniyor || !referenceData?.currencies?.length}
                  >
                    <SelectTrigger id="paraBirimi" className={hatalar.paraBirimiId ? 'border-destructive' : ''}>
                      <SelectValue placeholder={yukleniyor ? 'Yükleniyor...' : 'Para birimi seçin'} />
                    </SelectTrigger>
                    <SelectContent>
                      {referenceData?.currencies.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.code} — {c.name} ({c.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* Bilgi Notu */}
          <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/8 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
            <p className="text-sm text-muted-foreground">
              E-cüzdan adı ve sağlayıcı zorunludur. En az bir iletişim bilgisi girilmelidir. Bakiye isteğe bağlıdır.
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
              E-Cüzdan Ekle
            </Button>
          </div>
        </form>
      </div>
    </AppPageShell>
  )
}

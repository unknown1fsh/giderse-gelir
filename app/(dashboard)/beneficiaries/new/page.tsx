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
  Textarea,
} from '@/components/mosaic'
import { Users, Building2, CreditCard, Phone, Mail, Info } from 'lucide-react'
import { useToast } from '@/lib/use-toast'

interface ReferenceData {
  banks: Array<{ id: number; name: string }>
}

export default function YeniAliciSayfasi() {
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useToast()
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [hatalar, setHatalar] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    ad: '',
    iban: '',
    hesapNo: '',
    bankaId: '',
    telefon: '',
    eposta: '',
    aciklama: '',
  })

  useEffect(() => {
    async function veriGetir() {
      try {
        const res = await fetch('/api/reference-data')
        if (res.ok) {
          const veri = (await res.json()) as ReferenceData
          setReferenceData(veri)
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
    if (!form.ad.trim()) {yeni.ad = 'Alıcı adı zorunludur'}
    if (!form.iban && !form.hesapNo && !form.telefon && !form.eposta)
      {yeni.iletisim = 'En az bir iletişim bilgisi (IBAN, Hesap No, Telefon veya E-posta) girilmelidir'}
    setHatalar(yeni)
    return Object.keys(yeni).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dogrula()) {return}
    setKaydediliyor(true)
    try {
      const res = await fetch('/api/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.ad.trim(),
          iban: form.iban.trim() || null,
          accountNo: form.hesapNo.trim() || null,
          bankId: form.bankaId ? parseInt(form.bankaId) : null,
          phoneNumber: form.telefon.trim() || null,
          email: form.eposta.trim() || null,
          description: form.aciklama.trim() || null,
        }),
      })
      if (res.ok) {
        toastSuccess('Başarılı', 'Alıcı başarıyla eklendi')
        router.push('/beneficiaries')
      } else {
        const hata = (await res.json()) as { error?: string }
        toastError('Hata', hata.error || 'Alıcı eklenemedi')
      }
    } catch {
      toastError('Hata', 'Alıcı eklenirken hata oluştu')
    } finally {
      setKaydediliyor(false)
    }
  }

  return (
    <AppPageShell
      header={{
        title: 'Yeni Alıcı',
        description: 'Havale/EFT yapacağınız kişi veya kurumu ekleyin',
        onBack: () => router.back(),
      }}
    >
      <div className="max-w-2xl">
        <form onSubmit={e => void handleSubmit(e)} className="space-y-6">
          {/* Temel Bilgiler */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <Users className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Temel Bilgiler
                </h2>
              </div>

              <FormField label="Alıcı Adı / Ünvanı" required error={hatalar.ad} htmlFor="ad">
                <Input
                  id="ad"
                  value={form.ad}
                  onChange={e => guncelle('ad', e.target.value)}
                  placeholder="Ahmet Yılmaz veya ABC Şirketi A.Ş."
                  variant={hatalar.ad ? 'error' : 'default'}
                />
              </FormField>

              <FormField label="Açıklama / Not" htmlFor="aciklama">
                <Textarea
                  id="aciklama"
                  value={form.aciklama}
                  onChange={e => guncelle('aciklama', e.target.value)}
                  placeholder="Bu alıcı hakkında notlarınız..."
                  rows={2}
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Banka Bilgileri */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <Building2 className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Banka Bilgileri
                </h2>
                <span className="ml-auto text-xs text-muted-foreground">İsteğe bağlı</span>
              </div>

              <FormField label="Banka" htmlFor="banka">
                <Select
                  value={form.bankaId}
                  onValueChange={v => guncelle('bankaId', v)}
                  disabled={yukleniyor}
                >
                  <SelectTrigger id="banka">
                    <SelectValue placeholder={yukleniyor ? 'Yükleniyor...' : 'Banka seçin (isteğe bağlı)'} />
                  </SelectTrigger>
                  <SelectContent>
                    {referenceData?.banks.map(b => (
                      <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="IBAN"
                hint="Uluslararası banka hesap numarası"
                htmlFor="iban"
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                    TR
                  </span>
                  <Input
                    id="iban"
                    value={form.iban}
                    onChange={e => guncelle('iban', e.target.value)}
                    placeholder="00 0000 0000 0000 0000 0000 00"
                    className="pl-9 sm:pl-9"
                    maxLength={34}
                  />
                </div>
              </FormField>

              <FormField
                label="Hesap Numarası"
                hint="IBAN yoksa hesap numarasını girin"
                htmlFor="hesapNo"
              >
                <div className="relative">
                  <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="hesapNo"
                    value={form.hesapNo}
                    onChange={e => guncelle('hesapNo', e.target.value)}
                    placeholder="1234567890"
                    className="pl-9 sm:pl-9"
                  />
                </div>
              </FormField>
            </CardContent>
          </Card>

          {/* İletişim Bilgileri */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <Phone className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  İletişim Bilgileri
                </h2>
              </div>

              {hatalar.iletisim && (
                <p className="text-sm font-medium text-destructive">{hatalar.iletisim}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Telefon Numarası" htmlFor="telefon">
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

                <FormField label="E-posta Adresi" htmlFor="eposta">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="eposta"
                      type="email"
                      value={form.eposta}
                      onChange={e => guncelle('eposta', e.target.value)}
                      placeholder="ornek@eposta.com"
                      className="pl-9 sm:pl-9"
                    />
                  </div>
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* Bilgi Notu */}
          <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/8 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
            <p className="text-sm text-muted-foreground">
              Alıcı adı zorunludur. Banka, IBAN, Hesap No, Telefon veya E-posta bilgilerinden en az biri girilmelidir.
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
              Alıcı Ekle
            </Button>
          </div>
        </form>
      </div>
    </AppPageShell>
  )
}

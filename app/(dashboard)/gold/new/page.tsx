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
import { Coins, Info } from 'lucide-react'
import { useToast } from '@/lib/use-toast'

interface ReferenceData {
  goldTypes: Array<{
    id: number
    code: string
    name: string
    description?: string | null
  }>
  goldPurities: Array<{
    id: number
    code: string
    name: string
    purity: string
  }>
}

export default function YeniAltinSayfasi() {
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useToast()
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [hatalar, setHatalar] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    ad: '',
    altinTuruId: '',
    altinAyarId: '',
    agirlik: '',
    alisUcreti: '',
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
    if (!form.ad.trim()) {yeni.ad = 'Eşya adı zorunludur'}
    if (!form.altinTuruId) {yeni.altinTuruId = 'Altın türü seçimi zorunludur'}
    if (!form.altinAyarId) {yeni.altinAyarId = 'Ayar seçimi zorunludur'}
    if (!form.agirlik || parseFloat(form.agirlik) <= 0) {yeni.agirlik = 'Geçerli bir ağırlık girin'}
    if (!form.alisUcreti || parseFloat(form.alisUcreti) <= 0) {yeni.alisUcreti = 'Geçerli bir alış fiyatı girin'}
    setHatalar(yeni)
    return Object.keys(yeni).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dogrula()) {return}
    setKaydediliyor(true)
    try {
      const res = await fetch('/api/gold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.ad.trim(),
          goldTypeId: parseInt(form.altinTuruId),
          goldPurityId: parseInt(form.altinAyarId),
          weight: parseFloat(form.agirlik),
          purchasePrice: parseFloat(form.alisUcreti),
          description: form.aciklama.trim() || null,
        }),
      })
      if (res.ok) {
        toastSuccess('Başarılı', 'Altın eşyası başarıyla eklendi')
        router.push('/gold')
      } else {
        const hata = (await res.json()) as { error?: string }
        toastError('Hata', hata.error || 'Altın eşyası eklenemedi')
      }
    } catch {
      toastError('Hata', 'Altın eşyası eklenirken hata oluştu')
    } finally {
      setKaydediliyor(false)
    }
  }

  return (
    <AppPageShell
      header={{
        title: 'Yeni Altın Eşyası',
        description: 'Altın, bilezik, kolye veya ziynet eşyası ekleyin',
        onBack: () => router.back(),
      }}
    >
      <div className="max-w-2xl">
        <form onSubmit={e => void handleSubmit(e)} className="space-y-6">
          {/* Temel Bilgiler */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <Coins className="h-4 w-4 text-yellow-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Eşya Bilgileri
                </h2>
              </div>

              <FormField label="Eşya Adı" required error={hatalar.ad} htmlFor="ad">
                <Input
                  id="ad"
                  value={form.ad}
                  onChange={e => guncelle('ad', e.target.value)}
                  placeholder="22 Ayar Altın Bilezik, Cumhuriyet Altını..."
                  variant={hatalar.ad ? 'error' : 'default'}
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Altın Türü"
                  required
                  error={hatalar.altinTuruId}
                  hint="Bilezik, Kolye, Küpe, Cumhuriyet Altını vb."
                  htmlFor="altinTuru"
                >
                  <Select
                    value={form.altinTuruId}
                    onValueChange={v => guncelle('altinTuruId', v)}
                    disabled={yukleniyor}
                  >
                    <SelectTrigger id="altinTuru" className={hatalar.altinTuruId ? 'border-destructive' : ''}>
                      <SelectValue placeholder={yukleniyor ? 'Yükleniyor...' : 'Tür seçin'} />
                    </SelectTrigger>
                    <SelectContent>
                      {referenceData?.goldTypes.map(t => (
                        <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  label="Ayar"
                  required
                  error={hatalar.altinAyarId}
                  hint="24K (Saf), 22K, 18K, 14K, 8K"
                  htmlFor="altinAyar"
                >
                  <Select
                    value={form.altinAyarId}
                    onValueChange={v => guncelle('altinAyarId', v)}
                    disabled={yukleniyor}
                  >
                    <SelectTrigger id="altinAyar" className={hatalar.altinAyarId ? 'border-destructive' : ''}>
                      <SelectValue placeholder={yukleniyor ? 'Yükleniyor...' : 'Ayar seçin'} />
                    </SelectTrigger>
                    <SelectContent>
                      {referenceData?.goldPurities.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name} ({p.purity} ayar)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* Değer Bilgileri */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <span className="text-base font-bold text-yellow-400">₺</span>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Değer Bilgileri
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Ağırlık (gram)"
                  required
                  error={hatalar.agirlik}
                  hint="Ondalıklı girilebilir: 15,50"
                  htmlFor="agirlik"
                >
                  <Input
                    id="agirlik"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.agirlik}
                    onChange={e => guncelle('agirlik', e.target.value)}
                    placeholder="15,50"
                    variant={hatalar.agirlik ? 'error' : 'default'}
                  />
                </FormField>

                <FormField
                  label="Alış Fiyatı (₺)"
                  required
                  error={hatalar.alisUcreti}
                  hint="Satın alım toplam tutarı"
                  htmlFor="alisUcreti"
                >
                  <Input
                    id="alisUcreti"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.alisUcreti}
                    onChange={e => guncelle('alisUcreti', e.target.value)}
                    placeholder="25000,00"
                    variant={hatalar.alisUcreti ? 'error' : 'default'}
                  />
                </FormField>
              </div>

              <FormField label="Açıklama" hint="İsteğe bağlı notlar" htmlFor="aciklama">
                <Textarea
                  id="aciklama"
                  value={form.aciklama}
                  onChange={e => guncelle('aciklama', e.target.value)}
                  placeholder="Eşya hakkında ek bilgiler, satın alma yeri vb."
                  rows={3}
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Bilgi Notu */}
          <div className="flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/8 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
            <p className="text-sm text-muted-foreground">
              Altın eşyalarınızın güncel değeri, sistem tarafından otomatik olarak hesaplanır. Ağırlık ve ayar bilgisinin doğru girilmesi önemlidir.
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
              Altın Eşyası Ekle
            </Button>
          </div>
        </form>
      </div>
    </AppPageShell>
  )
}

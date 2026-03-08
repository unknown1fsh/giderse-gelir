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
import PremiumUpgradeModal from '@/components/premium-upgrade-modal'
import { ArrowDownCircle, ArrowUpCircle, Tag, Info } from 'lucide-react'
import { parseCurrencyInput } from '@/lib/validators'
import { useToast } from '@/lib/use-toast'

interface ReferenceData {
  txTypes: Array<{ id: number; code: string; name: string }>
  categories: Array<{
    id: number
    name: string
    code: string
    txTypeId: number
    txTypeName: string
  }>
  paymentMethods: Array<{ id: number; code: string; name: string }>
  accounts: Array<{
    id: number
    name: string
    bank: { id: number; name: string }
    currency: { id: number; code: string; name: string }
  }>
  creditCards: Array<{
    id: number
    name: string
    bank: { id: number; name: string }
    currency: { id: number; code: string; name: string }
  }>
  currencies: Array<{ id: number; code: string; name: string; symbol: string }>
}

export default function YeniIslemSayfasi() {
  const router = useRouter()
  const { error: toastError } = useToast()
  const [refData, setRefData] = useState<ReferenceData | null>(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [hatalar, setHatalar] = useState<Record<string, string>>({})
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [limitInfo, setLimitInfo] = useState<{
    current: number
    limit: number
    type: 'transaction' | 'analysis' | 'export'
  } | null>(null)

  const [form, setForm] = useState({
    islemTuruId: '',
    kategoriId: '',
    odemeYontemiId: '',
    hesapId: '',
    krediKartiId: '',
    tutar: '',
    paraBirimiId: '',
    tarih: new Date().toISOString().split('T')[0],
    aciklama: '',
    etiketler: '',
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

  const guncelle = (alan: string, deger: string) => {
    setForm(f => ({ ...f, [alan]: deger }))
    if (hatalar[alan]) {setHatalar(h => ({ ...h, [alan]: '' }))}
  }

  const filtreliKategoriler = refData?.categories.filter(
    k => k.txTypeId === parseInt(form.islemTuruId)
  ) ?? []

  const seciliTur = refData?.txTypes.find(t => t.id === parseInt(form.islemTuruId))

  const dogrula = () => {
    const yeni: Record<string, string> = {}
    if (!form.islemTuruId) {yeni.islemTuruId = 'İşlem türü seçimi zorunludur'}
    if (!form.kategoriId) {yeni.kategoriId = 'Kategori seçimi zorunludur'}
    if (!form.odemeYontemiId) {yeni.odemeYontemiId = 'Ödeme yöntemi seçimi zorunludur'}
    if (!form.tutar || parseFloat(form.tutar.replace(',', '.')) <= 0)
      {yeni.tutar = 'Geçerli bir tutar girin'}
    if (!form.paraBirimiId) {yeni.paraBirimiId = 'Para birimi seçimi zorunludur'}
    if (!form.hesapId && !form.krediKartiId)
      {yeni.hesapId = 'Hesap veya kredi kartı seçimi zorunludur'}
    setHatalar(yeni)
    return Object.keys(yeni).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dogrula()) {return}
    setKaydediliyor(true)
    try {
      const govde: Record<string, unknown> = {
        txTypeId: parseInt(form.islemTuruId),
        categoryId: parseInt(form.kategoriId),
        paymentMethodId: parseInt(form.odemeYontemiId),
        amount: parseCurrencyInput(form.tutar),
        currencyId: parseInt(form.paraBirimiId),
        transactionDate: form.tarih,
        tags: form.etiketler ? form.etiketler.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      if (form.hesapId) {govde.accountId = parseInt(form.hesapId)}
      if (form.krediKartiId) {govde.creditCardId = parseInt(form.krediKartiId)}
      if (form.aciklama.trim()) {govde.description = form.aciklama.trim()}

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(govde),
      })

      if (res.ok) {
        router.push('/transactions')
      } else {
        const hata = (await res.json()) as {
          limitReached?: boolean
          currentCount?: number
          limit?: number
          error?: string
        }
        if (hata.limitReached) {
          setLimitInfo({
            current: hata.currentCount || 50,
            limit: hata.limit || 50,
            type: 'transaction',
          })
          setShowPremiumModal(true)
        } else {
          toastError('Hata', hata.error || 'İşlem eklenemedi')
        }
      }
    } catch {
      toastError('Hata', 'İşlem kaydedilemedi')
    } finally {
      setKaydediliyor(false)
    }
  }

  return (
    <AppPageShell
      header={{
        title: 'Yeni İşlem',
        description: 'Gelir veya gider işlemi ekleyin',
        onBack: () => router.back(),
      }}
    >
      <div className="max-w-2xl">
        <form onSubmit={e => void handleSubmit(e)} className="space-y-6">

          {/* İşlem Türü Seçimi */}
          <div className="grid grid-cols-2 gap-3">
            {refData?.txTypes.map(tur => {
              const secili = form.islemTuruId === String(tur.id)
              const gelir = tur.code === 'INCOME' || tur.name.toLowerCase().includes('gelir')
              return (
                <button
                  key={tur.id}
                  type="button"
                  onClick={() => {
                    guncelle('islemTuruId', String(tur.id))
                    guncelle('kategoriId', '')
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 font-semibold text-sm transition-all ${
                    secili
                      ? gelir
                        ? 'border-green-500 bg-green-500/15 text-green-400'
                        : 'border-red-500 bg-red-500/15 text-red-400'
                      : 'border-border/60 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/40'
                  }`}
                >
                  {gelir ? (
                    <ArrowUpCircle className="h-5 w-5" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5" />
                  )}
                  {tur.name}
                </button>
              )
            })}
            {hatalar.islemTuruId && (
              <p className="col-span-2 text-sm font-medium text-destructive">{hatalar.islemTuruId}</p>
            )}
          </div>

          {/* Tutar ve Tarih */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <span className="text-base font-bold text-primary">₺</span>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Tutar ve Tarih
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  label="Tutar"
                  required
                  error={hatalar.tutar}
                  htmlFor="tutar"
                  className="sm:col-span-2"
                >
                  <Input
                    id="tutar"
                    value={form.tutar}
                    onChange={e => guncelle('tutar', e.target.value)}
                    placeholder="0,00"
                    variant={hatalar.tutar ? 'error' : 'default'}
                  />
                </FormField>

                <FormField label="Para Birimi" required error={hatalar.paraBirimiId} htmlFor="paraBirimi">
                  <Select
                    value={form.paraBirimiId}
                    onValueChange={v => guncelle('paraBirimiId', v)}
                    disabled={yukleniyor}
                  >
                    <SelectTrigger id="paraBirimi" className={hatalar.paraBirimiId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {refData?.currencies.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <FormField label="İşlem Tarihi" required htmlFor="tarih">
                <Input
                  id="tarih"
                  type="date"
                  value={form.tarih}
                  onChange={e => guncelle('tarih', e.target.value)}
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Kategori ve Ödeme Yöntemi */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <Tag className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Kategori ve Ödeme
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Kategori" required error={hatalar.kategoriId} htmlFor="kategori">
                  <Select
                    value={form.kategoriId}
                    onValueChange={v => guncelle('kategoriId', v)}
                    disabled={!form.islemTuruId}
                  >
                    <SelectTrigger id="kategori" className={hatalar.kategoriId ? 'border-destructive' : ''}>
                      <SelectValue
                        placeholder={
                          !form.islemTuruId
                            ? 'Önce işlem türü seçin'
                            : filtreliKategoriler.length === 0
                              ? 'Kategori bulunamadı'
                              : 'Kategori seçin'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filtreliKategoriler.map(k => (
                        <SelectItem key={k.id} value={String(k.id)}>{k.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Ödeme Yöntemi" required error={hatalar.odemeYontemiId} htmlFor="odemeYontemi">
                  <Select
                    value={form.odemeYontemiId}
                    onValueChange={v => guncelle('odemeYontemiId', v)}
                    disabled={yukleniyor}
                  >
                    <SelectTrigger id="odemeYontemi" className={hatalar.odemeYontemiId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Ödeme yöntemi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {refData?.paymentMethods.map(m => (
                        <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Hesap"
                  error={hatalar.hesapId}
                  hint="Hesap veya kart seçin"
                  htmlFor="hesap"
                >
                  <Select
                    value={form.hesapId}
                    onValueChange={v => {
                      guncelle('hesapId', v)
                      guncelle('krediKartiId', '')
                    }}
                    disabled={yukleniyor}
                  >
                    <SelectTrigger id="hesap" className={hatalar.hesapId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Hesap seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {refData?.accounts.map(h => (
                        <SelectItem key={h.id} value={String(h.id)}>
                          {h.name} ({h.bank.name} · {h.currency.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Kredi Kartı" htmlFor="krediKarti">
                  <Select
                    value={form.krediKartiId}
                    onValueChange={v => {
                      guncelle('krediKartiId', v)
                      guncelle('hesapId', '')
                    }}
                    disabled={yukleniyor}
                  >
                    <SelectTrigger id="krediKarti">
                      <SelectValue placeholder="Kredi kartı seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {refData?.creditCards.map(k => (
                        <SelectItem key={k.id} value={String(k.id)}>
                          {k.name} ({k.bank.name} · {k.currency.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* Ek Bilgiler */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <Info className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Ek Bilgiler
                </h2>
                <span className="ml-auto text-xs text-muted-foreground">İsteğe bağlı</span>
              </div>

              <FormField label="Açıklama" htmlFor="aciklama">
                <Textarea
                  id="aciklama"
                  value={form.aciklama}
                  onChange={e => guncelle('aciklama', e.target.value)}
                  placeholder="İşlem açıklaması..."
                  rows={2}
                />
              </FormField>

              <FormField
                label="Etiketler"
                hint="Virgülle ayırın: market, fatura, eğlence"
                htmlFor="etiketler"
              >
                <Input
                  id="etiketler"
                  value={form.etiketler}
                  onChange={e => guncelle('etiketler', e.target.value)}
                  placeholder="market, fatura, eğlence..."
                />
              </FormField>
            </CardContent>
          </Card>

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
              {seciliTur
                ? `${seciliTur.name} Ekle`
                : 'İşlem Ekle'}
            </Button>
          </div>
        </form>
      </div>

      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        featureName="Sınırsız İşlem"
        limitInfo={limitInfo ?? undefined}
      />
    </AppPageShell>
  )
}

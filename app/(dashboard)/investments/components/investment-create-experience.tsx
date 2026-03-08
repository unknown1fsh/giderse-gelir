'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  BarChart3,
  Building2,
  Coins,
  Globe,
  Landmark,
  Layers,
  PieChart,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Shield,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import PremiumUpgradeModal from '@/components/premium-upgrade-modal'
import {
  AppPageShell,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  FilterBar,
  FormField,
  Input,
  SearchBox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/mosaic'
import {
  INVESTMENT_TYPE_DEFINITIONS,
  INVESTMENT_TYPE_IDS,
  INVESTMENT_TYPE_OPTIONS,
  type InvestmentTypeId,
  RISK_LEVEL_OPTIONS,
} from '@/lib/finance/investments'
import { formatCurrency } from '@/lib/validators'
import { useToast } from '@/lib/use-toast'

type CurrencyOption = {
  id: number
  code: string
  name: string
  symbol?: string
}

type MarketSearchResult = {
  symbol: string
  name: string
  exchange?: string
  type?: string
}

type CryptoResult = {
  id: string
  symbol: string
  name: string
  image?: string
  currentPrice: number
  priceChange24h?: number
  rank?: number
}

type SelectedAsset = {
  name: string
  symbol: string
  category?: string
  exchange?: string
  image?: string
  coinId?: string
  rank?: number
}

const TYPE_ICONS = {
  stock: TrendingUp,
  fund: PieChart,
  bond: Shield,
  crypto: Coins,
  commodity: Layers,
  forex: Globe,
  'real-estate': Building2,
  other: Star,
} satisfies Record<InvestmentTypeId, typeof TrendingUp>

const FOREX_OPTIONS = [
  { symbol: 'USDTRY', name: 'USD / TRY' },
  { symbol: 'EURTRY', name: 'EUR / TRY' },
  { symbol: 'GBPTRY', name: 'GBP / TRY' },
  { symbol: 'XAUUSD', name: 'XAU / USD' },
]

const COMMODITY_OPTIONS = [
  { symbol: 'GC=F', name: 'Altin (Gold Futures)' },
  { symbol: 'SI=F', name: 'Gumus (Silver Futures)' },
  { symbol: 'CL=F', name: 'Ham Petrol (WTI)' },
  { symbol: 'HG=F', name: 'Bakir (Copper Futures)' },
]

const REAL_ESTATE_CATEGORIES = ['Konut', 'Ticari', 'Arsa']

function getDefaultType(forcedType?: InvestmentTypeId): InvestmentTypeId {
  return forcedType ?? 'stock'
}

export function InvestmentCreateExperience({
  forcedType,
}: {
  forcedType?: InvestmentTypeId
}) {
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([])
  const [selectedType, setSelectedType] = useState<InvestmentTypeId>(getDefaultType(forcedType))
  const [searchTerm, setSearchTerm] = useState('')
  const [marketResults, setMarketResults] = useState<MarketSearchResult[]>([])
  const [cryptoList, setCryptoList] = useState<CryptoResult[]>([])
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    quantity: '',
    purchasePrice: '',
    currentPrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    currencyId: '',
    category: '',
    riskLevel: INVESTMENT_TYPE_DEFINITIONS[getDefaultType(forcedType)].defaultRiskLevel,
    notes: '',
    isin: '',
    couponRate: '',
    maturityDate: '',
    valuation: '',
    rentalIncome: '',
  })

  const definition = INVESTMENT_TYPE_DEFINITIONS[selectedType]
  const TypeIcon = TYPE_ICONS[selectedType]
  const filteredCryptos = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) {
      return cryptoList.slice(0, 40)
    }

    return cryptoList
      .filter(
        crypto =>
          crypto.name.toLowerCase().includes(query) || crypto.symbol.toLowerCase().includes(query)
      )
      .slice(0, 40)
  }, [cryptoList, searchTerm])

  const purchaseTotal = useMemo(() => {
    const quantity = Number(formData.quantity.replace(',', '.'))
    const purchasePrice = Number(formData.purchasePrice.replace(',', '.'))
    return Number.isFinite(quantity) && Number.isFinite(purchasePrice) ? quantity * purchasePrice : 0
  }, [formData.purchasePrice, formData.quantity])

  const currentValue = useMemo(() => {
    const quantity = Number(formData.quantity.replace(',', '.'))
    const currentPrice = Number(
      (formData.currentPrice || formData.purchasePrice || '0').replace(',', '.')
    )
    return Number.isFinite(quantity) && Number.isFinite(currentPrice) ? quantity * currentPrice : 0
  }, [formData.currentPrice, formData.purchasePrice, formData.quantity])

  const profitLoss = currentValue - purchaseTotal
  const profitLossPercent = purchaseTotal > 0 ? (profitLoss / purchaseTotal) * 100 : 0

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        const [referenceResponse, cryptoResponse] = await Promise.all([
          fetch('/api/reference-data', { credentials: 'include' }),
          fetch('/api/market/crypto', { credentials: 'include' }),
        ])

        if (!referenceResponse.ok) {
          throw new Error('Referans verileri alınamadı')
        }

        const referenceData = (await referenceResponse.json()) as { currencies?: CurrencyOption[] }
        const currencyItems = referenceData.currencies ?? []

        if (!cancelled) {
          setCurrencies(currencyItems)

          const tryCurrency =
            currencyItems.find(currency => currency.code === 'TRY') ?? currencyItems[0] ?? null

          setFormData(prev => ({
            ...prev,
            currencyId: prev.currencyId || (tryCurrency ? String(tryCurrency.id) : ''),
            category: prev.category || definition.defaultCategory,
            riskLevel: prev.riskLevel || definition.defaultRiskLevel,
          }))
        }

        if (cryptoResponse.ok) {
          const cryptoData = (await cryptoResponse.json()) as CryptoResult[]
          if (!cancelled && Array.isArray(cryptoData)) {
            setCryptoList(cryptoData)
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Investment form bootstrap error:', error)
          setLoadError('Yatırım oluşturma akışına ait veriler yüklenemedi.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [definition.defaultCategory, definition.defaultRiskLevel])

  useEffect(() => {
    setSelectedAsset(null)
    setSearchTerm('')
    setMarketResults([])
    setFormData(prev => ({
      ...prev,
      name: '',
      symbol: '',
      quantity: selectedType === 'real-estate' ? '1' : '',
      purchasePrice: '',
      currentPrice: '',
      category: selectedType === 'real-estate' ? REAL_ESTATE_CATEGORIES[0] : definition.defaultCategory,
      riskLevel: definition.defaultRiskLevel,
      isin: '',
      couponRate: '',
      maturityDate: '',
      valuation: '',
      rentalIncome: '',
    }))
  }, [definition.defaultCategory, definition.defaultRiskLevel, selectedType])

  useEffect(() => {
    if (forcedType && forcedType !== selectedType) {
      setSelectedType(forcedType)
    }
  }, [forcedType, selectedType])

  useEffect(() => {
    if (selectedType !== 'stock' && selectedType !== 'fund') {
      return
    }

    const query = searchTerm.trim()
    if (query.length < 2) {
      setMarketResults([])
      return
    }

    const controller = new AbortController()
    const endpoint =
      selectedType === 'stock' ? '/api/market/stocks/search' : '/api/market/funds/search'

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`${endpoint}?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
          credentials: 'include',
        })
        if (!response.ok) {
          return
        }

        const data = (await response.json()) as { results?: MarketSearchResult[] }
        setMarketResults(data.results ?? [])
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Market search error:', error)
        }
      }
    }, 250)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [searchTerm, selectedType])

  function handleFieldChange<K extends keyof typeof formData>(field: K, value: (typeof formData)[K]) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function selectMappedAsset(asset: SelectedAsset) {
    setSelectedAsset(asset)
    setFormData(prev => ({
      ...prev,
      name: asset.name,
      symbol: asset.symbol,
      category: asset.category || prev.category || definition.defaultCategory,
    }))
  }

  async function handleFetchQuote() {
    try {
      setQuoteLoading(true)

      if (selectedType === 'stock' || selectedType === 'fund') {
        const symbol = selectedAsset?.symbol || formData.symbol
        if (!symbol) {
          toastError('Hata', 'Önce bir varlık seçiniz')
          return
        }

        const endpoint =
          selectedType === 'stock' ? '/api/market/stocks/quote' : '/api/market/funds/quote'
        const response = await fetch(`${endpoint}?symbol=${encodeURIComponent(symbol)}`)
        const data = (await response.json()) as { quote?: { price?: number } | null }
        const price = data.quote?.price
        if (price) {
          handleFieldChange('currentPrice', String(price))
        }
        return
      }

      if (selectedType === 'commodity') {
        const response = await fetch(
          `/api/market/commodities/quote?symbol=${encodeURIComponent(formData.symbol)}`
        )
        const data = (await response.json()) as { quote?: { price?: number } | null }
        const price = data.quote?.price
        if (price) {
          handleFieldChange('currentPrice', String(price))
        }
        return
      }

      if (selectedType === 'forex') {
        const response = await fetch(
          `/api/market/forex/quote?pair=${encodeURIComponent(formData.symbol)}`
        )
        const data = (await response.json()) as { quote?: { price?: number } | null }
        const price = data.quote?.price
        if (price) {
          handleFieldChange('currentPrice', String(price))
        }
      }
    } catch (error) {
      console.error('Quote fetch error:', error)
      toastError('Hata', 'Güncel fiyat getirilemedi')
    } finally {
      setQuoteLoading(false)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!formData.name.trim()) {
      toastError('Hata', 'Yatırım adı zorunludur')
      return
    }

    if (!formData.quantity.trim()) {
      toastError('Hata', 'Miktar zorunludur')
      return
    }

    if (!formData.purchasePrice.trim()) {
      toastError('Hata', 'Alış fiyatı zorunludur')
      return
    }

    if (!formData.currencyId) {
      toastError('Hata', 'Para birimi seçiniz')
      return
    }

    const metadata: Record<string, unknown> = {}

    if (selectedAsset?.exchange) {
      metadata.exchange = selectedAsset.exchange
    }
    if (selectedAsset?.image) {
      metadata.image = selectedAsset.image
    }
    if (selectedAsset?.coinId) {
      metadata.coinId = selectedAsset.coinId
    }
    if (selectedAsset?.rank) {
      metadata.rank = selectedAsset.rank
    }
    if (selectedType === 'bond') {
      if (formData.isin.trim()) {
        metadata.isin = formData.isin.trim().toUpperCase()
      }
      if (formData.couponRate.trim()) {
        metadata.couponRate = formData.couponRate.trim()
      }
      if (formData.maturityDate.trim()) {
        metadata.maturityDate = formData.maturityDate.trim()
      }
    }
    if (selectedType === 'real-estate') {
      if (formData.valuation.trim()) {
        metadata.valuation = formData.valuation.trim()
      }
      if (formData.rentalIncome.trim()) {
        metadata.rentalIncome = formData.rentalIncome.trim()
      }
    }

    setSaving(true)

    try {
      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          investmentType: selectedType,
          name: formData.name.trim(),
          symbol: formData.symbol.trim() || formData.name.trim(),
          quantity: formData.quantity.trim(),
          purchasePrice: formData.purchasePrice.trim(),
          currentPrice: (formData.currentPrice || formData.purchasePrice).trim(),
          purchaseDate: formData.purchaseDate,
          currencyId: Number(formData.currencyId),
          category: formData.category.trim() || definition.defaultCategory,
          riskLevel: formData.riskLevel,
          notes: formData.notes.trim(),
          metadata,
        }),
      })

      const data = (await response.json()) as { error?: string; requiresPremium?: boolean }

      if (!response.ok) {
        if (data.requiresPremium) {
          setShowPremiumModal(true)
          return
        }

        toastError('Hata', data.error || 'Yatırım kaydedilemedi')
        return
      }

      toastSuccess('Başarılı', 'Yatırım kaydı oluşturuldu')
      router.push('/investments')
    } catch (error) {
      console.error('Investment submit error:', error)
      toastError('Hata', 'Yatırım kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  function renderAssetPicker() {
    if (selectedType === 'stock' || selectedType === 'fund') {
      return (
        <Card className="border-border/80 bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4 text-primary" />
              Pazar aramasi
            </CardTitle>
            <CardDescription>
              {selectedType === 'stock'
                ? 'Hisse kodu veya şirket adı arayarak kaydı hızlı doldurun.'
                : 'Fon adı veya kodu arayarak kaydı otomatik doldurun.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SearchBox
              value={searchTerm}
              onSearch={value => setSearchTerm(value)}
              placeholder={selectedType === 'stock' ? 'AAPL, THYAO, ASELS...' : 'Fon adı veya kodu...'}
            />
            {marketResults.length > 0 ? (
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {marketResults.map(result => (
                  <button
                    key={`${result.symbol}-${result.exchange ?? 'market'}`}
                    type="button"
                    onClick={() =>
                      selectMappedAsset({
                        name: result.name,
                        symbol: result.symbol,
                        category: result.type,
                        exchange: result.exchange,
                      })
                    }
                    className="w-full rounded-xl border border-border bg-muted/20 p-3 text-left transition hover:border-primary/40 hover:bg-muted/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-foreground">{result.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{result.symbol}</div>
                      </div>
                      <Badge variant="outline">{result.exchange || 'Pazar'}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                En az 2 karakter yazdiginizda sonuclar burada listelenir.
              </div>
            )}
          </CardContent>
        </Card>
      )
    }

    if (selectedType === 'crypto') {
      return (
        <Card className="border-border/80 bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Coins className="h-4 w-4 text-primary" />
              Kripto secimi
            </CardTitle>
            <CardDescription>Canlı fiyat listesinden bir coin seçip alış fiyatını hızla doldurun.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SearchBox
              value={searchTerm}
              onSearch={value => setSearchTerm(value)}
              placeholder="Bitcoin, Ethereum, SOL..."
            />
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {filteredCryptos.map(crypto => (
                <button
                  key={crypto.id}
                  type="button"
                  onClick={() => {
                    selectMappedAsset({
                      name: crypto.name,
                      symbol: crypto.symbol,
                      category: 'Kripto Para',
                      image: crypto.image,
                      coinId: crypto.id,
                      rank: crypto.rank,
                    })
                    handleFieldChange('purchasePrice', String(crypto.currentPrice))
                    handleFieldChange('currentPrice', String(crypto.currentPrice))
                  }}
                  className="w-full rounded-xl border border-border bg-muted/20 p-3 text-left transition hover:border-primary/40 hover:bg-muted/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {crypto.image ? (
                        <img src={crypto.image} alt={crypto.name} className="h-8 w-8 rounded-full" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Coins className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-foreground">{crypto.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{crypto.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">
                        {formatCurrency(crypto.currentPrice, 'TRY')}
                      </div>
                      <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        {Number(crypto.priceChange24h ?? 0) >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-400" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-rose-400" />
                        )}
                        {(crypto.priceChange24h ?? 0).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )
    }

    if (selectedType === 'commodity' || selectedType === 'forex') {
      const options = selectedType === 'commodity' ? COMMODITY_OPTIONS : FOREX_OPTIONS

      return (
        <Card className="border-border/80 bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {selectedType === 'commodity' ? (
                <Layers className="h-4 w-4 text-primary" />
              ) : (
                <Globe className="h-4 w-4 text-primary" />
              )}
              {selectedType === 'commodity' ? 'Emtia seçimi' : 'Parite seçimi'}
            </CardTitle>
            <CardDescription>
              {selectedType === 'commodity'
                ? 'Hazır emtia listesinden bir ürün seçip fiyat çekebilirsiniz.'
                : 'Parite seçin ve güncel kuru forma çekin.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label={selectedType === 'commodity' ? 'Varlık' : 'Parite'}>
              <Select
                value={formData.symbol}
                onValueChange={value => {
                  const option = options.find(item => item.symbol === value)
                  handleFieldChange('symbol', value)
                  handleFieldChange('name', option?.name ?? value)
                  handleFieldChange('category', definition.defaultCategory)
                  setSelectedAsset(
                    option
                      ? {
                          name: option.name,
                          symbol: option.symbol,
                          category: definition.defaultCategory,
                        }
                      : null
                  )
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {options.map(option => (
                    <SelectItem key={option.symbol} value={option.symbol}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleFetchQuote()}
              loading={quoteLoading}
              disabled={!formData.symbol}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Guncel fiyat getir
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="border-border/80 bg-card/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Yatirim rehberi
          </CardTitle>
          <CardDescription>{definition.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            {selectedType === 'bond'
              ? 'Kupon, vade ve ISIN alanlarını doldurarak sabit getirili ürün kaydını zenginleştirebilirsiniz.'
              : selectedType === 'real-estate'
                ? 'Değerleme ve kira geliri bilgileri meta alanda saklanır; ana ekrandaki analizlerde kullanılır.'
                : 'Manuel varliklar icin ad, sembol ve fiyat bilgileri yeterlidir. Dilerseniz not alanina stratejinizi ekleyin.'}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Yatirim formu hazirlaniyor...</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return <ErrorState title="Yatırım akışı hazırlanamadı" description={loadError} onRetry={() => window.location.reload()} />
  }

  return (
    <>
      <AppPageShell
        header={{
          title: forcedType ? `${definition.label} Ekle` : 'Yeni Yatırım',
          description: forcedType
            ? definition.description
            : 'Tüm yatırım türleri için standart kayıt deneyimi.',
          onBack: () => router.back(),
          backIcon: <ArrowLeft className="h-4 w-4" />,
          actions: (
            <>
              {!forcedType && (
                <Button asChild variant="outline">
                  <Link href="/investments">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Yatirim merkezi
                  </Link>
                </Button>
              )}
              <Button type="submit" form="investment-create-form" loading={saving}>
                <Save className="mr-2 h-4 w-4" />
                Kaydet
              </Button>
            </>
          ),
        }}
      >
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-6">
            {!forcedType ? (
              <Card className="border-border/80 bg-card/95">
                <CardHeader>
                  <CardTitle className="text-base">Yatırım Türü Seçimi</CardTitle>
                  <CardDescription>Her tür aynı veri yapısıyla çalışır, sadece giriş deneyimi özelleştirilir.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {INVESTMENT_TYPE_OPTIONS.map(option => {
                    const Icon = TYPE_ICONS[option.id]
                    const active = option.id === selectedType

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedType(option.id)}
                        className={`w-full rounded-xl border p-3 text-left transition ${
                          active
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-muted/20 hover:border-primary/30 hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{option.label}</div>
                              <div className="mt-1 text-xs text-muted-foreground">
                                {option.description}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={
                              option.defaultRiskLevel === 'low'
                                ? 'success'
                                : option.defaultRiskLevel === 'medium'
                                  ? 'warning'
                                  : 'destructive'
                            }
                          >
                            {option.defaultRiskLevel === 'low'
                              ? 'Dusuk'
                              : option.defaultRiskLevel === 'medium'
                                ? 'Orta'
                                : 'Yuksek'}
                          </Badge>
                        </div>
                      </button>
                    )
                  })}
                </CardContent>
              </Card>
            ) : null}

            {renderAssetPicker()}

            <Card className="border-border/80 bg-card/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {TypeIcon ? <TypeIcon className="h-4 w-4 text-primary" /> : null}
                  Ozet
                </CardTitle>
                <CardDescription>Form alanlari doldukca portfoy etkisini aninda gorebilirsiniz.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Yatirilan tutar</div>
                  <div className="mt-2 text-xl font-semibold text-foreground">
                    {formatCurrency(purchaseTotal, selectedType === 'crypto' ? 'TRY' : currencies.find(item => String(item.id) === formData.currencyId)?.code || 'TRY')}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Guncel deger</div>
                    <div className="mt-2 text-lg font-semibold text-foreground">
                      {formatCurrency(currentValue, currencies.find(item => String(item.id) === formData.currencyId)?.code || 'TRY')}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Kar / zarar</div>
                    <div className={`mt-2 text-lg font-semibold ${profitLoss >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                      {profitLoss >= 0 ? '+' : ''}
                      {formatCurrency(profitLoss, currencies.find(item => String(item.id) === formData.currencyId)?.code || 'TRY')}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {profitLossPercent >= 0 ? '+' : ''}
                      {profitLossPercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/80 bg-card/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-primary" />
                Kayit formu
              </CardTitle>
              <CardDescription>
                Ortak veri modeli kullanilir. Alanlar tur bazli ihtiyaca gore zenginlesir.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="investment-create-form" onSubmit={e => void handleSubmit(e)} className="space-y-6">
                {selectedAsset ? (
                  <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-medium text-foreground">{selectedAsset.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {selectedAsset.symbol}
                          {selectedAsset.exchange ? ` • ${selectedAsset.exchange}` : ''}
                        </div>
                      </div>
                      <Badge variant="info">Secili varlik</Badge>
                    </div>
                  </div>
                ) : null}

                <FilterBar className="mb-0">
                  <div className="grid w-full gap-3 lg:grid-cols-3">
                    <FormField label="Yatırım Türü">
                      <Select
                        value={selectedType}
                        onValueChange={value => {
                          if (!forcedType && INVESTMENT_TYPE_IDS.includes(value as InvestmentTypeId)) {
                            setSelectedType(value as InvestmentTypeId)
                          }
                        }}
                        disabled={Boolean(forcedType)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tür seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          {INVESTMENT_TYPE_OPTIONS.map(option => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Kategori">
                      <Input
                        value={formData.category}
                        onChange={event => handleFieldChange('category', event.target.value)}
                        placeholder="Kategori"
                      />
                    </FormField>

                    <FormField label="Risk Seviyesi">
                      <Select
                        value={formData.riskLevel}
                        onValueChange={value =>
                          handleFieldChange(
                            'riskLevel',
                            (RISK_LEVEL_OPTIONS.find(option => option.value === value)?.value ??
                              definition.defaultRiskLevel) as typeof formData.riskLevel
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Risk seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          {RISK_LEVEL_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                </FilterBar>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Yatırım Adı" required>
                    <Input
                      value={formData.name}
                      onChange={event => handleFieldChange('name', event.target.value)}
                      placeholder="Varlık adı"
                    />
                  </FormField>

                  <FormField label="Sembol">
                    <Input
                      value={formData.symbol}
                      onChange={event => handleFieldChange('symbol', event.target.value.toUpperCase())}
                      placeholder="Sembol"
                    />
                  </FormField>

                  <FormField
                    label={selectedType === 'real-estate' ? 'Adet' : 'Miktar'}
                    required
                    hint={selectedType === 'real-estate' ? 'Gayrimenkul kayıtları için varsayılan olarak 1 kullanılır.' : undefined}
                  >
                    <Input
                      value={formData.quantity}
                      onChange={event => handleFieldChange('quantity', event.target.value)}
                      placeholder={selectedType === 'crypto' ? '0.25000000' : '10'}
                      disabled={selectedType === 'real-estate'}
                    />
                  </FormField>

                  <FormField label="Para Birimi" required>
                    <Select
                      value={formData.currencyId}
                      onValueChange={value => handleFieldChange('currencyId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Para birimi seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency.id} value={String(currency.id)}>
                            {currency.code} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Alış Fiyatı" required>
                    <Input
                      value={formData.purchasePrice}
                      onChange={event => handleFieldChange('purchasePrice', event.target.value)}
                      placeholder="0.00"
                    />
                  </FormField>

                  <FormField
                    label="Güncel Fiyat"
                    hint="Boş bırakırsanız alış fiyatı kullanılır."
                  >
                    <div className="flex gap-2">
                      <Input
                        value={formData.currentPrice}
                        onChange={event => handleFieldChange('currentPrice', event.target.value)}
                        placeholder="0.00"
                      />
                      {(selectedType === 'stock' ||
                        selectedType === 'fund' ||
                        selectedType === 'commodity' ||
                        selectedType === 'forex') && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void handleFetchQuote()}
                          loading={quoteLoading}
                        >
                          Cek
                        </Button>
                      )}
                    </div>
                  </FormField>

                  <FormField label="Alış Tarihi" required>
                    <Input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={event => handleFieldChange('purchaseDate', event.target.value)}
                    />
                  </FormField>
                </div>

                {selectedType === 'bond' ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField label="ISIN">
                      <Input
                        value={formData.isin}
                        onChange={event => handleFieldChange('isin', event.target.value.toUpperCase())}
                        placeholder="TRT..."
                      />
                    </FormField>
                    <FormField label="Kupon Oranı (%)">
                      <Input
                        value={formData.couponRate}
                        onChange={event => handleFieldChange('couponRate', event.target.value)}
                        placeholder="10.50"
                      />
                    </FormField>
                    <FormField label="Vade Tarihi">
                      <Input
                        type="date"
                        value={formData.maturityDate}
                        onChange={event => handleFieldChange('maturityDate', event.target.value)}
                      />
                    </FormField>
                  </div>
                ) : null}

                {selectedType === 'real-estate' ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField label="Varlık Tipi">
                      <Select
                        value={formData.category}
                        onValueChange={value => handleFieldChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          {REAL_ESTATE_CATEGORIES.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Değerleme">
                      <Input
                        value={formData.valuation}
                        onChange={event => handleFieldChange('valuation', event.target.value)}
                        placeholder="0.00"
                      />
                    </FormField>
                    <FormField label="Aylık Kira Geliri">
                      <Input
                        value={formData.rentalIncome}
                        onChange={event => handleFieldChange('rentalIncome', event.target.value)}
                        placeholder="0.00"
                      />
                    </FormField>
                  </div>
                ) : null}

                <FormField label="Notlar">
                  <Textarea
                    value={formData.notes}
                    onChange={event => handleFieldChange('notes', event.target.value)}
                    placeholder="Strateji, hedef fiyat, alım notları..."
                    rows={4}
                  />
                </FormField>

                <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Vazgec
                  </Button>
                  {!forcedType ? (
                    <Button type="button" variant="outline" asChild>
                      <Link href={`/investments/${selectedType}/new`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Bu türü ayrık sayfada aç
                      </Link>
                    </Button>
                  ) : null}
                  <Button type="submit" loading={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    Yatırımı Kaydet
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {!forcedType ? (
          <div className="mt-6">
            <EmptyState
              title="Türe Özgü Hızlı Girişler"
              description="Belirli bir yatırım türüne odaklanmak isterseniz aşağıdaki sabit rotaları da kullanabilirsiniz."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  {INVESTMENT_TYPE_OPTIONS.map(option => (
                    <Button key={option.id} asChild variant="outline" size="sm">
                      <Link href={`/investments/${option.id}/new`}>{option.label}</Link>
                    </Button>
                  ))}
                </div>
              }
            />
          </div>
        ) : null}
      </AppPageShell>

      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        featureName="Yatirim Yonetimi"
        limitInfo={{ current: 0, limit: 0, type: 'analysis' }}
      />
    </>
  )
}

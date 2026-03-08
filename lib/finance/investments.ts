export const INVESTMENT_TYPE_IDS = [
  'stock',
  'fund',
  'bond',
  'crypto',
  'commodity',
  'forex',
  'real-estate',
  'other',
] as const

export type InvestmentTypeId = (typeof INVESTMENT_TYPE_IDS)[number]
export type RiskLevel = 'low' | 'medium' | 'high'

export interface InvestmentTypeDefinition {
  id: InvestmentTypeId
  label: string
  shortLabel: string
  description: string
  defaultCategory: string
  defaultRiskLevel: RiskLevel
}

export interface InvestmentCurrency {
  id: number
  code: string
  name: string
  symbol?: string
}

export interface InvestmentApiRecord {
  id: number
  investmentType: string
  name: string
  symbol?: string | null
  quantity: string | number
  purchasePrice: string | number
  currentPrice?: string | number | null
  purchaseDate: string | Date
  notes?: string | null
  category?: string | null
  riskLevel?: string | null
  metadata?: unknown
  currency?: Partial<InvestmentCurrency> | null
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface NormalizedInvestment {
  id: number
  investmentType: InvestmentTypeId | string
  name: string
  symbol: string
  quantity: number
  purchasePrice: number
  currentPrice: number
  purchaseDate: string
  notes: string
  category: string
  riskLevel: RiskLevel
  metadata: Record<string, unknown>
  currency: InvestmentCurrency
  createdAt: string
  updatedAt: string
  investedValue: number
  currentValue: number
  profitLoss: number
  profitLossPercent: number
}

export interface InvestmentUpsertInput {
  investmentType: InvestmentTypeId
  name: string
  symbol: string | null
  quantity: number
  purchasePrice: number
  currentPrice: number
  purchaseDate: Date
  notes: string | null
  category: string | null
  riskLevel: RiskLevel
  currencyId: number
  metadata: Record<string, unknown>
}

export const INVESTMENT_TYPE_DEFINITIONS: Record<InvestmentTypeId, InvestmentTypeDefinition> = {
  stock: {
    id: 'stock',
    label: 'Hisse Senedi',
    shortLabel: 'Hisse',
    description: 'BIST ve global hisseler için izleme ve pozisyon yönetimi.',
    defaultCategory: 'Hisse Senedi',
    defaultRiskLevel: 'medium',
  },
  fund: {
    id: 'fund',
    label: 'Yatırım Fonu',
    shortLabel: 'Fon',
    description: 'TEFAS ve diğer fon ürünlerini tek ekrandan yönetin.',
    defaultCategory: 'Yatırım Fonu',
    defaultRiskLevel: 'low',
  },
  bond: {
    id: 'bond',
    label: 'Tahvil / Bono',
    shortLabel: 'Tahvil',
    description: 'Sabit getirili ürünlerde kupon ve vade detaylarını takip edin.',
    defaultCategory: 'Tahvil / Bono',
    defaultRiskLevel: 'low',
  },
  crypto: {
    id: 'crypto',
    label: 'Kripto Para',
    shortLabel: 'Kripto',
    description: 'Kripto portföyünüzü canlı fiyat ve performansla izleyin.',
    defaultCategory: 'Kripto Para',
    defaultRiskLevel: 'high',
  },
  commodity: {
    id: 'commodity',
    label: 'Emtia',
    shortLabel: 'Emtia',
    description: 'Altın, gümüş, petrol ve diğer emtia ürünleri.',
    defaultCategory: 'Emtia',
    defaultRiskLevel: 'medium',
  },
  forex: {
    id: 'forex',
    label: 'Doviz',
    shortLabel: 'Doviz',
    description: 'Pariteleri ve kur bazli pozisyonlari takip edin.',
    defaultCategory: 'Doviz',
    defaultRiskLevel: 'high',
  },
  'real-estate': {
    id: 'real-estate',
    label: 'Gayrimenkul',
    shortLabel: 'Gayrimenkul',
    description: 'Degerleme ve kira geliri odakli fiziksel varlik takibi.',
    defaultCategory: 'Gayrimenkul',
    defaultRiskLevel: 'medium',
  },
  other: {
    id: 'other',
    label: 'Diger Arac',
    shortLabel: 'Diger',
    description: 'Opsiyon, vadeli islem veya ozel enstrumanlar icin esnek giris.',
    defaultCategory: 'Diger Arac',
    defaultRiskLevel: 'high',
  },
}

export const INVESTMENT_TYPE_OPTIONS = INVESTMENT_TYPE_IDS.map(
  investmentType => INVESTMENT_TYPE_DEFINITIONS[investmentType]
)

export const RISK_LEVEL_OPTIONS: Array<{ value: RiskLevel; label: string }> = [
  { value: 'low', label: 'Dusuk Risk' },
  { value: 'medium', label: 'Orta Risk' },
  { value: 'high', label: 'Yuksek Risk' },
]

export function parseNumberLike(value: unknown, fallback = 0): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback
  }

  if (typeof value === 'string') {
    const normalized = value.trim().replace(/\s/g, '').replace(/,/g, '.')
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  return fallback
}

export function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function normalizeRiskLevel(value: unknown, fallback: RiskLevel = 'medium'): RiskLevel {
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value
  }

  return fallback
}

export function normalizeInvestmentType(value: unknown): InvestmentTypeId | null {
  if (typeof value !== 'string') {
    return null
  }

  return INVESTMENT_TYPE_IDS.includes(value as InvestmentTypeId)
    ? (value as InvestmentTypeId)
    : null
}

export function normalizeMetadata(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return { ...(value as Record<string, unknown>) }
  }

  return {}
}

function normalizeDateString(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString()
  }

  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
  }

  return new Date().toISOString()
}

export function normalizeInvestment(raw: InvestmentApiRecord): NormalizedInvestment {
  const normalizedType =
    normalizeInvestmentType(raw.investmentType) ?? (normalizeText(raw.investmentType) || 'other')
  const definition =
    normalizedType in INVESTMENT_TYPE_DEFINITIONS
      ? INVESTMENT_TYPE_DEFINITIONS[normalizedType as InvestmentTypeId]
      : INVESTMENT_TYPE_DEFINITIONS.other

  const quantity = parseNumberLike(raw.quantity, 0)
  const purchasePrice = parseNumberLike(raw.purchasePrice, 0)
  const currentPrice = parseNumberLike(raw.currentPrice, purchasePrice)
  const investedValue = quantity * purchasePrice
  const currentValue = quantity * currentPrice
  const profitLoss = currentValue - investedValue
  const profitLossPercent = investedValue > 0 ? (profitLoss / investedValue) * 100 : 0

  return {
    id: raw.id,
    investmentType: normalizedType,
    name: normalizeText(raw.name) || definition.label,
    symbol: normalizeText(raw.symbol),
    quantity,
    purchasePrice,
    currentPrice,
    purchaseDate: normalizeDateString(raw.purchaseDate),
    notes: normalizeText(raw.notes),
    category: normalizeText(raw.category) || definition.defaultCategory,
    riskLevel: normalizeRiskLevel(raw.riskLevel, definition.defaultRiskLevel),
    metadata: normalizeMetadata(raw.metadata),
    currency: {
      id: Number(raw.currency?.id ?? 0),
      code: normalizeText(raw.currency?.code) || 'TRY',
      name: normalizeText(raw.currency?.name) || 'Turk Lirasi',
      symbol: normalizeText(raw.currency?.symbol) || undefined,
    },
    createdAt: normalizeDateString(raw.createdAt),
    updatedAt: normalizeDateString(raw.updatedAt),
    investedValue,
    currentValue,
    profitLoss,
    profitLossPercent,
  }
}

export function serializeInvestmentRecord(record: {
  id: number
  investmentType: string
  name: string
  symbol: string | null
  quantity: { toString(): string }
  purchasePrice: { toString(): string }
  currentPrice: { toString(): string } | null
  purchaseDate: Date
  notes: string | null
  category: string | null
  riskLevel: string
  metadata: unknown
  currency: InvestmentCurrency
  createdAt: Date
  updatedAt: Date
}) {
  return {
    ...record,
    quantity: record.quantity.toString(),
    purchasePrice: record.purchasePrice.toString(),
    currentPrice: record.currentPrice?.toString() ?? null,
    purchaseDate: record.purchaseDate.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    metadata: normalizeMetadata(record.metadata),
  }
}

export function buildInvestmentUpsertInput(
  body: unknown,
  options?: {
    fallbackType?: InvestmentTypeId
    preserveMetadata?: Record<string, unknown>
  }
): { data?: InvestmentUpsertInput; error?: string } {
  const raw = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  const investmentType =
    normalizeInvestmentType(raw.investmentType ?? raw.type) ?? options?.fallbackType ?? null

  if (!investmentType) {
    return { error: 'Gecerli bir yatirim turu seciniz' }
  }

  const definition = INVESTMENT_TYPE_DEFINITIONS[investmentType]
  const name = normalizeText(raw.name)
  const symbol = normalizeText(raw.symbol)
  const quantity = parseNumberLike(raw.quantity, investmentType === 'real-estate' ? 1 : 0)
  const purchasePrice = parseNumberLike(
    raw.purchasePrice,
    investmentType === 'real-estate' ? parseNumberLike(raw.currentPrice, 0) : 0
  )
  const currentPrice = parseNumberLike(raw.currentPrice, purchasePrice)
  const currencyId = Math.trunc(parseNumberLike(raw.currencyId, 0))
  const category = normalizeText(raw.category) || definition.defaultCategory
  const riskLevel = normalizeRiskLevel(raw.riskLevel, definition.defaultRiskLevel)
  const notes = normalizeText(raw.notes ?? raw.description)
  const purchaseDateString = normalizeText(raw.purchaseDate)
  const parsedDate = purchaseDateString ? new Date(purchaseDateString) : new Date()
  const metadata = {
    ...normalizeMetadata(options?.preserveMetadata),
    ...normalizeMetadata(raw.metadata),
  }

  if (!name) {
    return { error: 'Yatirim adi zorunludur' }
  }

  if (!currencyId || currencyId <= 0) {
    return { error: 'Gecerli bir para birimi seciniz' }
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { error: 'Miktar sifirdan buyuk olmali' }
  }

  if (!Number.isFinite(purchasePrice) || purchasePrice <= 0) {
    return { error: 'Alis fiyati sifirdan buyuk olmali' }
  }

  if (!Number.isFinite(currentPrice) || currentPrice < 0) {
    return { error: 'Guncel fiyat negatif olamaz' }
  }

  if (Number.isNaN(parsedDate.getTime())) {
    return { error: 'Gecerli bir alis tarihi seciniz' }
  }

  return {
    data: {
      investmentType,
      name,
      symbol: symbol || null,
      quantity,
      purchasePrice,
      currentPrice,
      purchaseDate: parsedDate,
      notes: notes || null,
      category: category || null,
      riskLevel,
      currencyId,
      metadata,
    },
  }
}

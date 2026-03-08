export type AutoPaymentFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export type AutoPaymentSourceType =
  | 'account'
  | 'creditCard'
  | 'eWallet'
  | 'beneficiary'
  | 'none'

export interface AutoPaymentCurrency {
  id: number
  code: string
  name?: string | null
  symbol?: string | null
}

export interface AutoPaymentRelationOption {
  id: number
  name: string
}

export interface AutoPaymentApiRecord {
  id: number
  name: string
  description?: string | null
  amount: number | string | null
  currencyId: number
  paymentMethodId: number
  cronSchedule?: string | null
  frequency?: string | null
  nextPaymentDate?: string | null
  active?: boolean
  createdAt?: string | null
  updatedAt?: string | null
  periodId?: number | null
  categoryId?: number | null
  category?: AutoPaymentRelationOption | null
  currency?: AutoPaymentCurrency | null
  paymentMethod?: AutoPaymentRelationOption & { code?: string | null }
  accountId?: number | null
  creditCardId?: number | null
  eWalletId?: number | null
  beneficiaryId?: number | null
  account?: (AutoPaymentRelationOption & {
    bank?: { name?: string | null } | null
  }) | null
  creditCard?: (AutoPaymentRelationOption & {
    bank?: { name?: string | null } | null
  }) | null
  eWallet?: (AutoPaymentRelationOption & {
    provider?: string | null
  }) | null
  beneficiary?: (AutoPaymentRelationOption & {
    bank?: { name?: string | null } | null
    iban?: string | null
  }) | null
}

export interface NormalizedAutoPayment {
  id: number
  name: string
  description: string | null
  amount: number
  currencyId: number
  paymentMethodId: number
  cronSchedule: string
  frequency: AutoPaymentFrequency
  nextPaymentDate: string | null
  active: boolean
  createdAt: string | null
  updatedAt: string | null
  periodId: number | null
  categoryId: number | null
  category: AutoPaymentRelationOption | null
  currency: Required<AutoPaymentCurrency>
  paymentMethod: (AutoPaymentRelationOption & { code: string }) | null
  accountId: number | null
  creditCardId: number | null
  eWalletId: number | null
  beneficiaryId: number | null
  account: AutoPaymentApiRecord['account'] | null
  creditCard: AutoPaymentApiRecord['creditCard'] | null
  eWallet: AutoPaymentApiRecord['eWallet'] | null
  beneficiary: AutoPaymentApiRecord['beneficiary'] | null
  sourceType: AutoPaymentSourceType
  sourceId: number | null
  sourceName: string | null
  sourceSubtitle: string | null
}

export interface AutoPaymentUpsertInput {
  name: string
  description: string | null
  amount: number
  currencyId: number
  paymentMethodId: number
  categoryId: number
  frequency: AutoPaymentFrequency
  cronSchedule: string
  nextPaymentDate: Date | null
  active: boolean
  accountId: number | null
  creditCardId: number | null
  eWalletId: number | null
  beneficiaryId: number | null
}

export const AUTO_PAYMENT_FREQUENCY_OPTIONS: Array<{
  id: AutoPaymentFrequency
  label: string
  description: string
}> = [
  { id: 'daily', label: 'Gunluk', description: 'Her gun hatirlatma veya talimat' },
  { id: 'weekly', label: 'Haftalik', description: 'Her hafta ayni gun' },
  { id: 'monthly', label: 'Aylik', description: 'Aylik abonelik ve fatura akisi' },
  { id: 'yearly', label: 'Yillik', description: 'Yilda bir yenilenen odemeler' },
]

const CRON_BY_FREQUENCY: Record<AutoPaymentFrequency, string> = {
  daily: '0 0 * * *',
  weekly: '0 0 * * 0',
  monthly: '0 0 1 * *',
  yearly: '0 0 1 1 *',
}

export function parseNumberLike(value: unknown, fallback = 0): number {
  const parsed =
    typeof value === 'string'
      ? Number(value.replace(/\s/g, '').replace(',', '.'))
      : Number(value)

  return Number.isFinite(parsed) ? parsed : fallback
}

export function normalizeFrequency(
  value: unknown,
  fallback: AutoPaymentFrequency = 'monthly'
): AutoPaymentFrequency {
  if (typeof value !== 'string') {
    return fallback
  }

  const normalized = value.trim().toLowerCase()
  if (normalized === 'daily' || normalized === 'gunluk') {
    return 'daily'
  }
  if (normalized === 'weekly' || normalized === 'haftalik') {
    return 'weekly'
  }
  if (normalized === 'monthly' || normalized === 'aylik') {
    return 'monthly'
  }
  if (normalized === 'yearly' || normalized === 'annual' || normalized === 'yillik') {
    return 'yearly'
  }

  return fallback
}

export function cronScheduleFromFrequency(frequency: unknown): string {
  return CRON_BY_FREQUENCY[normalizeFrequency(frequency)]
}

export function frequencyFromCronSchedule(cronSchedule: unknown): AutoPaymentFrequency {
  if (typeof cronSchedule !== 'string' || !cronSchedule.trim()) {
    return 'monthly'
  }

  const normalized = cronSchedule.trim()

  if (normalized === CRON_BY_FREQUENCY.daily) {
    return 'daily'
  }
  if (normalized === CRON_BY_FREQUENCY.weekly) {
    return 'weekly'
  }
  if (normalized === CRON_BY_FREQUENCY.yearly) {
    return 'yearly'
  }
  if (normalized === CRON_BY_FREQUENCY.monthly) {
    return 'monthly'
  }

  return 'monthly'
}

export function getFrequencyLabel(frequency: AutoPaymentFrequency) {
  return AUTO_PAYMENT_FREQUENCY_OPTIONS.find(option => option.id === frequency)?.label ?? 'Aylik'
}

export function getSourceType(input: {
  accountId?: number | null
  creditCardId?: number | null
  eWalletId?: number | null
  beneficiaryId?: number | null
}): AutoPaymentSourceType {
  if (input.accountId) {
    return 'account'
  }
  if (input.creditCardId) {
    return 'creditCard'
  }
  if (input.eWalletId) {
    return 'eWallet'
  }
  if (input.beneficiaryId) {
    return 'beneficiary'
  }

  return 'none'
}

export function normalizeAutoPayment(record: AutoPaymentApiRecord): NormalizedAutoPayment {
  const frequency = record.frequency
    ? normalizeFrequency(record.frequency)
    : frequencyFromCronSchedule(record.cronSchedule)
  const sourceType = getSourceType(record)

  const sourceMeta =
    sourceType === 'account'
      ? {
          id: record.accountId ?? null,
          name: record.account?.name ?? null,
          subtitle: record.account?.bank?.name ?? null,
        }
      : sourceType === 'creditCard'
        ? {
            id: record.creditCardId ?? null,
            name: record.creditCard?.name ?? null,
            subtitle: record.creditCard?.bank?.name ?? null,
          }
        : sourceType === 'eWallet'
          ? {
              id: record.eWalletId ?? null,
              name: record.eWallet?.name ?? null,
              subtitle: record.eWallet?.provider ?? null,
            }
          : sourceType === 'beneficiary'
            ? {
                id: record.beneficiaryId ?? null,
                name: record.beneficiary?.name ?? null,
                subtitle: record.beneficiary?.bank?.name ?? record.beneficiary?.iban ?? null,
              }
            : {
                id: null,
                name: null,
                subtitle: null,
              }

  return {
    id: record.id,
    name: record.name,
    description: record.description ?? null,
    amount: parseNumberLike(record.amount),
    currencyId: record.currencyId,
    paymentMethodId: record.paymentMethodId,
    cronSchedule: record.cronSchedule?.trim() || cronScheduleFromFrequency(frequency),
    frequency,
    nextPaymentDate: record.nextPaymentDate ?? null,
    active: record.active ?? true,
    createdAt: record.createdAt ?? null,
    updatedAt: record.updatedAt ?? null,
    periodId: record.periodId ?? null,
    categoryId: record.categoryId ?? record.category?.id ?? null,
    category: record.category
      ? {
          id: record.category.id,
          name: record.category.name,
        }
      : null,
    currency: {
      id: record.currency?.id ?? record.currencyId,
      code: record.currency?.code ?? 'TRY',
      name: record.currency?.name ?? 'Turkish Lira',
      symbol: record.currency?.symbol ?? record.currency?.code ?? 'TRY',
    },
    paymentMethod: record.paymentMethod
      ? {
          id: record.paymentMethod.id,
          name: record.paymentMethod.name,
          code: record.paymentMethod.code ?? '',
        }
      : null,
    accountId: record.accountId ?? null,
    creditCardId: record.creditCardId ?? null,
    eWalletId: record.eWalletId ?? null,
    beneficiaryId: record.beneficiaryId ?? null,
    account: record.account ?? null,
    creditCard: record.creditCard ?? null,
    eWallet: record.eWallet ?? null,
    beneficiary: record.beneficiary ?? null,
    sourceType,
    sourceId: sourceMeta.id,
    sourceName: sourceMeta.name,
    sourceSubtitle: sourceMeta.subtitle,
  }
}

export function serializeAutoPaymentRecord(record: {
  id: number
  name: string
  description: string | null
  amount: { toString(): string }
  currencyId: number
  paymentMethodId: number
  cronSchedule: string
  nextPaymentDate: Date | null
  active: boolean
  createdAt: Date
  updatedAt: Date
  periodId: number | null
  categoryId: number
  accountId: number | null
  creditCardId: number | null
  eWalletId: number | null
  beneficiaryId: number | null
  category?: { id: number; name: string } | null
  currency?: { id: number; code: string; name: string; symbol: string | null } | null
  paymentMethod?: { id: number; code: string; name: string } | null
  account?: { id: number; name: string; bank?: { name: string } | null } | null
  creditCard?: { id: number; name: string; bank?: { name: string } | null } | null
  eWallet?: { id: number; name: string; provider: string | null } | null
  beneficiary?: {
    id: number
    name: string
    iban: string | null
    bank?: { name: string } | null
  } | null
}) {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    amount: record.amount.toString(),
    currencyId: record.currencyId,
    paymentMethodId: record.paymentMethodId,
    cronSchedule: record.cronSchedule,
    frequency: frequencyFromCronSchedule(record.cronSchedule),
    nextPaymentDate: record.nextPaymentDate?.toISOString() ?? null,
    active: record.active,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    periodId: record.periodId,
    categoryId: record.categoryId,
    accountId: record.accountId,
    creditCardId: record.creditCardId,
    eWalletId: record.eWalletId,
    beneficiaryId: record.beneficiaryId,
    category: record.category ?? null,
    currency: record.currency
      ? {
          ...record.currency,
          symbol: record.currency.symbol ?? record.currency.code,
        }
      : null,
    paymentMethod: record.paymentMethod ?? null,
    account: record.account ?? null,
    creditCard: record.creditCard ?? null,
    eWallet: record.eWallet ?? null,
    beneficiary: record.beneficiary ?? null,
  }
}

function parsePositiveId(value: unknown): number | null {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function buildAutoPaymentInput(body: unknown): {
  data?: AutoPaymentUpsertInput
  error?: string
} {
  if (!body || typeof body !== 'object') {
    return { error: 'Gecerli bir otomatik odeme verisi gonderin.' }
  }

  const payload = body as Record<string, unknown>
  const name = typeof payload.name === 'string' ? payload.name.trim() : ''
  if (!name) {
    return { error: 'Talimat adi zorunludur.' }
  }

  const amount = parseNumberLike(payload.amount, NaN)
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: 'Tutar sifirdan buyuk olmalidir.' }
  }

  const currencyId = parsePositiveId(payload.currencyId)
  if (!currencyId) {
    return { error: 'Gecerli bir para birimi secin.' }
  }

  const paymentMethodId = parsePositiveId(payload.paymentMethodId)
  if (!paymentMethodId) {
    return { error: 'Gecerli bir odeme yontemi secin.' }
  }

  const categoryId = parsePositiveId(payload.categoryId)
  if (!categoryId) {
    return { error: 'Gecerli bir kategori secin.' }
  }

  const frequency = payload.frequency
    ? normalizeFrequency(payload.frequency)
    : frequencyFromCronSchedule(payload.cronSchedule)
  const cronSchedule =
    typeof payload.cronSchedule === 'string' && payload.cronSchedule.trim()
      ? payload.cronSchedule.trim()
      : cronScheduleFromFrequency(frequency)

  const nextPaymentDate =
    typeof payload.nextPaymentDate === 'string' && payload.nextPaymentDate.trim()
      ? new Date(payload.nextPaymentDate)
      : null

  if (nextPaymentDate && Number.isNaN(nextPaymentDate.getTime())) {
    return { error: 'Sonraki odeme tarihi gecersiz.' }
  }

  const accountId = parsePositiveId(payload.accountId)
  const creditCardId = parsePositiveId(payload.creditCardId)
  const eWalletId = parsePositiveId(payload.eWalletId)
  const beneficiaryId = parsePositiveId(payload.beneficiaryId)

  const selectedSourceCount = [accountId, creditCardId, eWalletId, beneficiaryId].filter(Boolean).length
  if (selectedSourceCount > 1) {
    return { error: 'Ayni anda yalnizca tek odeme kaynagi baglanabilir.' }
  }

  return {
    data: {
      name,
      description:
        typeof payload.description === 'string' && payload.description.trim()
          ? payload.description.trim()
          : null,
      amount,
      currencyId,
      paymentMethodId,
      categoryId,
      frequency,
      cronSchedule,
      nextPaymentDate,
      active: payload.active === undefined ? true : Boolean(payload.active),
      accountId,
      creditCardId,
      eWalletId,
      beneficiaryId,
    },
  }
}

import type { AutoPaymentReferenceData, AutoPaymentFormState } from './auto-payment-form'

export interface AutoPaymentReferenceApiResponse {
  categories?: Array<Record<string, unknown>>
  paymentMethods?: Array<Record<string, unknown>>
  refPaymentMethods?: Array<Record<string, unknown>>
  currencies?: Array<Record<string, unknown>>
  accounts?: Array<Record<string, unknown>>
  creditCards?: Array<Record<string, unknown>>
  eWallets?: Array<Record<string, unknown>>
  beneficiaries?: Array<Record<string, unknown>>
}

function normalizeList(list: unknown) {
  return Array.isArray(list) ? list : []
}

function toNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function buildAutoPaymentReferenceData(
  payload: AutoPaymentReferenceApiResponse
): AutoPaymentReferenceData {
  const paymentMethods =
    normalizeList(payload.refPaymentMethods).length > 0
      ? normalizeList(payload.refPaymentMethods)
      : normalizeList(payload.paymentMethods)

  return {
    categories: normalizeList(payload.categories).map(item => ({
      id: toNumber(item.id),
      name: String(item.name ?? ''),
      code: typeof item.code === 'string' ? item.code : undefined,
      description: typeof item.description === 'string' ? item.description : null,
    })),
    paymentMethods: paymentMethods.map(item => ({
      id: toNumber(item.id),
      name: String(item.name ?? ''),
      code: typeof item.code === 'string' ? item.code : undefined,
      description: typeof item.description === 'string' ? item.description : null,
    })),
    currencies: normalizeList(payload.currencies).map(item => ({
      id: toNumber(item.id),
      name: String(item.name ?? ''),
      code: typeof item.code === 'string' ? item.code : undefined,
      description: typeof item.symbol === 'string' ? item.symbol : null,
    })),
    accounts: normalizeList(payload.accounts).map(item => ({
      id: toNumber(item.id),
      name: String(item.name ?? ''),
      bank:
        item.bank && typeof item.bank === 'object'
          ? {
              id: toNumber((item.bank as Record<string, unknown>).id),
              name: String((item.bank as Record<string, unknown>).name ?? ''),
            }
          : null,
      currency:
        item.currency && typeof item.currency === 'object'
          ? {
              id: toNumber((item.currency as Record<string, unknown>).id),
              code: String((item.currency as Record<string, unknown>).code ?? ''),
              name: String((item.currency as Record<string, unknown>).name ?? ''),
            }
          : null,
    })),
    creditCards: normalizeList(payload.creditCards).map(item => ({
      id: toNumber(item.id),
      name: String(item.name ?? ''),
      bank:
        item.bank && typeof item.bank === 'object'
          ? {
              id: toNumber((item.bank as Record<string, unknown>).id),
              name: String((item.bank as Record<string, unknown>).name ?? ''),
            }
          : null,
      currency:
        item.currency && typeof item.currency === 'object'
          ? {
              id: toNumber((item.currency as Record<string, unknown>).id),
              code: String((item.currency as Record<string, unknown>).code ?? ''),
              name: String((item.currency as Record<string, unknown>).name ?? ''),
            }
          : null,
    })),
    eWallets: normalizeList(payload.eWallets).map(item => ({
      id: toNumber(item.id),
      name: String(item.name ?? ''),
      provider: typeof item.provider === 'string' ? item.provider : null,
      currency:
        item.currency && typeof item.currency === 'object'
          ? {
              id: toNumber((item.currency as Record<string, unknown>).id),
              code: String((item.currency as Record<string, unknown>).code ?? ''),
              name: String((item.currency as Record<string, unknown>).name ?? ''),
            }
          : null,
    })),
    beneficiaries: normalizeList(payload.beneficiaries).map(item => ({
      id: toNumber(item.id),
      name: String(item.name ?? ''),
      iban: typeof item.iban === 'string' ? item.iban : null,
      bank:
        item.bank && typeof item.bank === 'object'
          ? {
              id: toNumber((item.bank as Record<string, unknown>).id),
              name: String((item.bank as Record<string, unknown>).name ?? ''),
            }
          : null,
    })),
  }
}

export function getDefaultAutoPaymentSelections(referenceData: AutoPaymentReferenceData) {
  const defaultCurrency =
    referenceData.currencies.find(currency => currency.code === 'TRY') ?? referenceData.currencies[0]
  const defaultPaymentMethod =
    referenceData.paymentMethods.find(method => method.code === 'HAVALE_EFT') ??
    referenceData.paymentMethods[0]
  const defaultCategory = referenceData.categories[0]

  return {
    currencyId: defaultCurrency ? String(defaultCurrency.id) : '',
    paymentMethodId: defaultPaymentMethod ? String(defaultPaymentMethod.id) : '',
    categoryId: defaultCategory ? String(defaultCategory.id) : '',
  }
}

export function buildAutoPaymentPayload(formData: AutoPaymentFormState) {
  const sourceId = formData.sourceId ? Number(formData.sourceId) : null

  return {
    name: formData.name.trim(),
    description: formData.description.trim() || null,
    amount: Number(formData.amount),
    currencyId: Number(formData.currencyId),
    paymentMethodId: Number(formData.paymentMethodId),
    categoryId: Number(formData.categoryId),
    frequency: formData.frequency,
    nextPaymentDate: formData.nextPaymentDate || null,
    active: formData.active,
    accountId: formData.sourceType === 'account' ? sourceId : null,
    creditCardId: formData.sourceType === 'creditCard' ? sourceId : null,
    eWalletId: formData.sourceType === 'eWallet' ? sourceId : null,
    beneficiaryId: formData.sourceType === 'beneficiary' ? sourceId : null,
  }
}

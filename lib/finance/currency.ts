import type { PrismaClient } from '@prisma/client'

const FALLBACK_TRY_RATES: Record<string, number> = {
  TRY: 1,
  USD: 32,
  EUR: 35,
  GBP: 41,
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  if (value && typeof value === 'object' && 'toString' in value) {
    const parsed = Number.parseFloat(String(value))
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

export async function createCurrencyConverter(prisma: PrismaClient, targetCode = 'TRY') {
  const [currencies, fxRates] = await Promise.all([
    prisma.refCurrency.findMany({
      where: { active: true },
      select: { id: true, code: true },
    }),
    prisma.fxRate.findMany({
      orderBy: { rateDate: 'desc' },
      select: {
        fromCurrencyId: true,
        toCurrencyId: true,
        rate: true,
      },
    }),
  ])

  const codeById = new Map(currencies.map(currency => [currency.id, currency.code]))
  const latestRateMap = new Map<string, number>()

  for (const rate of fxRates) {
    const fromCode = codeById.get(rate.fromCurrencyId)
    const toCode = codeById.get(rate.toCurrencyId)
    if (!fromCode || !toCode) {
      continue
    }

    const directKey = `${fromCode}:${toCode}`
    if (!latestRateMap.has(directKey)) {
      latestRateMap.set(directKey, toNumber(rate.rate))
    }
  }

  const targetUpper = targetCode.toUpperCase()

  const resolveRate = (sourceCode: string) => {
    const sourceUpper = sourceCode.toUpperCase()
    if (sourceUpper === targetUpper) {
      return 1
    }

    const direct = latestRateMap.get(`${sourceUpper}:${targetUpper}`)
    if (direct) {
      return direct
    }

    const reverse = latestRateMap.get(`${targetUpper}:${sourceUpper}`)
    if (reverse) {
      return reverse === 0 ? 0 : 1 / reverse
    }

    const sourceTryRate = FALLBACK_TRY_RATES[sourceUpper]
    const targetTryRate = FALLBACK_TRY_RATES[targetUpper]
    if (sourceTryRate && targetTryRate) {
      const sourceToTry = sourceUpper === 'TRY' ? 1 : sourceTryRate
      const targetToTry = targetUpper === 'TRY' ? 1 : targetTryRate
      return sourceToTry / targetToTry
    }

    return 1
  }

  return {
    targetCurrencyCode: targetUpper,
    convertAmount: (amount: number, sourceCode = 'TRY') => amount * resolveRate(sourceCode),
    resolveRate,
  }
}

export function decimalToNumber(value: unknown): number {
  return toNumber(value)
}

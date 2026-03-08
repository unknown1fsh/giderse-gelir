import type { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { createCurrencyConverter, decimalToNumber } from './currency'

export interface NetWorthBreakdown {
  currency: string
  assets: {
    cash: number
    eWallets: number
    investments: number
    gold: number
    realEstate: number
    total: number
  }
  liabilities: {
    creditCards: number
    loans: number
    total: number
  }
  counts: {
    accounts: number
    eWallets: number
    investments: number
    goldItems: number
    creditCards: number
    loans: number
  }
}

export interface NetWorthSnapshotPoint {
  date: string
  totalAssets: number
  totalLiabilities: number
  netWorth: number
}

export interface NetWorthSummary {
  currency: string
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  breakdown: NetWorthBreakdown
  snapshots: NetWorthSnapshotPoint[]
}

function normalizeDate(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}

function inferLoanRemainingBalance(totalAmount: number, installmentCount: number, remainingInstallments: number, monthlyPayment: number | null) {
  if (monthlyPayment && monthlyPayment > 0) {
    return remainingInstallments * monthlyPayment
  }

  if (installmentCount <= 0) {
    return totalAmount
  }

  return totalAmount * (remainingInstallments / installmentCount)
}

function isRealEstateInvestment(name: string | null | undefined) {
  if (!name) {
    return false
  }

  const normalized = name.toLowerCase()
  return (
    normalized.includes('real_estate') ||
    normalized.includes('real estate') ||
    normalized.includes('gayrimenkul') ||
    normalized.includes('emlak')
  )
}

export async function getNetWorthSummary(
  prisma: PrismaClient,
  {
    userId,
    activePeriodId,
    snapshotCount = 12,
    persistSnapshot = true,
  }: {
    userId: number
    activePeriodId?: number | null
    snapshotCount?: number
    persistSnapshot?: boolean
  }
): Promise<NetWorthSummary> {
  const [user, accounts, creditCards, eWallets, goldItems, investments, loans] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        currency: true,
      },
    }),
    prisma.account.findMany({
      where: {
        userId,
        active: true,
        ...(activePeriodId ? { periodId: activePeriodId } : {}),
      },
      include: {
        currency: true,
      },
    }),
    prisma.creditCard.findMany({
      where: {
        userId,
        active: true,
        ...(activePeriodId ? { periodId: activePeriodId } : {}),
      },
      include: {
        currency: true,
      },
    }),
    prisma.eWallet.findMany({
      where: {
        userId,
        active: true,
        ...(activePeriodId ? { periodId: activePeriodId } : {}),
      },
      include: {
        currency: true,
      },
    }),
    prisma.goldItem.findMany({
      where: {
        userId,
        ...(activePeriodId ? { periodId: activePeriodId } : {}),
      },
    }),
    prisma.investment.findMany({
      where: {
        userId,
        active: true,
        ...(activePeriodId ? { periodId: activePeriodId } : {}),
      },
      include: {
        currency: true,
      },
    }),
    prisma.loan.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        currency: true,
      },
    }),
  ])

  const preferredCurrency = user?.currency || 'TRY'
  const converter = await createCurrencyConverter(prisma, preferredCurrency)

  const cash = accounts.reduce(
    (sum, account) =>
      sum + converter.convertAmount(decimalToNumber(account.balance), account.currency.code),
    0
  )
  const eWalletsTotal = eWallets.reduce(
    (sum, wallet) =>
      sum + converter.convertAmount(decimalToNumber(wallet.balance), wallet.currency.code),
    0
  )
  const gold = goldItems.reduce((sum, item) => {
    const currentValue = decimalToNumber(item.currentValueTry ?? item.purchasePrice)
    return sum + converter.convertAmount(currentValue, 'TRY')
  }, 0)

  let investmentsTotal = 0
  let realEstateTotal = 0

  for (const investment of investments) {
    const currentPrice = decimalToNumber(investment.currentPrice ?? investment.purchasePrice)
    const quantity = decimalToNumber(investment.quantity)
    const currentValue = currentPrice * quantity
    const convertedValue = converter.convertAmount(currentValue, investment.currency.code)

    if (
      isRealEstateInvestment(investment.investmentType) ||
      isRealEstateInvestment(investment.category)
    ) {
      realEstateTotal += convertedValue
    } else {
      investmentsTotal += convertedValue
    }
  }

  const creditCardDebt = creditCards.reduce((sum, card) => {
    const usedAmount = decimalToNumber(card.limitAmount) - decimalToNumber(card.availableLimit)
    return sum + converter.convertAmount(Math.max(usedAmount, 0), card.currency.code)
  }, 0)

  const loanDebt = loans.reduce((sum, loan) => {
    const totalAmount = decimalToNumber(loan.totalAmount)
    const monthlyPayment = loan.monthlyPayment ? decimalToNumber(loan.monthlyPayment) : null
    const remainingBalance = inferLoanRemainingBalance(
      totalAmount,
      loan.installmentCount,
      loan.remainingInstallments,
      monthlyPayment
    )

    return sum + converter.convertAmount(Math.max(remainingBalance, 0), loan.currency.code)
  }, 0)

  const totalAssets = cash + eWalletsTotal + gold + investmentsTotal + realEstateTotal
  const totalLiabilities = creditCardDebt + loanDebt
  const netWorth = totalAssets - totalLiabilities

  const breakdown: NetWorthBreakdown = {
    currency: converter.targetCurrencyCode,
    assets: {
      cash,
      eWallets: eWalletsTotal,
      investments: investmentsTotal,
      gold,
      realEstate: realEstateTotal,
      total: totalAssets,
    },
    liabilities: {
      creditCards: creditCardDebt,
      loans: loanDebt,
      total: totalLiabilities,
    },
    counts: {
      accounts: accounts.length,
      eWallets: eWallets.length,
      investments: investments.length,
      goldItems: goldItems.length,
      creditCards: creditCards.length,
      loans: loans.length,
    },
  }

  const snapshotDate = normalizeDate(new Date())

  if (persistSnapshot) {
    await prisma.portfolioSnapshot.upsert({
      where: {
        userId_snapshotDate: {
          userId,
          snapshotDate,
        },
      },
      create: {
        userId,
        snapshotDate,
        totalAssets: new Prisma.Decimal(totalAssets.toFixed(2)),
        totalLiabilities: new Prisma.Decimal(totalLiabilities.toFixed(2)),
        netWorth: new Prisma.Decimal(netWorth.toFixed(2)),
        breakdown: breakdown as unknown as Prisma.InputJsonValue,
      },
      update: {
        totalAssets: new Prisma.Decimal(totalAssets.toFixed(2)),
        totalLiabilities: new Prisma.Decimal(totalLiabilities.toFixed(2)),
        netWorth: new Prisma.Decimal(netWorth.toFixed(2)),
        breakdown: breakdown as unknown as Prisma.InputJsonValue,
      },
    })
  }

  const snapshots = await prisma.portfolioSnapshot.findMany({
    where: { userId },
    orderBy: { snapshotDate: 'desc' },
    take: snapshotCount,
  })

  return {
    currency: converter.targetCurrencyCode,
    totalAssets,
    totalLiabilities,
    netWorth,
    breakdown,
    snapshots: snapshots
      .map(snapshot => ({
        date: snapshot.snapshotDate.toISOString(),
        totalAssets: decimalToNumber(snapshot.totalAssets),
        totalLiabilities: decimalToNumber(snapshot.totalLiabilities),
        netWorth: decimalToNumber(snapshot.netWorth),
      }))
      .reverse(),
  }
}

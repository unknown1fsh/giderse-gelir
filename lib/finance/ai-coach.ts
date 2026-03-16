import { PrismaClient } from '@prisma/client'

interface AICoachContext {
  userId: number
  activePeriodId?: number
}

interface MonthlyTotals {
  income: number
  expense: number
}

interface DebtSnapshot {
  totalDebt: number
  totalMinimumPayment: number
  cards: Array<{
    id: number
    name: string
    debt: number
    minimumPayment: number
    utilizationRate: number
  }>
  loans: Array<{
    id: number
    name: string
    debt: number
    monthlyPayment: number
  }>
}

export interface AICoachResult {
  period: {
    startDate: string
    endDate: string
  }
  summary: {
    totalIncome: number
    totalExpense: number
    netCashflow: number
    savingsRate: number
    overspendAmount: number
  }
  topExpenseCategories: Array<{
    category: string
    amount: number
    percentage: number
  }>
  debt: DebtSnapshot
  financialHealthScore: {
    score: number
    grade: 'A' | 'B' | 'C' | 'D' | 'E'
    reasons: string[]
  }
  actionPlan: {
    quickWins: string[]
    debtSnowball: string[]
    investmentPotentialMonthly: number
  }
}

const round2 = (value: number) => Math.round(value * 100) / 100

function toGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'E' {
  if (score >= 85) {return 'A'}
  if (score >= 70) {return 'B'}
  if (score >= 55) {return 'C'}
  if (score >= 40) {return 'D'}
  return 'E'
}

function monthStartEnd(monthsBack = 1) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(endDate.getMonth() - monthsBack)
  return { startDate, endDate }
}

function calculateMonthlyTotalsByType(
  transactions: Array<{ amount: number; txTypeCode: string }>
): MonthlyTotals {
  return transactions.reduce(
    (acc, transaction) => {
      if (transaction.txTypeCode === 'GELIR') {
        acc.income += transaction.amount
      } else if (transaction.txTypeCode === 'GIDER') {
        acc.expense += transaction.amount
      }
      return acc
    },
    { income: 0, expense: 0 }
  )
}

function buildScore(input: {
  savingsRate: number
  netCashflow: number
  topCategoryShare: number
  creditUtilizationAvg: number
}): { score: number; reasons: string[] } {
  let score = 100
  const reasons: string[] = []

  if (input.savingsRate < 10) {
    score -= 25
    reasons.push('Tasarruf oranı düşük (%10 altı).')
  } else if (input.savingsRate < 20) {
    score -= 10
    reasons.push('Tasarruf oranı geliştirilebilir (%20 altı).')
  }

  if (input.netCashflow < 0) {
    score -= 20
    reasons.push('Aylık nakit akışı negatif.')
  }

  if (input.topCategoryShare > 35) {
    score -= 15
    reasons.push('Harcamalar tek bir kategoride yoğunlaşıyor (%35+).')
  }

  if (input.creditUtilizationAvg > 60) {
    score -= 15
    reasons.push('Kredi kartı kullanım oranı yüksek (%60+).')
  }

  if (reasons.length === 0) {
    reasons.push('Nakit akışı ve tasarruf oranı dengeli görünüyor.')
  }

  return { score: Math.max(0, Math.min(100, Math.round(score))), reasons }
}

export async function generateAICoachSummary(
  prisma: PrismaClient,
  context: AICoachContext
): Promise<AICoachResult> {
  const { startDate, endDate } = monthStartEnd(1)
  const txWhere: { userId: number; periodId?: number; transactionDate: { gte: Date; lte: Date } } = {
    userId: context.userId,
    transactionDate: {
      gte: startDate,
      lte: endDate,
    },
  }

  if (context.activePeriodId) {
    txWhere.periodId = context.activePeriodId
  }

  const [transactions, creditCards, loans] = await Promise.all([
    prisma.transaction.findMany({
      where: txWhere,
      select: {
        amount: true,
        txType: { select: { code: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.creditCard.findMany({
      where: { userId: context.userId, active: true },
      select: {
        id: true,
        name: true,
        limitAmount: true,
        availableLimit: true,
        minPaymentPercent: true,
      },
    }),
    prisma.loan.findMany({
      where: { userId: context.userId, isActive: true },
      select: {
        id: true,
        name: true,
        totalAmount: true,
        monthlyPayment: true,
      },
    }),
  ])

  const normalizedTransactions = transactions.map(t => ({
    amount: Number(t.amount),
    txTypeCode: t.txType.code,
    category: t.category.name,
  }))

  const totals = calculateMonthlyTotalsByType(normalizedTransactions)
  const netCashflow = totals.income - totals.expense
  const savingsRate = totals.income > 0 ? (netCashflow / totals.income) * 100 : 0
  const overspendAmount = Math.max(0, totals.expense - totals.income)

  const expenseByCategory = new Map<string, number>()
  for (const tx of normalizedTransactions) {
    if (tx.txTypeCode !== 'GIDER') {continue}
    expenseByCategory.set(tx.category, (expenseByCategory.get(tx.category) || 0) + tx.amount)
  }

  const topExpenseCategories = Array.from(expenseByCategory.entries())
    .map(([category, amount]) => ({
      category,
      amount: round2(amount),
      percentage: totals.expense > 0 ? round2((amount / totals.expense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  const debtCards = creditCards.map(card => {
    const limit = Number(card.limitAmount)
    const available = Number(card.availableLimit)
    const debt = Math.max(0, limit - available)
    const utilizationRate = limit > 0 ? (debt / limit) * 100 : 0
    const minimumPayment = debt * (Number(card.minPaymentPercent) / 100)
    return {
      id: card.id,
      name: card.name,
      debt: round2(debt),
      utilizationRate: round2(utilizationRate),
      minimumPayment: round2(minimumPayment),
    }
  })

  const debtLoans = loans.map(loan => ({
    id: loan.id,
    name: loan.name,
    debt: round2(Number(loan.totalAmount)),
    monthlyPayment: round2(Number(loan.monthlyPayment || 0)),
  }))

  const totalCardDebt = debtCards.reduce((sum, card) => sum + card.debt, 0)
  const totalLoanDebt = debtLoans.reduce((sum, loan) => sum + loan.debt, 0)
  const totalDebt = round2(totalCardDebt + totalLoanDebt)

  const totalMinimumPayment = round2(
    debtCards.reduce((sum, card) => sum + card.minimumPayment, 0) +
      debtLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0)
  )

  const highestCategoryShare = topExpenseCategories[0]?.percentage || 0
  const creditUtilizationAvg = debtCards.length > 0
    ? debtCards.reduce((sum, c) => sum + c.utilizationRate, 0) / debtCards.length
    : 0

  const scoreResult = buildScore({
    savingsRate,
    netCashflow,
    topCategoryShare: highestCategoryShare,
    creditUtilizationAvg,
  })

  const monthlyInvestmentPotential = round2(Math.max(0, netCashflow * 0.4))

  const quickWins: string[] = []
  if (topExpenseCategories[0]) {
    quickWins.push(`En yüksek gider kalemi: ${topExpenseCategories[0].category} (%${topExpenseCategories[0].percentage}). Bu kategoriyi %20 düşürmeyi hedefleyin.`)
  }
  if (creditUtilizationAvg > 60) {
    quickWins.push('Kredi kartı limit kullanım oranı yüksek. Limitin %30-40 bandına inmesi için aylık ek ödeme planı oluşturun.')
  }
  if (savingsRate < 20) {
    quickWins.push('Gelir geldiği gün en az %10 otomatik birikim talimatı verin.')
  }

  if (quickWins.length === 0) {
    quickWins.push('Harcama dağılımı dengeli. Mevcut tasarruf oranını koruyup yatırımı artırabilirsiniz.')
  }

  const debtSnowball = [...debtCards]
    .filter(card => card.debt > 0)
    .sort((a, b) => a.debt - b.debt)
    .map((card, index) => `${index + 1}. ${card.name}: ₺${card.debt} (min ödeme: ₺${card.minimumPayment})`)

  return {
    period: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    summary: {
      totalIncome: round2(totals.income),
      totalExpense: round2(totals.expense),
      netCashflow: round2(netCashflow),
      savingsRate: round2(savingsRate),
      overspendAmount: round2(overspendAmount),
    },
    topExpenseCategories,
    debt: {
      totalDebt,
      totalMinimumPayment,
      cards: debtCards,
      loans: debtLoans,
    },
    financialHealthScore: {
      score: scoreResult.score,
      grade: toGrade(scoreResult.score),
      reasons: scoreResult.reasons,
    },
    actionPlan: {
      quickWins,
      debtSnowball,
      investmentPotentialMonthly: monthlyInvestmentPotential,
    },
  }
}

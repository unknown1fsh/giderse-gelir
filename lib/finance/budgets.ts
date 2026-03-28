import type { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { createCurrencyConverter, decimalToNumber } from './currency'

export type BudgetPeriodType = 'weekly' | 'monthly'

export interface BudgetSummaryItem {
  categoryId: number
  categoryName: string
  categoryCode: string
  icon: string | null
  color: string | null
  budgeted: number
  spent: number
  remaining: number
  progress: number
  isOverBudget: boolean
  alertThreshold: number
  transactionCount: number
}

export interface BudgetSummary {
  planId: number | null
  planName: string
  periodType: BudgetPeriodType
  currency: string
  zeroBased: boolean
  startDate: string
  endDate: string
  totalIncome: number
  totalBudgeted: number
  totalSpent: number
  remainingBudget: number
  remainingToAssign: number
  overBudgetCount: number
  items: BudgetSummaryItem[]
}

function startOfWeek(date: Date) {
  const result = new Date(date)
  const day = result.getDay()
  const diff = day === 0 ? -6 : 1 - day
  result.setDate(result.getDate() + diff)
  result.setHours(0, 0, 0, 0)
  return result
}

function endOfWeek(date: Date) {
  const result = startOfWeek(date)
  result.setDate(result.getDate() + 6)
  result.setHours(23, 59, 59, 999)
  return result
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function getBudgetWindow(referenceDate: Date, periodType: BudgetPeriodType) {
  return periodType === 'weekly'
    ? { startDate: startOfWeek(referenceDate), endDate: endOfWeek(referenceDate) }
    : { startDate: startOfMonth(referenceDate), endDate: endOfMonth(referenceDate) }
}

export async function getBudgetSummary(
  prisma: PrismaClient,
  {
    userId,
    activePeriodId,
    planId,
    periodType = 'monthly',
    referenceDate = new Date(),
  }: {
    userId: number
    activePeriodId?: number | null
    planId?: number | null
    periodType?: BudgetPeriodType
    referenceDate?: Date
  }
): Promise<BudgetSummary> {
  const { startDate, endDate } = getBudgetWindow(referenceDate, periodType)

  const [user, expenseType, currentPlan] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { currency: true },
    }),
    prisma.refTxType.findFirst({
      where: { code: 'GIDER' },
      select: { id: true },
    }),
    planId
      ? prisma.budgetPlan.findFirst({
          where: { id: planId, userId },
          include: {
            allocations: {
              include: {
                category: true,
              },
            },
          },
        })
      : prisma.budgetPlan.findFirst({
          where: {
            userId,
            active: true,
            periodType,
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
          include: {
            allocations: {
              include: {
                category: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        }),
  ])

  const converter = await createCurrencyConverter(prisma, user?.currency || 'TRY')

  const [categories, transactions] = await Promise.all([
    prisma.refTxCategory.findMany({
      where: expenseType
        ? {
            txTypeId: expenseType.id,
            active: true,
          }
        : { active: true },
      orderBy: { name: 'asc' },
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        ...(activePeriodId ? { periodId: activePeriodId } : {}),
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        txType: true,
        currency: true,
      },
    }),
  ])

  const actualsMap = new Map<number, { spent: number; transactionCount: number }>()

  let totalIncome = 0
  let totalSpent = 0

  for (const transaction of transactions) {
    const amount = converter.convertAmount(
      decimalToNumber(transaction.amount),
      transaction.currency.code
    )

    if (transaction.txType.code === 'GELIR') {
      totalIncome += amount
      continue
    }

    if (transaction.txType.code !== 'GIDER') {
      continue
    }

    totalSpent += amount

    const current = actualsMap.get(transaction.categoryId) ?? { spent: 0, transactionCount: 0 }
    actualsMap.set(transaction.categoryId, {
      spent: current.spent + amount,
      transactionCount: current.transactionCount + 1,
    })
  }

  const allocationMap = new Map(
    currentPlan?.allocations.map(allocation => [allocation.categoryId, allocation]) ?? []
  )
  const itemSources = categories

  const items: BudgetSummaryItem[] = itemSources.map(category => {
    const allocation = allocationMap.get(category.id)
    const actual = actualsMap.get(category.id)
    const budgeted = decimalToNumber(allocation?.amount ?? 0)
    const spent = actual?.spent ?? 0
    const remaining = budgeted - spent
    const progress = budgeted > 0 ? Math.min((spent / budgeted) * 100, 999) : 0
    const alertThreshold = decimalToNumber(allocation?.alertThreshold ?? 80)

    return {
      categoryId: category.id,
      categoryName: category.name,
      categoryCode: category.code,
      icon: category.icon,
      color: category.color,
      budgeted,
      spent,
      remaining,
      progress,
      isOverBudget: budgeted > 0 ? spent > budgeted : spent > 0,
      alertThreshold,
      transactionCount: actual?.transactionCount ?? 0,
    }
  })

  items.sort((left, right) => right.spent - left.spent)

  const totalBudgeted = items.reduce((sum, item) => sum + item.budgeted, 0)
  const overBudgetCount = items.filter(item => item.isOverBudget).length

  return {
    planId: currentPlan?.id ?? null,
    planName: currentPlan?.name ?? (periodType === 'weekly' ? 'Haftalık Bütçe' : 'Aylık Bütçe'),
    periodType,
    currency: converter.targetCurrencyCode,
    zeroBased: currentPlan?.zeroBased ?? true,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    totalIncome,
    totalBudgeted,
    totalSpent,
    remainingBudget: totalBudgeted - totalSpent,
    remainingToAssign: totalIncome - totalBudgeted,
    overBudgetCount,
    items,
  }
}

export async function saveBudgetPlan(
  prisma: PrismaClient,
  {
    userId,
    activePeriodId,
    periodType,
    startDate,
    endDate,
    currencyId,
    zeroBased,
    name,
    notes,
    allocations,
  }: {
    userId: number
    activePeriodId?: number | null
    periodType: BudgetPeriodType
    startDate: Date
    endDate: Date
    currencyId: number
    zeroBased: boolean
    name: string
    notes?: string
    allocations: Array<{
      categoryId: number
      amount: number
      alertThreshold?: number
      rolloverAmount?: number
    }>
  }
) {
  return prisma.$transaction(async tx => {
    const existingPlan = await tx.budgetPlan.findFirst({
      where: {
        userId,
        periodType,
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const totalBudgeted = allocations.reduce((sum, allocation) => sum + allocation.amount, 0)

    const plan = existingPlan
      ? await tx.budgetPlan.update({
          where: { id: existingPlan.id },
          data: {
            name,
            notes,
            periodId: activePeriodId ?? null,
            startDate,
            endDate,
            currencyId,
            zeroBased,
            totalBudgeted: new Prisma.Decimal(totalBudgeted.toFixed(2)),
            active: true,
          },
        })
      : await tx.budgetPlan.create({
          data: {
            userId,
            periodId: activePeriodId ?? null,
            name,
            periodType,
            startDate,
            endDate,
            currencyId,
            zeroBased,
            totalBudgeted: new Prisma.Decimal(totalBudgeted.toFixed(2)),
            notes,
            active: true,
          },
        })

    await tx.budgetAllocation.deleteMany({
      where: { budgetPlanId: plan.id },
    })

    if (allocations.length > 0) {
      await tx.budgetAllocation.createMany({
        data: allocations.map(allocation => ({
          budgetPlanId: plan.id,
          categoryId: allocation.categoryId,
          amount: new Prisma.Decimal(allocation.amount.toFixed(2)),
          alertThreshold: new Prisma.Decimal((allocation.alertThreshold ?? 80).toFixed(2)),
          rolloverAmount: new Prisma.Decimal((allocation.rolloverAmount ?? 0).toFixed(2)),
        })),
      })
    }

    return tx.budgetPlan.findUnique({
      where: { id: plan.id },
      include: {
        allocations: {
          include: {
            category: true,
          },
        },
      },
    })
  })
}

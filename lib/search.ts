import type { Prisma, PrismaClient } from '@prisma/client'

export interface TransactionQueryFilters {
  search: string
  categoryId: number | null
  txTypeId: number | null
  accountId: number | null
  creditCardId: number | null
  eWalletId: number | null
  tags: string[]
  startDate: Date | null
  endDate: Date | null
  minAmount: number | null
  maxAmount: number | null
  sortBy: 'transactionDate' | 'amount' | 'createdAt'
  sortDirection: 'asc' | 'desc'
  page: number
  limit: number
}

export interface SavedTransactionViewState {
  search: string
  categoryId: number | null
  txTypeId: number | null
  tags: string[]
  startDate: string | null
  endDate: string | null
  minAmount: number | null
  maxAmount: number | null
  sortBy: TransactionQueryFilters['sortBy']
  sortDirection: TransactionQueryFilters['sortDirection']
}

export interface GlobalSearchResultItem {
  id: string
  title: string
  subtitle: string
  href: string
  entityType: 'transaction' | 'account' | 'card' | 'goal' | 'autoPayment'
  meta?: string
}

function parseInteger(value: string | null, fallback: number | null = null) {
  if (!value) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseDecimal(value: string | null) {
  if (!value) {
    return null
  }

  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function parseTransactionFilters(searchParams: URLSearchParams): TransactionQueryFilters {
  const sortBy = searchParams.get('sortBy')
  const sortDirection = searchParams.get('sortDirection')
  const tags = searchParams
    .getAll('tag')
    .flatMap(tagValue => tagValue.split(','))
    .map(tag => tag.trim())
    .filter(Boolean)

  return {
    search: (searchParams.get('search') || '').trim(),
    categoryId: parseInteger(searchParams.get('categoryId')),
    txTypeId: parseInteger(searchParams.get('txTypeId')),
    accountId: parseInteger(searchParams.get('accountId')),
    creditCardId: parseInteger(searchParams.get('creditCardId')),
    eWalletId: parseInteger(searchParams.get('eWalletId')),
    tags,
    startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate') as string) : null,
    endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate') as string) : null,
    minAmount: parseDecimal(searchParams.get('minAmount')),
    maxAmount: parseDecimal(searchParams.get('maxAmount')),
    sortBy:
      sortBy === 'amount' || sortBy === 'createdAt' || sortBy === 'transactionDate'
        ? sortBy
        : 'transactionDate',
    sortDirection: sortDirection === 'asc' ? 'asc' : 'desc',
    page: clamp(parseInteger(searchParams.get('page'), 1) ?? 1, 1, 9999),
    limit: clamp(parseInteger(searchParams.get('limit'), 20) ?? 20, 1, 100),
  }
}

export function buildTransactionWhere(
  userId: number,
  activePeriodId: number | null | undefined,
  filters: TransactionQueryFilters
): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = {
    userId,
    ...(activePeriodId ? { periodId: activePeriodId } : {}),
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId
  }

  if (filters.txTypeId) {
    where.txTypeId = filters.txTypeId
  }

  if (filters.accountId) {
    where.accountId = filters.accountId
  }

  if (filters.creditCardId) {
    where.creditCardId = filters.creditCardId
  }

  if (filters.eWalletId) {
    where.eWalletId = filters.eWalletId
  }

  if (filters.tags.length > 0) {
    where.tags = {
      hasSome: filters.tags,
    }
  }

  if (filters.minAmount !== null || filters.maxAmount !== null) {
    where.amount = {
      ...(filters.minAmount !== null ? { gte: filters.minAmount } : {}),
      ...(filters.maxAmount !== null ? { lte: filters.maxAmount } : {}),
    }
  }

  if (filters.startDate || filters.endDate) {
    where.transactionDate = {
      ...(filters.startDate ? { gte: filters.startDate } : {}),
      ...(filters.endDate ? { lte: filters.endDate } : {}),
    }
  }

  if (filters.search) {
    const amountSearch = parseDecimal(filters.search)

    where.OR = [
      { description: { contains: filters.search, mode: 'insensitive' } },
      { notes: { contains: filters.search, mode: 'insensitive' } },
      { tags: { has: filters.search } },
      { category: { name: { contains: filters.search, mode: 'insensitive' } } },
      { paymentMethod: { name: { contains: filters.search, mode: 'insensitive' } } },
      ...(amountSearch !== null ? [{ amount: amountSearch }] : []),
    ]
  }

  return where
}

export function toSavedTransactionViewState(filters: TransactionQueryFilters): SavedTransactionViewState {
  return {
    search: filters.search,
    categoryId: filters.categoryId,
    txTypeId: filters.txTypeId,
    tags: filters.tags,
    startDate: filters.startDate?.toISOString() ?? null,
    endDate: filters.endDate?.toISOString() ?? null,
    minAmount: filters.minAmount,
    maxAmount: filters.maxAmount,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
  }
}

export async function runGlobalSearch(
  prisma: PrismaClient,
  {
    userId,
    query,
    activePeriodId,
    limit = 5,
  }: {
    userId: number
    query: string
    activePeriodId?: number | null
    limit?: number
  }
) {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    return {
      transactions: [] as GlobalSearchResultItem[],
      accounts: [] as GlobalSearchResultItem[],
      cards: [] as GlobalSearchResultItem[],
      goals: [] as GlobalSearchResultItem[],
      autoPayments: [] as GlobalSearchResultItem[],
    }
  }

  const [transactions, accounts, cards, goals, autoPayments] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        ...(activePeriodId ? { periodId: activePeriodId } : {}),
        OR: [
          { description: { contains: trimmedQuery, mode: 'insensitive' } },
          { notes: { contains: trimmedQuery, mode: 'insensitive' } },
          { tags: { has: trimmedQuery } },
          { category: { name: { contains: trimmedQuery, mode: 'insensitive' } } },
        ],
      },
      include: {
        category: true,
        txType: true,
      },
      orderBy: { transactionDate: 'desc' },
      take: limit,
    }),
    prisma.account.findMany({
      where: {
        userId,
        active: true,
        ...(activePeriodId ? { periodId: activePeriodId } : {}),
        OR: [
          { name: { contains: trimmedQuery, mode: 'insensitive' } },
          { iban: { contains: trimmedQuery, mode: 'insensitive' } },
          { accountNumber: { contains: trimmedQuery, mode: 'insensitive' } },
        ],
      },
      include: {
        bank: true,
        currency: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    }),
    prisma.creditCard.findMany({
      where: {
        userId,
        active: true,
        ...(activePeriodId ? { periodId: activePeriodId } : {}),
        OR: [
          { name: { contains: trimmedQuery, mode: 'insensitive' } },
          { bank: { name: { contains: trimmedQuery, mode: 'insensitive' } } },
        ],
      },
      include: {
        bank: true,
        currency: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    }),
    prisma.goal.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: trimmedQuery, mode: 'insensitive' } },
          { category: { contains: trimmedQuery, mode: 'insensitive' } },
          { notes: { contains: trimmedQuery, mode: 'insensitive' } },
        ],
      },
      include: {
        currency: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    }),
    prisma.autoPayment.findMany({
      where: {
        userId,
        active: true,
        OR: [
          { name: { contains: trimmedQuery, mode: 'insensitive' } },
          { description: { contains: trimmedQuery, mode: 'insensitive' } },
          { category: { name: { contains: trimmedQuery, mode: 'insensitive' } } },
        ],
      },
      include: {
        category: true,
      },
      orderBy: { nextPaymentDate: 'asc' },
      take: limit,
    }),
  ])

  return {
    transactions: transactions.map(transaction => ({
      id: `transaction-${transaction.id}`,
      title: transaction.description || transaction.category.name,
      subtitle: `${transaction.category.name} · ${transaction.txType.name}`,
      href: `/transactions?search=${encodeURIComponent(trimmedQuery)}`,
      entityType: 'transaction' as const,
      meta: new Date(transaction.transactionDate).toLocaleDateString('tr-TR'),
    })),
    accounts: accounts.map(account => ({
      id: `account-${account.id}`,
      title: account.name,
      subtitle: `${account.bank.name} · ${account.currency.code}`,
      href: `/accounts/${account.id}`,
      entityType: 'account' as const,
      meta: account.accountNumber || account.iban || 'Hesap',
    })),
    cards: cards.map(card => ({
      id: `card-${card.id}`,
      title: card.name,
      subtitle: `${card.bank.name} · ${card.currency.code}`,
      href: `/cards`,
      entityType: 'card' as const,
      meta: `Son odeme gunu ${card.dueDay}`,
    })),
    goals: goals.map(goal => ({
      id: `goal-${goal.id}`,
      title: goal.name,
      subtitle: `${goal.currency.code} · ${goal.status}`,
      href: `/goals`,
      entityType: 'goal' as const,
      meta: goal.category || 'Hedef',
    })),
    autoPayments: autoPayments.map(autoPayment => ({
      id: `autoPayment-${autoPayment.id}`,
      title: autoPayment.name,
      subtitle: autoPayment.category.name,
      href: `/auto-payments`,
      entityType: 'autoPayment' as const,
      meta: autoPayment.nextPaymentDate
        ? new Date(autoPayment.nextPaymentDate).toLocaleDateString('tr-TR')
        : 'Takvimlenmedi',
    })),
  }
}

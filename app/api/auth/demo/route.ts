import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/server/services/impl/AuthService'
import { setAuthCookie } from '@/lib/auth'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { ExceptionMapper } from '@/server/errors'
import { TooManyRequestsError } from '@/server/errors'
import { Prisma } from '@prisma/client'
import { getActivePeriod } from '@/lib/period-helpers'
import { getNetWorthSummary } from '@/lib/finance/net-worth'
import { getBudgetSummary } from '@/lib/finance/budgets'
import { syncNotificationEvents } from '@/lib/notifications/service'

// ─── In-memory cache ─────────────────────────────────────────────────────────
// Demo verisi read-only olduğu için her istek aynı veriyi döndürür.
// Cache sayesinde tekrarlanan tıklamalarda 6 DB sorgusu atlanır.
const CACHE_TTL = 5 * 60 * 1000 // 5 dakika

interface DemoDataCache {
  demoUser: { id: number; email: string; subscriptions: Array<{ planId: string }> }
  activePeriod: Awaited<ReturnType<typeof getActivePeriod>>
  prefetchedData: object
  cachedAt: number
}

let demoDataCache: DemoDataCache | null = null

function isCacheValid(): boolean {
  return demoDataCache !== null && Date.now() - demoDataCache.cachedAt < CACHE_TTL
}
// ─────────────────────────────────────────────────────────────────────────────

export const POST = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  const clientIp = getClientIp(request)
  const rateLimit = checkRateLimit(`demo:${clientIp}`, 10, 15 * 60 * 1000) // 10 istek/15 dakika

  if (!rateLimit.allowed) {
    throw new TooManyRequestsError(
      `Çok fazla demo denemesi. Lütfen ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} saniye sonra tekrar deneyin.`
    )
  }

  // Cache geçerliyse demoUser ve prefetchedData'yı DB'ye gitmeden al
  let demoUser: DemoDataCache['demoUser'] | null = null
  let activePeriod: DemoDataCache['activePeriod']
  let prefetchedData: object | null = null

  if (isCacheValid() && demoDataCache) {
    demoUser = demoDataCache.demoUser
    activePeriod = demoDataCache.activePeriod
    prefetchedData = demoDataCache.prefetchedData
  } else {
    // Cache yok ya da bayat — DB'den çek
    const dbUser = await prisma.user.findFirst({
      where: { role: 'DEMO', isActive: true },
      include: {
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'Demo hesabı şu an kullanılamıyor.' }, { status: 503 })
    }

    demoUser = dbUser
    activePeriod = await getActivePeriod(dbUser.id)
  }

  const plan = demoUser.subscriptions[0]?.planId || 'free'
  const authService = new AuthService(prisma)

  // Session oluştur (her zaman taze olmalı)
  const session = await authService.createDemoSession(demoUser.id, demoUser.email, plan, 'DEMO', clientIp)
  await setAuthCookie(session.token, session.expiresAt)

  // Cache geçerliyse prefetch sorgularını atla
  if (!prefetchedData) {
    try {
      const userId = demoUser.id
      const activePeriodId = activePeriod?.id

      const txPeriodFilter = activePeriod
        ? Prisma.sql`AND t.period_id = ${activePeriod.id}`
        : Prisma.empty
      const cardPeriodFilter = activePeriod
        ? Prisma.sql`AND cc.period_id = ${activePeriod.id}`
        : Prisma.empty

      void syncNotificationEvents(prisma, { userId, activePeriodId }).catch(() => {})

      const [kpiData, upcomingPayments, categoryBreakdown, netWorthSummary, budgetSummary, unreadCount] =
        await Promise.all([
          prisma.$queryRaw<
            Array<{
              total_income: bigint | null
              total_expense: bigint | null
              net_amount: bigint | null
              income_count: bigint | null
              expense_count: bigint | null
            }>
          >`
            SELECT
              COALESCE(SUM(CASE WHEN tt.code = 'GELIR' THEN t.amount ELSE 0 END), 0) as total_income,
              COALESCE(SUM(CASE WHEN tt.code = 'GIDER' THEN t.amount ELSE 0 END), 0) as total_expense,
              COALESCE(SUM(CASE WHEN tt.code = 'GELIR' THEN t.amount ELSE -t.amount END), 0) as net_amount,
              COUNT(CASE WHEN tt.code = 'GELIR' THEN 1 END) as income_count,
              COUNT(CASE WHEN tt.code = 'GIDER' THEN 1 END) as expense_count
            FROM transaction t
            JOIN ref_tx_type tt ON t.tx_type_id = tt.id
            WHERE t.user_id = ${userId}
              AND t.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
              ${txPeriodFilter}
          `,
          prisma.$queryRaw<
            Array<{
              id: number
              name: string
              bank_name: string
              limit_amount: bigint | null
              available_limit: bigint | null
              due_day: number
              next_due_date: Date
              current_debt: bigint | null
              min_payment: bigint | null
            }>
          >`
            SELECT
              cc.id,
              cc.name,
              b.name as bank_name,
              cc.limit_amount,
              cc.available_limit,
              cc.due_day,
              CASE
                WHEN EXTRACT(DAY FROM CURRENT_DATE) <= cc.due_day
                THEN DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day' + INTERVAL '1 day' * cc.due_day
                ELSE DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '2 month' - INTERVAL '1 day' + INTERVAL '1 day' * cc.due_day
              END as next_due_date,
              (cc.limit_amount - cc.available_limit) as current_debt,
              ((cc.limit_amount - cc.available_limit) * cc.min_payment_percent / 100) as min_payment
            FROM credit_card cc
            JOIN ref_bank b ON cc.bank_id = b.id
            WHERE cc.user_id = ${userId}
              AND cc.active = true
              ${cardPeriodFilter}
          `,
          prisma.$queryRaw<
            Array<{
              category_name: string
              tx_type_name: string
              total_amount: bigint | null
              transaction_count: bigint | null
            }>
          >`
            SELECT
              tc.name as category_name,
              tt.name as tx_type_name,
              SUM(t.amount) as total_amount,
              COUNT(*) as transaction_count
            FROM transaction t
            JOIN ref_tx_category tc ON t.category_id = tc.id
            JOIN ref_tx_type tt ON t.tx_type_id = tt.id
            WHERE t.user_id = ${userId}
              AND t.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
              ${txPeriodFilter}
            GROUP BY tc.name, tt.name, tc.id
            ORDER BY total_amount DESC
          `,
          getNetWorthSummary(prisma, { userId, activePeriodId }),
          getBudgetSummary(prisma, { userId, activePeriodId, periodType: 'monthly' }),
          prisma.notification.count({
            where: { userId, channel: 'in_app', readAt: null },
          }),
        ])

      const kpi = kpiData[0]
        ? {
            total_income: kpiData[0].total_income?.toString() || '0',
            total_expense: kpiData[0].total_expense?.toString() || '0',
            net_amount: kpiData[0].net_amount?.toString() || '0',
            income_count: kpiData[0].income_count?.toString() || '0',
            expense_count: kpiData[0].expense_count?.toString() || '0',
          }
        : { total_income: '0', total_expense: '0', net_amount: '0', income_count: '0', expense_count: '0' }

      prefetchedData = {
        kpi,
        upcomingPayments: upcomingPayments.map(p => ({
          ...p,
          limit_amount: p.limit_amount?.toString() || '0',
          available_limit: p.available_limit?.toString() || '0',
          current_debt: p.current_debt?.toString() || '0',
          min_payment: p.min_payment?.toString() || '0',
        })),
        categoryBreakdown: categoryBreakdown.map(c => ({
          ...c,
          total_amount: c.total_amount?.toString() || '0',
          transaction_count: c.transaction_count?.toString() || '0',
        })),
        assets: {
          totalAccountBalance: netWorthSummary.breakdown.assets.cash.toString(),
          totalGoldValue: netWorthSummary.breakdown.assets.gold.toString(),
          totalCardDebt: netWorthSummary.breakdown.liabilities.creditCards.toString(),
          totalAssets: netWorthSummary.totalAssets.toString(),
          totalLiabilities: netWorthSummary.totalLiabilities.toString(),
          netWorth: netWorthSummary.netWorth.toString(),
          breakdown: netWorthSummary.breakdown,
          snapshots: netWorthSummary.snapshots,
        },
        budgets: budgetSummary,
        notifications: { unreadCount },
      }

      // Cache'e kaydet
      demoDataCache = {
        demoUser,
        activePeriod,
        prefetchedData,
        cachedAt: Date.now(),
      }
    } catch {
      // Prefetch başarısız olursa dashboard kendi fetch'ini yapar
    }
  }

  return NextResponse.json({ success: true, prefetchedData })
})

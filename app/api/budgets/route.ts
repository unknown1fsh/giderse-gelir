import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActivePeriod, getCurrentUser } from '@/lib/auth'
import { getBudgetSummary, getBudgetWindow, saveBudgetPlan, type BudgetPeriodType } from '@/lib/finance/budgets'
import { syncNotificationEvents } from '@/lib/notifications/service'

function resolvePeriodType(value: string | null): BudgetPeriodType {
  return value === 'weekly' ? 'weekly' : 'monthly'
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const activePeriod = await getActivePeriod(request)
    const { searchParams } = new URL(request.url)
    const periodType = resolvePeriodType(searchParams.get('periodType'))
    const planId = searchParams.get('planId') ? Number(searchParams.get('planId')) : null
    const referenceDate = searchParams.get('referenceDate')
      ? new Date(searchParams.get('referenceDate') as string)
      : new Date()

    const summary = await getBudgetSummary(prisma, {
      userId: user.id,
      activePeriodId: activePeriod?.id,
      periodType,
      planId,
      referenceDate,
    })

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Budget GET error:', error)
    return NextResponse.json({ error: 'Butce verileri alinamadi' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const activePeriod = await getActivePeriod(request)
    const body = (await request.json()) as {
      periodType?: BudgetPeriodType
      name?: string
      currencyId?: number
      zeroBased?: boolean
      notes?: string
      referenceDate?: string
      allocations?: Array<{
        categoryId: number
        amount: number
        alertThreshold?: number
      }>
    }

    const periodType = resolvePeriodType(body.periodType ?? null)
    const referenceDate = body.referenceDate ? new Date(body.referenceDate) : new Date()
    const { startDate, endDate } = getBudgetWindow(referenceDate, periodType)

    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        currency: true,
      },
    })

    const currency =
      body.currencyId ||
      (await prisma.refCurrency.findFirst({
        where: { code: userRecord?.currency || 'TRY' },
        select: { id: true },
      }))?.id

    if (!currency) {
      return NextResponse.json({ error: 'Varsayılan para birimi bulunamadı' }, { status: 400 })
    }

    await saveBudgetPlan(prisma, {
      userId: user.id,
      activePeriodId: activePeriod?.id,
      periodType,
      startDate,
      endDate,
      currencyId: currency,
      zeroBased: body.zeroBased ?? true,
      name:
        body.name || (periodType === 'weekly' ? 'Haftalik Butce' : 'Aylik Butce'),
      notes: body.notes,
      allocations:
        body.allocations?.map(allocation => ({
          categoryId: allocation.categoryId,
          amount: Number(allocation.amount || 0),
          alertThreshold: allocation.alertThreshold,
        })) ?? [],
    })

    await syncNotificationEvents(prisma, {
      userId: user.id,
      activePeriodId: activePeriod?.id,
    })

    const summary = await getBudgetSummary(prisma, {
      userId: user.id,
      activePeriodId: activePeriod?.id,
      periodType,
      referenceDate,
    })

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Budget POST error:', error)
    return NextResponse.json({ error: 'Butce kaydedilemedi' }, { status: 500 })
  }
}

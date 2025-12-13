import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActivePeriod, getCurrentUser } from '@/lib/auth-refactored'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Kullanıcı doğrulama
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const activePeriod = await getActivePeriod(request)
    const txPeriodFilter = activePeriod ? Prisma.sql`AND t.period_id = ${activePeriod.id}` : Prisma.empty
    const cardPeriodFilter = activePeriod ? Prisma.sql`AND cc.period_id = ${activePeriod.id}` : Prisma.empty

    // Son 30 gün KPI'larını al (kullanıcı bazlı)
    const kpiData = await prisma.$queryRaw`
      SELECT 
        COALESCE(SUM(CASE WHEN tt.code = 'GELIR' THEN t.amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN tt.code = 'GIDER' THEN t.amount ELSE 0 END), 0) as total_expense,
        COALESCE(SUM(CASE WHEN tt.code = 'GELIR' THEN t.amount ELSE -t.amount END), 0) as net_amount,
        COUNT(CASE WHEN tt.code = 'GELIR' THEN 1 END) as income_count,
        COUNT(CASE WHEN tt.code = 'GIDER' THEN 1 END) as expense_count
      FROM transaction t
      JOIN ref_tx_type tt ON t.tx_type_id = tt.id
      WHERE t.user_id = ${user.id}
        AND t.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
        ${txPeriodFilter}
    `

    // Yaklaşan kart ödemeleri (kullanıcı bazlı)
    const upcomingPayments = await prisma.$queryRaw`
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
      WHERE cc.user_id = ${user.id}
        AND cc.active = true
        ${cardPeriodFilter}
    `

    // Kategori bazlı dağılım (kullanıcı bazlı)
    const categoryBreakdown = await prisma.$queryRaw`
      SELECT 
        tc.name as category_name,
        tt.name as tx_type_name,
        SUM(t.amount) as total_amount,
        COUNT(*) as transaction_count
      FROM transaction t
      JOIN ref_tx_category tc ON t.category_id = tc.id
      JOIN ref_tx_type tt ON t.tx_type_id = tt.id
      WHERE t.user_id = ${user.id}
        AND t.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
        ${txPeriodFilter}
      GROUP BY tc.name, tt.name, tc.id
      ORDER BY total_amount DESC
    `

    // ✅ TOPLAM VARLIK HESAPLAMA (Transaction'larla senkronize)
    // Hesap bakiyeleri toplamı
    const accountWhere: { userId: number; active: boolean; periodId?: number } = {
      userId: user.id,
      active: true,
    }
    const cardWhere: { userId: number; active: boolean; periodId?: number } = {
      userId: user.id,
      active: true,
    }
    const goldWhere: { userId: number; periodId?: number } = { userId: user.id }

    if (activePeriod) {
      accountWhere.periodId = activePeriod.id
      cardWhere.periodId = activePeriod.id
      goldWhere.periodId = activePeriod.id
    }

    const accountsData = await prisma.account.findMany({
      where: accountWhere,
      select: { balance: true },
    })
    const totalAccountBalance = accountsData.reduce((sum, acc) => sum + parseFloat(acc.balance.toString()), 0)

    // Kredi kartı borçları toplamı
    const cardsData = await prisma.creditCard.findMany({
      where: cardWhere,
      select: { limitAmount: true, availableLimit: true },
    })
    const totalCardDebt = cardsData.reduce((sum, card) => {
      const debt = parseFloat(card.limitAmount.toString()) - parseFloat(card.availableLimit.toString())
      return sum + debt
    }, 0)

    // Altın değeri toplamı
    const goldData = await prisma.goldItem.findMany({
      where: goldWhere,
      select: { currentValueTry: true, purchasePrice: true },
    })
    const totalGoldValue = goldData.reduce((sum, gold) => {
      const value = gold.currentValueTry ? parseFloat(gold.currentValueTry.toString()) : parseFloat(gold.purchasePrice.toString())
      return sum + value
    }, 0)

    const totalAssets = totalAccountBalance + totalGoldValue
    const netWorth = totalAssets - totalCardDebt

    // BigInt değerlerini string'e çevir
    const kpi = kpiData[0]
      ? {
          total_income: kpiData[0].total_income?.toString() || '0',
          total_expense: kpiData[0].total_expense?.toString() || '0',
          net_amount: kpiData[0].net_amount?.toString() || '0',
          income_count: kpiData[0].income_count?.toString() || '0',
          expense_count: kpiData[0].expense_count?.toString() || '0',
        }
      : {
          total_income: '0',
          total_expense: '0',
          net_amount: '0',
          income_count: '0',
          expense_count: '0',
        }

    const payments = upcomingPayments.map((payment: any) => ({
      ...payment,
      limit_amount: payment.limit_amount?.toString() || '0',
      available_limit: payment.available_limit?.toString() || '0',
      current_debt: payment.current_debt?.toString() || '0',
      min_payment: payment.min_payment?.toString() || '0',
    }))

    const categories = categoryBreakdown.map((category: any) => ({
      ...category,
      total_amount: category.total_amount?.toString() || '0',
      transaction_count: category.transaction_count?.toString() || '0',
    }))

    return NextResponse.json({
      kpi,
      upcomingPayments: payments,
      categoryBreakdown: categories,
      // ✅ Toplam Varlık Bilgileri (Transaction'larla senkronize)
      assets: {
        totalAccountBalance: totalAccountBalance.toString(),
        totalGoldValue: totalGoldValue.toString(),
        totalCardDebt: totalCardDebt.toString(),
        totalAssets: totalAssets.toString(),
        netWorth: netWorth.toString(),
      },
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Dashboard verileri alınamadı' }, { status: 500 })
  }
}

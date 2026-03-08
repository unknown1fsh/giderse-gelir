import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActivePeriod, getCurrentUser } from '@/lib/auth'
import { getNetWorthSummary } from '@/lib/finance/net-worth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const activePeriod = await getActivePeriod(request)
    const { searchParams } = new URL(request.url)
    const persistSnapshot = searchParams.get('persistSnapshot') !== 'false'

    const summary = await getNetWorthSummary(prisma, {
      userId: user.id,
      activePeriodId: activePeriod?.id,
      persistSnapshot,
    })

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Net worth GET error:', error)
    return NextResponse.json({ error: 'Net varlik verisi alinamadi' }, { status: 500 })
  }
}

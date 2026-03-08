import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActivePeriod, getCurrentUser } from '@/lib/auth'
import { runGlobalSearch } from '@/lib/search'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const activePeriod = await getActivePeriod(request)
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = Math.min(10, Math.max(1, Number(searchParams.get('limit') || '5')))

    const results = await runGlobalSearch(prisma, {
      userId: user.id,
      query,
      activePeriodId: activePeriod?.id,
      limit,
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search GET error:', error)
    return NextResponse.json({ error: 'Arama yapilamadi' }, { status: 500 })
  }
}

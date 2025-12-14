import { NextRequest, NextResponse } from 'next/server'
import { marketDataClient } from '@/server/clients/marketDataClient'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const region = searchParams.get('region') || undefined

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const results = await marketDataClient.searchFunds(q, region)
    return NextResponse.json({ results })
  } catch (error) {
    console.error('funds/search error', error)
    return NextResponse.json({ results: [] }, { status: 200 })
  }
}

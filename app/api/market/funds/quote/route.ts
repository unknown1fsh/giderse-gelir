import { NextRequest, NextResponse } from 'next/server'
import { marketDataClient } from '@/server/clients/marketDataClient'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    if (!symbol) {
      return NextResponse.json({ error: 'symbol gerekli' }, { status: 400 })
    }
    const quote = await marketDataClient.getFundQuote(symbol)
    return NextResponse.json({ quote: quote[0] || null })
  } catch (error) {
    console.error('funds/quote error', error)
    return NextResponse.json({ quote: null }, { status: 200 })
  }
}

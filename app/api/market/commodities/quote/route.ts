import { NextRequest, NextResponse } from 'next/server'
import { marketDataClient } from '@/server/clients/marketDataClient'

// Örnek semboller: GC=F (Altın), SI=F (Gümüş), CL=F (Ham Petrol)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    if (!symbol) {
      return NextResponse.json({ error: 'symbol gerekli' }, { status: 400 })
    }
    const quote = await marketDataClient.getCommodityQuote(symbol)
    return NextResponse.json({ quote })
  } catch (error) {
    console.error('commodities/quote error', error)
    return NextResponse.json({ quote: null }, { status: 200 })
  }
}

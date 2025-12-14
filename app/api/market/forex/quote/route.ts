import { NextRequest, NextResponse } from 'next/server'
import { marketDataClient } from '@/server/clients/marketDataClient'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pair = searchParams.get('pair')
    if (!pair) {
      return NextResponse.json({ error: 'pair gerekli' }, { status: 400 })
    }
    // Yahoo formatı: EURTRY=X, USDTRY=X gibi
    const symbol = pair.endsWith('=X') ? pair : `${pair}=X`
    const quote = await marketDataClient.getForexQuote(symbol)
    return NextResponse.json({ quote })
  } catch (error) {
    console.error('forex/quote error', error)
    return NextResponse.json({ quote: null }, { status: 200 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

// CoinGecko API - Ücretsiz, API key gerektirmez
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    if (search) {
      // Kripto ara
      const response = await fetch(`${COINGECKO_BASE}/search?query=${encodeURIComponent(search)}`)
      const data = await response.json()

      return NextResponse.json({
        coins: data.coins.slice(0, 10).map((coin: any) => ({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          thumb: coin.thumb,
        })),
      })
    }

    // Top 100 kripto para listesi (TRY cinsinden)
    const response = await fetch(
      `${COINGECKO_BASE}/coins/markets?vs_currency=try&order=market_cap_desc&per_page=100&page=1&sparkline=false`
    )

    if (!response.ok) {
      throw new Error('CoinGecko API hatası')
    }

    const data = await response.json()

    // Formatla
    const cryptos = data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      currentPrice: coin.current_price,
      marketCap: coin.market_cap,
      priceChange24h: coin.price_change_percentage_24h,
      high24h: coin.high_24h,
      low24h: coin.low_24h,
      rank: coin.market_cap_rank,
    }))

    return NextResponse.json(cryptos)
  } catch (error) {
    console.error('Kripto API hatası:', error)
    return NextResponse.json({ error: 'Kripto verileri alınamadı' }, { status: 500 })
  }
}

// Belirli bir kripto'nun fiyatını getir
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { coinId } = body

    const response = await fetch(
      `${COINGECKO_BASE}/simple/price?ids=${coinId}&vs_currencies=try,usd&include_24hr_change=true&include_market_cap=true`
    )

    const data = await response.json()

    return NextResponse.json(data[coinId] || {})
  } catch (error) {
    console.error('Kripto fiyat hatası:', error)
    return NextResponse.json({ error: 'Fiyat alınamadı' }, { status: 500 })
  }
}

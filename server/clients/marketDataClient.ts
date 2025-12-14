import { BaseHttpClient } from './BaseHttpClient'
import { DefaultClientConfig } from './ClientConfig'

type YahooSearchItem = {
  symbol: string
  shortname?: string
  longname?: string
  exchDisp?: string
  quoteType?: string
  typeDisp?: string
}

type YahooSearchResponse = {
  quotes: YahooSearchItem[]
}

type YahooQuoteItem = {
  symbol: string
  shortName?: string
  longName?: string
  regularMarketPrice?: number
  currency?: string
  exchange?: string
}

type YahooQuoteResponse = {
  quoteResponse: {
    result: YahooQuoteItem[]
  }
}

export class MarketDataClient extends BaseHttpClient {
  constructor() {
    super({
      ...DefaultClientConfig.getDefaultConfig(),
      baseUrl: 'https://query1.finance.yahoo.com',
      timeout: 10000,
    })
  }

  async searchStocks(query: string, region?: string) {
    const params = new URLSearchParams()
    params.set('q', query)
    if (region) {
      params.set('region', region)
    }
    params.set('lang', 'en-US')
    const data = await this.get<YahooSearchResponse>(`/v1/finance/search?${params.toString()}`)
    return (data.quotes || [])
      .filter(q => q.quoteType === 'EQUITY')
      .map(q => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        exchange: q.exchDisp || '',
        type: q.quoteType || 'EQUITY',
      }))
  }

  async getStockQuote(symbolOrSymbols: string | string[]) {
    const symbols = Array.isArray(symbolOrSymbols) ? symbolOrSymbols.join(',') : symbolOrSymbols
    const data = await this.get<YahooQuoteResponse>(
      `/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`
    )
    return (data.quoteResponse?.result || []).map(q => ({
      symbol: q.symbol,
      name: q.longName || q.shortName || q.symbol,
      price: q.regularMarketPrice ?? null,
      currency: q.currency || '',
      exchange: q.exchange || '',
    }))
  }

  async searchFunds(query: string, region?: string) {
    const params = new URLSearchParams()
    params.set('q', query)
    if (region) {
      params.set('region', region)
    }
    params.set('lang', 'en-US')
    const data = await this.get<YahooSearchResponse>(`/v1/finance/search?${params.toString()}`)
    return (data.quotes || [])
      .filter(q => q.quoteType === 'MUTUALFUND' || q.quoteType === 'ETF')
      .map(q => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        exchange: q.exchDisp || '',
        type: q.quoteType || 'FUND',
      }))
  }

  async getFundQuote(symbolOrSymbols: string | string[]) {
    return this.getStockQuote(symbolOrSymbols)
  }

  async getForexQuote(pairSymbol: string) {
    const data = await this.getStockQuote(pairSymbol)
    return data[0] || null
  }

  async getCommodityQuote(symbol: string) {
    const data = await this.getStockQuote(symbol)
    return data[0] || null
  }
}

export const marketDataClient = new MarketDataClient()

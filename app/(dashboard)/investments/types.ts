// Ortak tip tanımları
export interface Currency {
  id: number
  code: string
  name: string
  symbol?: string
}

export interface ReferenceData {
  currencies: Currency[]
}

export interface MarketSearchResult {
  symbol: string
  name: string
  exchange: string
  type: string
}

export interface MarketQuote {
  symbol: string
  name: string
  price: number | null
  currency: string
  exchange: string
}

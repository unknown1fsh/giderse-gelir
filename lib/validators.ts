import { z } from 'zod'

// Para birimi validasyonu
export const currencySchema = z.object({
  code: z.string().min(3).max(3),
  name: z.string().min(1).max(50),
  symbol: z.string().min(1).max(5),
})

// Hesap validasyonu
export const accountSchema = z.object({
  name: z.string().min(1, 'Hesap adı gereklidir').max(100, 'Hesap adı çok uzun'),
  accountTypeId: z.number().int().positive('Geçerli hesap türü seçiniz'),
  bankId: z.number().int().positive('Geçerli banka seçiniz'),
  currencyId: z.number().int().positive('Geçerli para birimi seçiniz'),
  balance: z.number().min(0, 'Bakiye negatif olamaz').default(0),
  accountNumber: z.string().optional(),
  iban: z.string().optional(),
})

// Kredi kartı validasyonu
export const creditCardSchema = z.object({
  name: z.string().min(1, 'Kart adı gereklidir').max(100, 'Kart adı çok uzun'),
  bankId: z.number().int().positive('Geçerli banka seçiniz'),
  currencyId: z.number().int().positive('Geçerli para birimi seçiniz'),
  limitAmount: z.number().positive('Limit pozitif olmalıdır'),
  availableLimit: z.number().min(0, 'Kullanılabilir limit negatif olamaz'),
  statementDay: z.number().int().min(1, 'Hesap kesim günü 1-31 arasında olmalıdır').max(31),
  dueDay: z.number().int().min(1, 'Vade günü 1-31 arasında olmalıdır').max(31),
  minPaymentPercent: z
    .number()
    .min(0)
    .max(100, 'Asgari ödeme yüzdesi 0-100 arasında olmalıdır')
    .default(3.0),
})

// İşlem validasyonu
// NOT: Hesap/Kart kontrolü backend'de yapılır (nakit ödemeler için opsiyonel)
export const transactionSchema = z.object({
  txTypeId: z.number().int().positive('Geçerli işlem türü seçiniz'),
  categoryId: z.number().int().positive('Geçerli kategori seçiniz'),
  paymentMethodId: z.number().int().positive('Geçerli ödeme yöntemi seçiniz'),
  accountId: z.number().int().positive().optional(),
  creditCardId: z.number().int().positive().optional(),
  eWalletId: z.number().int().positive().optional(),
  beneficiaryId: z.number().int().positive().optional(),
  amount: z.number().positive('Tutar pozitif olmalıdır'),
  currencyId: z.number().int().positive('Geçerli para birimi seçiniz'),
  transactionDate: z.date(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// Altın eşyası validasyonu
export const goldItemSchema = z.object({
  name: z.string().min(1, 'Eşya adı gereklidir').max(100, 'Eşya adı çok uzun'),
  goldTypeId: z.number().int().positive('Geçerli altın türü seçiniz'),
  goldPurityId: z.number().int().positive('Geçerli altın ayarı seçiniz'),
  weightGrams: z.number().positive('Ağırlık pozitif olmalıdır'),
  purchasePrice: z.number().positive('Alış fiyatı pozitif olmalıdır'),
  purchaseDate: z.date(),
  description: z.string().optional(),
})

// Otomatik ödeme validasyonu
// NOT: Hesap/Kart kontrolü backend'de yapılır (nakit ödemeler için opsiyonel)
export const autoPaymentSchema = z.object({
  name: z.string().min(1, 'Ödeme adı gereklidir').max(100, 'Ödeme adı çok uzun'),
  amount: z.number().positive('Tutar pozitif olmalıdır'),
  currencyId: z.number().int().positive('Geçerli para birimi seçiniz'),
  accountId: z.number().int().positive().optional(),
  creditCardId: z.number().int().positive().optional(),
  paymentMethodId: z.number().int().positive('Geçerli ödeme yöntemi seçiniz'),
  categoryId: z.number().int().positive('Geçerli kategori seçiniz'),
  cronSchedule: z.string().min(1, 'Zamanlama gereklidir'),
  nextPaymentDate: z.date().optional(),
  description: z.string().optional(),
})

// Para birimi dönüşümü için yardımcı fonksiyonlar
export function formatCurrency(amount: number, currencyCode: string): string {
  const symbols: Record<string, string> = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
    GBP: '£',
    CHF: 'CHF',
    JPY: '¥',
    XAU: 'Au',
  }

  const symbol = symbols[currencyCode] || currencyCode
  return `${symbol} ${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function parseCurrencyInput(value: string): number {
  // Türkçe sayı formatını parse et (1.234,56 -> 1234.56)
  const cleaned = value.replace(/[^\d,.-]/g, '')
  const parts = cleaned.split(',')

  if (parts.length === 2) {
    // Virgül varsa ondalık kısım
    const integerPart = parts[0].replace(/\./g, '')
    const decimalPart = parts[1]
    return parseFloat(`${integerPart}.${decimalPart}`)
  } else {
    // Virgül yoksa sadece tam sayı
    return parseFloat(cleaned.replace(/\./g, ''))
  }
}

export function formatCurrencyInput(amount: number): string {
  return amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Dönem validasyonu
export const periodSchema = z.object({
  name: z.string().min(3, 'Dönem adı en az 3 karakter olmalıdır').max(100, 'Dönem adı çok uzun'),
  periodType: z.enum(['YEARLY', 'FISCAL_YEAR', 'MONTHLY', 'CUSTOM'], {
    errorMap: () => ({ message: 'Geçerli bir dönem tipi seçiniz' }),
  }),
  startDate: z.date({ required_error: 'Başlangıç tarihi gereklidir' }),
  endDate: z.date({ required_error: 'Bitiş tarihi gereklidir' }),
  description: z.string().optional(),
})

// Dönem kapanış validasyonu
export const periodClosingSchema = z.object({
  periodId: z.number().int().positive('Geçerli dönem seçiniz'),
  transferBalances: z.boolean().default(false),
  closingNotes: z.string().optional(),
})

// Dönem transfer validasyonu
export const periodTransferSchema = z.object({
  fromPeriodId: z.number().int().positive('Kaynak dönem gereklidir'),
  toPeriodId: z.number().int().positive('Hedef dönem gereklidir'),
  accountId: z.number().int().positive().optional(),
  transferAmount: z.number().positive('Transfer tutarı pozitif olmalıdır'),
  transferType: z.enum(['OPENING_BALANCE', 'ASSET', 'LIABILITY'], {
    errorMap: () => ({ message: 'Geçerli transfer tipi seçiniz' }),
  }),
  description: z.string().optional(),
})

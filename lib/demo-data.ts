// Demo verileri - Paylaşılan, sabit demo verileri
// Bu veriler demo sayfasında kullanılır ve veritabanına yazılmaz

export interface DemoAccount {
  id: string
  name: string
  bankName: string
  accountType: string
  balance: number
  currency: string
}

export interface DemoTransaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  account: string
}

export interface DemoSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  savingsRate: number
}

export const demoAccounts: DemoAccount[] = [
  {
    id: '1',
    name: 'Ana Hesap',
    bankName: 'Ziraat Bankası',
    accountType: 'Vadesiz',
    balance: 12500.5,
    currency: 'TRY',
  },
  {
    id: '2',
    name: 'Birikim Hesabı',
    bankName: 'Garanti BBVA',
    accountType: 'Vadeli',
    balance: 35000.0,
    currency: 'TRY',
  },
  {
    id: '3',
    name: 'Döviz Hesabı',
    bankName: 'İş Bankası',
    accountType: 'Döviz',
    balance: 2500.0,
    currency: 'USD',
  },
]

export const demoTransactions: DemoTransaction[] = [
  {
    id: '1',
    date: '2026-12-14',
    description: 'Maaş',
    amount: 15000.0,
    type: 'income',
    category: 'Maaş',
    account: 'Ana Hesap',
  },
  {
    id: '2',
    date: '2026-12-13',
    description: 'Market Alışverişi',
    amount: -450.75,
    type: 'expense',
    category: 'Market',
    account: 'Ana Hesap',
  },
  {
    id: '3',
    date: '2026-12-12',
    description: 'Kira Ödemesi',
    amount: -5000.0,
    type: 'expense',
    category: 'Kira',
    account: 'Ana Hesap',
  },
  {
    id: '4',
    date: '2026-12-11',
    description: 'Elektrik Faturası',
    amount: -320.5,
    type: 'expense',
    category: 'Fatura',
    account: 'Ana Hesap',
  },
  {
    id: '5',
    date: '2026-12-10',
    description: 'Freelance Proje',
    amount: 5000.0,
    type: 'income',
    category: 'Ek Gelir',
    account: 'Ana Hesap',
  },
  {
    id: '6',
    date: '2026-12-09',
    description: 'Restoran',
    amount: -180.0,
    type: 'expense',
    category: 'Yemek',
    account: 'Ana Hesap',
  },
  {
    id: '7',
    date: '2026-12-08',
    description: 'Benzin',
    amount: -450.0,
    type: 'expense',
    category: 'Ulaşım',
    account: 'Ana Hesap',
  },
  {
    id: '8',
    date: '2026-12-07',
    description: 'Netflix Aboneliği',
    amount: -99.9,
    type: 'expense',
    category: 'Abonelik',
    account: 'Ana Hesap',
  },
  {
    id: '9',
    date: '2026-12-06',
    description: 'Birikim Transferi',
    amount: -2000.0,
    type: 'expense',
    category: 'Birikim',
    account: 'Birikim Hesabı',
  },
  {
    id: '10',
    date: '2026-12-05',
    description: 'Su Faturası',
    amount: -85.25,
    type: 'expense',
    category: 'Fatura',
    account: 'Ana Hesap',
  },
]

export const demoSummary: DemoSummary = {
  totalIncome: 20000.0,
  totalExpense: 8986.4,
  balance: 11013.6,
  savingsRate: 45.07,
}

// Kategorilere göre harcama dağılımı
export const demoCategoryBreakdown = [
  { category: 'Kira', amount: 5000.0, percentage: 55.7 },
  { category: 'Market', amount: 450.75, percentage: 5.0 },
  { category: 'Fatura', amount: 405.75, percentage: 4.5 },
  { category: 'Ulaşım', amount: 450.0, percentage: 5.0 },
  { category: 'Yemek', amount: 180.0, percentage: 2.0 },
  { category: 'Birikim', amount: 2000.0, percentage: 22.3 },
  { category: 'Abonelik', amount: 99.9, percentage: 1.1 },
  { category: 'Diğer', amount: 400.0, percentage: 4.4 },
]

// Aylık nakit akışı (son 6 ay)
export const demoCashFlow = [
  { month: 'Temmuz', income: 15000, expense: 12000, balance: 3000 },
  { month: 'Ağustos', income: 15000, expense: 11000, balance: 4000 },
  { month: 'Eylül', income: 18000, expense: 13000, balance: 5000 },
  { month: 'Ekim', income: 15000, expense: 12500, balance: 2500 },
  { month: 'Kasım', income: 20000, expense: 14000, balance: 6000 },
  { month: 'Aralık', income: 20000, expense: 8986, balance: 11014 },
]

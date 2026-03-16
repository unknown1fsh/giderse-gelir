// Merkezi Plan Konfigürasyonu
// Tüm plan tanımları, fiyatları ve özellikleri burada tanımlanır

export const PLAN_IDS = {
  FREE: 'free',
  PREMIUM: 'premium',
  FAMILY: 'family',
} as const

export type PlanId = (typeof PLAN_IDS)[keyof typeof PLAN_IDS]

export interface PlanPricing {
  id: PlanId
  name: string
  price: number
  currency: string
  period: string
  description: string
}

export interface PlanFeatureCategory {
  name: string
  features: string[]
}

export interface PlanConfig extends PlanPricing {
  categories: PlanFeatureCategory[]
  limitations: string[]
  popular?: boolean
  badge?: string
  trialDays?: number
}

// Plan fiyatları (TRY, aylık)
export const PLAN_PRICES: Record<PlanId, number> = {
  [PLAN_IDS.FREE]: 0,
  [PLAN_IDS.PREMIUM]: 99,
  [PLAN_IDS.FAMILY]: 199,
}

// Plan limitleri
export const PLAN_LIMITS: Record<
  PlanId,
  {
    transactions: number   // -1 = sınırsız
    accounts: number
    creditCards: number
    ewallets: number
    goals: number
    budgets: number
    members: number        // aile üye sayısı
  }
> = {
  [PLAN_IDS.FREE]: {
    transactions: 30,
    accounts: 3,
    creditCards: 2,
    ewallets: 2,
    goals: 3,
    budgets: 3,
    members: 1,
  },
  [PLAN_IDS.PREMIUM]: {
    transactions: -1,
    accounts: -1,
    creditCards: -1,
    ewallets: -1,
    goals: -1,
    budgets: -1,
    members: 1,
  },
  [PLAN_IDS.FAMILY]: {
    transactions: -1,
    accounts: -1,
    creditCards: -1,
    ewallets: -1,
    goals: -1,
    budgets: -1,
    members: 5,
  },
}

// Tam plan konfigürasyonları
export const PLANS: Record<PlanId, PlanConfig> = {
  [PLAN_IDS.FREE]: {
    id: PLAN_IDS.FREE,
    name: 'Başlangıç',
    price: PLAN_PRICES.free,
    currency: 'TRY',
    period: 'month',
    description: 'Kişisel finans takibine başlamak için',
    trialDays: 0,
    categories: [
      {
        name: 'Temel Özellikler',
        features: [
          'Aylık 30 işlem kaydı',
          '3 banka hesabı',
          '2 kredi kartı, 2 e-cüzdan',
          '3 tasarruf hedefi',
          'Temel bütçe takibi',
          'Dönem yönetimi',
          'Mobil uyumlu arayüz',
        ],
      },
    ],
    limitations: [
      'Sınırlı işlem sayısı (aylık 30)',
      'AI analiz yok',
      'PDF/Excel export yok',
      'Yatırım takibi yok',
      'Otomatik ödeme takibi yok',
    ],
    popular: false,
  },

  [PLAN_IDS.PREMIUM]: {
    id: PLAN_IDS.PREMIUM,
    name: 'Pro',
    price: PLAN_PRICES.premium,
    currency: 'TRY',
    period: 'month',
    description: 'Sınırsız takip ve AI finans koçu ile büyümek isteyenler için',
    trialDays: 30,
    badge: 'En Popüler',
    categories: [
      {
        name: 'Sınırsız Kullanım',
        features: [
          'Sınırsız işlem kaydı',
          'Sınırsız hesap & kredi kartı',
          'Sınırsız e-cüzdan',
          'Sınırsız hedef & bütçe',
        ],
      },
      {
        name: 'AI & Akıllı Analizler',
        features: [
          'AI finansal asistan',
          'Harcama tahminleri (3–6 ay)',
          'Otomatik kategorileme',
          'Nakit akış analizi',
          'Trend raporları',
          'Kategori bazlı analizler',
        ],
      },
      {
        name: 'Yatırım & Varlık Takibi',
        features: [
          'Hisse senedi takibi',
          'Kripto portföyü',
          'Altın & emtia',
          'Yatırım fonu takibi',
          'Canlı fiyat güncellemeleri',
        ],
      },
      {
        name: 'Otomasyon',
        features: [
          'Otomatik ödeme takibi',
          'Kira, fatura, abonelik takibi',
          'Bildirim & hatırlatmalar',
        ],
      },
      {
        name: 'Raporlama',
        features: [
          'PDF rapor dışa aktarma',
          'Excel/CSV export',
          'Özelleştirilebilir dashboard',
        ],
      },
      {
        name: 'Destek',
        features: ['7/24 öncelikli e-posta desteği', 'Yeni özellik erken erişimi'],
      },
    ],
    limitations: [],
    popular: true,
  },

  [PLAN_IDS.FAMILY]: {
    id: PLAN_IDS.FAMILY,
    name: 'Premium',
    price: PLAN_PRICES.family,
    currency: 'TRY',
    period: 'month',
    description: 'Gelişmiş analiz ve yatırım odağı isteyen ileri seviye kullanıcılar için',
    trialDays: 30,
    badge: 'İleri Seviye',
    categories: [
      {
        name: 'Pro\'nun Tamamı',
        features: [
          'Sınırsız işlem, hesap, kart',
          'AI analiz & tahminler',
          'Yatırım & portföy takibi',
          'Otomatik ödeme takibi',
          'PDF/Excel export',
        ],
      },
      {
        name: 'Premium Plus Analizler',
        features: [
          'Kredi kartı ekstre analizi',
          'Gelişmiş AI finansal içgörüler',
          'Borç azaltma stratejisi önerileri',
          'Yatırım odaklı öneri setleri',
          'Öncelikli yeni özellik erişimi',
        ],
      },
      {
        name: 'Öncelikli Destek',
        features: [
          '7/24 öncelikli e-posta & sohbet',
          'Telefon destek (hafta içi)',
          'Hesap yöneticisi atama',
        ],
      },
    ],
    limitations: [],
    popular: false,
  },
}

/* ────────── Helper fonksiyonlar ────────── */

export function getPlanById(planId: string): PlanConfig | undefined {
  return PLANS[planId as PlanId]
}

export function getPlanPrice(planId: string): number {
  return PLAN_PRICES[planId as PlanId] ?? 0
}

export function getPlanLimits(planId: string) {
  return PLAN_LIMITS[planId as PlanId] ?? PLAN_LIMITS.free
}

export function isValidPlanId(planId: string): planId is PlanId {
  return (Object.values(PLAN_IDS) as string[]).includes(planId)
}

export function getAllPlans(): PlanConfig[] {
  return Object.values(PLANS)
}

/** Premium plan kontrolü — Premium veya Aile planı */
export function isPremiumPlan(planId: string): boolean {
  return planId === PLAN_IDS.PREMIUM || planId === PLAN_IDS.FAMILY
}

/** Aile planı kontrolü */
export function isFamilyPlan(planId: string): boolean {
  return planId === PLAN_IDS.FAMILY
}

// Geriye dönük uyumluluk — eski enterprise kontrollerini premium'a düşür
export function isEnterprisePlan(planId: string): boolean {
  return isFamilyPlan(planId)
}

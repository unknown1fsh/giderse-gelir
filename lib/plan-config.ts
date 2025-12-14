// Merkezi Plan Konfigürasyonu
// Tüm plan tanımları, fiyatları ve özellikleri burada tanımlanır

export const PLAN_IDS = {
  FREE: 'free',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
  ENTERPRISE_PREMIUM: 'enterprise_premium',
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
  savings?: string
  custom?: string
}

// Plan fiyatları
export const PLAN_PRICES: Record<PlanId, number> = {
  [PLAN_IDS.FREE]: 0,
  [PLAN_IDS.PREMIUM]: 250,
  [PLAN_IDS.ENTERPRISE]: 450,
  [PLAN_IDS.ENTERPRISE_PREMIUM]: 0, // Özel fiyat
}

// Plan limitleri
export const PLAN_LIMITS: Record<
  PlanId,
  {
    transactions: number // -1 = sınırsız
    accounts: number // -1 = sınırsız
    creditCards: number // -1 = sınırsız
    analysis: number // -1 = sınırsız
  }
> = {
  [PLAN_IDS.FREE]: {
    transactions: 50,
    accounts: 3,
    creditCards: 2,
    analysis: 10,
  },
  [PLAN_IDS.PREMIUM]: {
    transactions: -1,
    accounts: -1,
    creditCards: -1,
    analysis: -1,
  },
  [PLAN_IDS.ENTERPRISE]: {
    transactions: -1,
    accounts: -1,
    creditCards: -1,
    analysis: -1,
  },
  [PLAN_IDS.ENTERPRISE_PREMIUM]: {
    transactions: -1,
    accounts: -1,
    creditCards: -1,
    analysis: -1,
  },
}

// Tam plan konfigürasyonları
export const PLANS: Record<PlanId, PlanConfig> = {
  [PLAN_IDS.FREE]: {
    id: PLAN_IDS.FREE,
    name: 'Ücretsiz',
    price: PLAN_PRICES.free,
    currency: 'TRY',
    period: 'month',
    description: 'Temel özellikler',
    categories: [
      {
        name: 'Temel Finansal Yönetim',
        features: [
          'Aylık 50 işlem',
          'Temel raporlar',
          'Mobil erişim',
          'E-posta desteği',
          'Temel kategoriler',
        ],
      },
    ],
    limitations: ['Sınırlı işlem sayısı', 'Temel raporlar', 'Standart destek'],
    popular: false,
  },

  [PLAN_IDS.PREMIUM]: {
    id: PLAN_IDS.PREMIUM,
    name: 'Premium',
    price: PLAN_PRICES.premium,
    currency: 'TRY',
    period: 'month',
    description: 'Bireysel kullanıcılar için tüm premium özellikler',
    categories: [
      {
        name: '🧠 AI & Akıllı Analizler',
        features: [
          'AI Finansal Asistan',
          'Otomatik Kategorileme',
          'Tahmin Modelleri',
          'Akıllı Öneriler',
        ],
      },
      {
        name: '📊 Gelişmiş Raporlama',
        features: [
          'İnteraktif Grafikler',
          'Harcama Dağılımı',
          'Trend Analizleri',
          'PDF/Excel Raporları',
        ],
      },
      {
        name: '🎯 Akıllı Hedefleme',
        features: ['Kişisel Hedefler', 'Mevsimsel Analiz', 'Akıllı Bildirimler', 'Başarı Takibi'],
      },
      {
        name: '⚡ Otomasyon & Verimlilik',
        features: ['Otomatik Takip', 'Akıllı Tekrarlar', 'Zaman Tasarrufu', 'Özelleştirilebilir'],
      },
      {
        name: '🛡️ Premium Destek',
        features: ['7/24 Premium Destek', 'Gelişmiş Güvenlik', 'Premium Tema', 'Bulut Yedekleme'],
      },
    ],
    limitations: [],
    popular: true,
    savings: 'Yıllık ödeme ile %20 indirim',
  },

  [PLAN_IDS.ENTERPRISE]: {
    id: PLAN_IDS.ENTERPRISE,
    name: 'Enterprise',
    price: PLAN_PRICES.enterprise,
    currency: 'TRY',
    period: 'month',
    description: 'KOBİ ve şirketler için kurumsal çözümler',
    categories: [
      {
        name: '🏢 Kurumsal Yönetim',
        features: [
          'Tüm Premium Özellikler',
          'Çoklu Kullanıcı Desteği',
          'Departman Yönetimi',
          'Rol Bazlı Erişim Kontrolü',
        ],
      },
      {
        name: '🔧 Entegrasyonlar',
        features: ['API Erişimi', 'Webhook Desteği', 'Özel Entegrasyonlar', 'ERP/CRM Entegrasyonu'],
      },
      {
        name: '📈 Gelişmiş Analizler',
        features: [
          'Departman Bazlı Raporlar',
          'Bütçe Takibi',
          'Nakit Akış Tahminleri',
          "Özel Dashboard'lar",
        ],
      },
      {
        name: '🎯 Premium Destek',
        features: [
          'Dedicated Hesap Yöneticisi',
          'Öncelikli 7/24 Destek',
          'Özel Eğitim',
          'SLA Garantisi',
        ],
      },
    ],
    limitations: [],
    popular: false,
  },

  [PLAN_IDS.ENTERPRISE_PREMIUM]: {
    id: PLAN_IDS.ENTERPRISE_PREMIUM,
    name: 'Enterprise Premium',
    price: PLAN_PRICES.enterprise_premium,
    currency: 'TRY',
    period: 'month',
    description: 'Holding ve büyük kurumlar için ultra premium',
    categories: [
      {
        name: '🏢 Kurumsal Yönetim',
        features: [
          'Çoklu Şirket Konsolidasyonu',
          'Sınırsız Departman Yönetimi',
          'Hiyerarşik Yetki Sistemi',
          'Global Şube Ağı',
        ],
      },
      {
        name: '🔒 Enterprise Güvenlik',
        features: [
          'Kurumsal Quantum Şifreleme',
          'Enterprise Sıfır Güven',
          'Siber Tehdit İzleme',
          'Uyumluluk Yönetimi',
        ],
      },
      {
        name: '🤖 AI Süper Zeka',
        features: [
          'Kurumsal AI Süper Zeka',
          'Kurumsal Gelir Optimizasyonu',
          'Operasyonel Verimlilik',
          'Kurumsal Süreç Otomasyonu',
        ],
      },
      {
        name: '🌐 Global Altyapı',
        features: [
          'Global İş Ağı',
          'Enterprise Bulut Altyapısı',
          'Çoklu Para Birimi Yönetimi',
          'VIP Kurumsal Destek',
        ],
      },
      {
        name: '💰 Kurumsal Gelir Artırma',
        features: [
          'Pazar Genişletme',
          'Müşteri Segmentasyonu',
          'Ürün Portföy Optimizasyonu',
          'Kurumsal Ortaklıklar',
        ],
      },
      {
        name: '📈 İş Zekası & Analytics',
        features: [
          'Kurumsal Dashboard',
          'Enterprise API',
          'Özel Sistem Entegrasyonları',
          'Beyaz Etiket Çözümü',
        ],
      },
    ],
    limitations: [],
    popular: false,
    custom: 'Özel fiyatlandırma için iletişime geçin',
  },
}

// Helper fonksiyonlar
export function getPlanById(planId: string): PlanConfig | undefined {
  return PLANS[planId as PlanId]
}

export function getPlanPrice(planId: string): number {
  return PLAN_PRICES[planId as PlanId] || 0
}

export function getPlanLimits(planId: string) {
  return PLAN_LIMITS[planId as PlanId] || PLAN_LIMITS.free
}

export function isValidPlanId(planId: string): planId is PlanId {
  return (Object.values(PLAN_IDS) as string[]).includes(planId)
}

export function getAllPlans(): PlanConfig[] {
  return Object.values(PLANS)
}

// Premium özellikleri kontrol etme
export function isPremiumPlan(planId: string): boolean {
  return (
    planId === PLAN_IDS.PREMIUM ||
    planId === PLAN_IDS.ENTERPRISE ||
    planId === PLAN_IDS.ENTERPRISE_PREMIUM
  )
}

export function isEnterprisePlan(planId: string): boolean {
  return planId === PLAN_IDS.ENTERPRISE || planId === PLAN_IDS.ENTERPRISE_PREMIUM
}

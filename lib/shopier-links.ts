/**
 * Shopier ödeme linkleri — merkezi yönetim
 * Tüm uygulama genelinde bu değerleri kullanın.
 */
export const SHOPIER_LINKS = {
  premium: 'https://www.shopier.com/cinarinovasyon/45196765',
  family: 'https://www.shopier.com/cinarinovasyon/45196957',
} as const

export type ShopierPlanKey = keyof typeof SHOPIER_LINKS

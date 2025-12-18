/**
 * Google Ads conversion event helper
 * Ödeme başarılı olduğunda veya abonelik oluşturulduğunda çağrılır
 */
export function trackGoogleAdsConversion(transactionId: string, value?: number) {
  if (typeof window === 'undefined' || !window.gtag) {
    console.warn('Google Ads gtag not available')
    return
  }

  try {
    window.gtag('event', 'conversion', {
      send_to: 'AW-17814901017/oE9rCJeF09MbEJmi565C',
      value: value || 1.0,
      currency: 'TRY',
      transaction_id: transactionId,
    })
  } catch (error) {
    console.error('Google Ads conversion tracking error:', error)
  }
}

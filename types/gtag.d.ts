// Google Tag (gtag.js) type definitions
declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date | Record<string, unknown>,
      config?: Record<string, unknown>
    ) => void
  }
}

export {}

'use client'

import { useEffect } from 'react'

// Global error handler component - Konsol hatalarını temizler
export function GlobalErrorHandler() {
  useEffect(() => {
    // Unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason

      // console.log ile debug edelim
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Error Handler] Caught rejection:', error)
      }

      if (error && typeof error === 'object') {
        // Network 401/403 hatalarını suppress et
        if (error.status === 401 || error.status === 403) {
          event.preventDefault()
          return
        }

        // Browser extension hatalarını suppress et (code: 403, name: 'i')
        if (error.code === 403 || error.name === 'i') {
          event.preventDefault()
          return
        }

        // httpError: false ve httpStatus: 200 ile gelen hataları suppress et
        if (error.httpError === false && error.httpStatus === 200 && error.code === 403) {
          event.preventDefault()
          return
        }
      }

      // String hatalar (örn: "HTTP error! status: 401")
      if (typeof error === 'string') {
        if (
          error.includes('401') ||
          error.includes('403') ||
          error.includes('cloudflareinsights.com') ||
          error.includes('doubleclick.net') ||
          error.includes('CORS') ||
          error.includes('499')
        ) {
          event.preventDefault()
          return
        }
      }

      // Error instance kontrolü
      if (error instanceof Error) {
        if (
          error.message.includes('401') ||
          error.message.includes('403') ||
          error.message.includes('cloudflareinsights.com') ||
          error.message.includes('doubleclick.net') ||
          error.message.includes('CORS') ||
          error.message.includes('499') ||
          error.message.includes('MIME type') ||
          error.message.includes('ERR_FAILED') ||
          error.message.includes('ERR_ABORTED')
        ) {
          event.preventDefault()
          return
        }
      }
    }

    // Global error handler
    const handleError = (event: ErrorEvent) => {
      // Cloudflare Insights hatalarını suppress et
      if (
        event.filename?.includes('cloudflareinsights.com') ||
        event.message?.includes('cloudflareinsights.com') ||
        event.message?.includes('beacon.min.js') ||
        event.message?.includes('Access-Control-Allow-Origin') ||
        event.message?.includes('ERR_FAILED') ||
        (event.target && (event.target as HTMLElement).tagName === 'SCRIPT' && (event.target as HTMLScriptElement).src?.includes('cloudflareinsights.com'))
      ) {
        event.preventDefault()
        return
      }

      // Google Ads/DoubleClick hatalarını suppress et
      if (
        event.filename?.includes('doubleclick.net') ||
        event.filename?.includes('googleads.g.doubleclick.net') ||
        event.message?.includes('doubleclick.net') ||
        event.message?.includes('googleads.g.doubleclick.net') ||
        event.message?.includes('MIME type') ||
        event.message?.includes('is not executable') ||
        event.message?.includes('ERR_ABORTED') ||
        (event.target && (event.target as HTMLElement).tagName === 'SCRIPT' && (event.target as HTMLScriptElement).src?.includes('doubleclick.net'))
      ) {
        event.preventDefault()
        return
      }

      // content.js, main.js ve browser extension hatalarını suppress et
      if (
        event.filename?.includes('content.js') ||
        event.filename?.includes('main.js') ||
        event.filename?.includes('extension') ||
        event.filename?.includes('chrome-extension') ||
        event.message?.includes('Extension context') ||
        event.message?.includes('code: 403')
      ) {
        event.preventDefault()
        return
      }

      // Script tag içindeki hataları filtrele
      if (event.target && (event.target as HTMLElement).tagName === 'SCRIPT') {
        const scriptSrc = (event.target as HTMLScriptElement).src
        if (
          scriptSrc?.includes('extension') ||
          scriptSrc?.includes('content') ||
          scriptSrc?.includes('cloudflareinsights.com') ||
          scriptSrc?.includes('doubleclick.net')
        ) {
          event.preventDefault()
          return
        }
      }

      // Network hataları (499, CORS vb.)
      if (event.message?.includes('499') || event.message?.includes('CORS')) {
        event.preventDefault()
        return
      }
    }

    // Console error override (development için)
    if (process.env.NODE_ENV === 'development') {
      const originalError = console.error
      console.error = (...args: any[]) => {
        // 401/403 hatalarını filtrele
        const message = args.join(' ')
        if (
          message.includes('401') ||
          message.includes('403') ||
          message.includes('Unauthorized') ||
          message.includes('code: 403') ||
          message.includes('cloudflareinsights.com') ||
          message.includes('beacon.min.js') ||
          message.includes('Access-Control-Allow-Origin') ||
          message.includes('doubleclick.net') ||
          message.includes('googleads.g.doubleclick.net') ||
          message.includes('MIME type') ||
          message.includes('is not executable') ||
          message.includes('ERR_FAILED') ||
          message.includes('ERR_ABORTED') ||
          message.includes('499') ||
          message.includes('CORS')
        ) {
          // Sessizce geç
          return
        }
        originalError.apply(console, args)
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  return null
}

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
      if (typeof error === 'string' && (error.includes('401') || error.includes('403'))) {
        event.preventDefault()
        return
      }

      // Error instance kontrolü
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('403')) {
          event.preventDefault()
          return
        }
      }
    }

    // Global error handler
    const handleError = (event: ErrorEvent) => {
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
        if (scriptSrc?.includes('extension') || scriptSrc?.includes('content')) {
          event.preventDefault()
          return
        }
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
          message.includes('code: 403')
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

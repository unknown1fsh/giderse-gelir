import { NextRequest, NextResponse } from 'next/server'
import { hasValidToken } from './lib/auth/utils'

// Demo kullanıcısı için yazma işlemi izin listesi
const DEMO_WRITE_ALLOWLIST = ['/api/auth/']

// JWT payload'ını imza doğrulaması olmadan decode eder (demo write blocking için yeterli)
function getDemoRoleFromToken(token: string): boolean {
  try {
    const base64Payload = token.split('.')[1]
    if (!base64Payload) return false
    const payload = JSON.parse(atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/')))
    return payload?.role === 'DEMO'
  } catch {
    return false
  }
}

// Korumalı rotalar
const protectedRoutes = [
  '/dashboard',
  '/transactions',
  '/accounts',
  '/cards',
  '/auto-payments',
  '/gold',
  '/analysis',
  '/portfolio',
  '/settings',
  '/periods',
  '/investments',
  '/beneficiaries',
  '/ewallets',
  '/admin',
  '/help',
  '/budgets',
  '/goals',
  '/loans',
  '/installments',
  '/ai-analysis',
  '/enterprise-dashboard',
  '/premium',
  '/premium-features',
]

// Auth rotaları (giriş yapmış kullanıcılar erişemez)
const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/landing']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Production'da HTTPS kontrolü
  if (process.env.NODE_ENV === 'production') {
    const protocol = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol
    if (protocol !== 'https' && !request.nextUrl.hostname.includes('localhost')) {
      return NextResponse.redirect(
        new URL(request.url.replace('http://', 'https://'), request.url),
        { status: 301 }
      )
    }
  }

  // Demo hesabı: yazma işlemlerini engelle (API rotaları dahil)
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const isAuthRoute = DEMO_WRITE_ALLOWLIST.some(p => pathname.startsWith(p))
    if (!isAuthRoute) {
      const token = request.cookies.get('auth-token')?.value
      if (token && getDemoRoleFromToken(token)) {
        return NextResponse.json(
          { error: 'Demo hesapta değişiklik yapılamaz. Üye olarak tüm özelliklere erişin.', isDemo: true },
          { status: 403 }
        )
      }
    }
  }

  // API rotaları için sayfa düzeyinde koruma gerekmez
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Cookie'den token kontrolü (basit)
  const hasToken = hasValidToken(request)

  // Korumalı rotalar için kontrol
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!hasToken) {
      // Giriş yapmamış kullanıcıyı landing sayfasına yönlendir
      return NextResponse.redirect(new URL('/landing', request.url))
    }
  }

  // Auth rotaları için kontrol
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (hasToken) {
      // Giriş yapmış kullanıcıyı dashboard'a yönlendir
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Ana sayfa yönlendirmesi
  if (pathname === '/') {
    if (hasToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/landing', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * NOT excluded: api (API routes dahil edildi — demo write blocking için)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

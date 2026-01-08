import { NextResponse } from 'next/server'

/**
 * Railway healthcheck endpoint
 * Hızlı ve basit olmalı - sadece uygulamanın çalıştığını kontrol eder
 * Database veya diğer servislerin durumunu kontrol etmez (zaman alır)
 * 
 * Route segment config - Health check için özel ayarlar
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    // Railway healthcheck için her zaman 200 döndür
    // Uygulama çalışıyorsa bu endpoint'e erişilebilir demektir
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'giderse-gelir',
        uptime: process.uptime(),
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )
  } catch (error) {
    // Hata durumunda bile 200 döndür (Railway healthcheck için)
    // Çünkü endpoint'e erişilebiliyorsa uygulama çalışıyor demektir
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'giderse-gelir',
        error: error instanceof Error ? error.message : 'unknown',
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )
  }
}

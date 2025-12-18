import { NextResponse } from 'next/server'

/**
 * Railway healthcheck endpoint
 * Hızlı ve basit olmalı - sadece uygulamanın çalıştığını kontrol eder
 * Database veya diğer servislerin durumunu kontrol etmez (zaman alır)
 */
export async function GET() {
  try {
    // Railway healthcheck için her zaman 200 döndür
    // Uygulama çalışıyorsa bu endpoint'e erişilebilir demektir
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'giderse-gelir',
      },
      { status: 200 }
    )
  } catch (error) {
    // Hata durumunda bile 200 döndür (Railway healthcheck için)
    // Çünkü endpoint'e erişilebiliyorsa uygulama çalışıyor demektir
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'giderse-gelir',
      },
      { status: 200 }
    )
  }
}

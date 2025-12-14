// Basit rate limiting implementasyonu
// Production'da Redis veya başka bir cache servisi kullanılmalı

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Rate limit temizleme (memory leak önleme)
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 60000) // Her 1 dakikada bir temizle

/**
 * Basit rate limiting kontrolü
 * @param identifier Kullanıcıyı tanımlayan unique identifier (IP, user ID, etc.)
 * @param maxRequests Maximum request sayısı
 * @param windowMs Time window (milisaniye)
 * @returns { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 dakika
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = identifier

  // Eğer kayıt yoksa veya süresi dolmuşsa yeni kayıt oluştur
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    }
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: store[key].resetTime,
    }
  }

  // Limit aşılmış mı kontrol et
  if (store[key].count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: store[key].resetTime,
    }
  }

  // Count artır
  store[key].count++

  return {
    allowed: true,
    remaining: maxRequests - store[key].count,
    resetTime: store[key].resetTime,
  }
}

/**
 * IP adresini al
 */
export function getClientIp(request: Request): string {
  // X-Forwarded-For header'ından IP al (Railway/proxy için)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  // X-Real-IP header'ından IP al
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback
  return 'unknown'
}

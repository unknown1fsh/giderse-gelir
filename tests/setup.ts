import { PrismaClient } from '@prisma/client'
import { beforeAll, afterAll } from 'vitest'
import { getTestLogger } from './helpers/test-logger'
import fs from 'fs'
import path from 'path'

// Bu dosya test öncesi setup işlemlerini yapar.
// Girdi: -
// Çıktı: Test environment hazır
// Hata: -

// Vitest ortamında Next.js'in env yüklemesi otomatik gelmeyebilir.
// Sunucu ile aynı DB/JWT ayarlarını kullanmak için .env/.env.local dosyalarını burada yüklüyoruz.
function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return
  }
  const content = fs.readFileSync(filePath, 'utf-8')
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) {
      continue
    }
    const eq = line.indexOf('=')
    if (eq === -1) {
      continue
    }
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    // basit tırnak temizleme
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

const repoRoot = process.cwd()
loadEnvFile(path.join(repoRoot, '.env'))
loadEnvFile(path.join(repoRoot, '.env.local'))

const prisma = new PrismaClient()
const logger = getTestLogger()

// Sunucu kontrolü için helper
async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3000/api/health', {
      signal: AbortSignal.timeout(2000),
    })
    return response.ok
  } catch {
    return false
  }
}

// Test veritabanı bağlantısını kontrol et
beforeAll(async () => {
  logger.logToConsole('========================================')
  logger.logToConsole('TEST ORTAMI HAZIRLANIYOR')
  logger.logToConsole('========================================\n')

  try {
    await prisma.$connect()
    logger.logToConsole('✅ Test veritabanı bağlantısı başarılı')
  } catch (error) {
    logger.logToConsole(`❌ Test veritabanı bağlantı hatası: ${error}`)
    throw error
  }

  // Sunucu kontrolü
  const serverRunning = await checkServerHealth()
  if (!serverRunning) {
    logger.logToConsole('⚠️  UYARI: Sunucu çalışmıyor (http://localhost:3000)')
    logger.logToConsole('⚠️  API testleri başarısız olabilir. Sunucuyu başlatmak için: npm run dev')
  } else {
    logger.logToConsole('✅ Sunucu çalışıyor')
  }

  logger.logToConsole('\n')
})

// Not: afterEach ile global temizlik, vitest paralel koşarken diğer suite'lerin verisini silebilir.
// Bu yüzden temizlik her test dosyasının kendi afterAll'ında yapılır.

// Tüm testler bittikten sonra
afterAll(async () => {
  await prisma.$disconnect()
  logger.logToConsole('✅ Test veritabanı bağlantısı kapatıldı')
  logger.writeSummary()
})

export { prisma }

// Sunucu kontrolü için export
export async function isServerRunning(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3000/api/health', {
      signal: AbortSignal.timeout(2000),
    })
    return response.ok
  } catch {
    return false
  }
}

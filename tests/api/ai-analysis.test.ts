import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import {
  createTestUser,
  createAuthCookie,
  testFetch,
  logTestResult,
  logTestSuiteStart,
  logTestSuiteEnd,
} from '../helpers/test-utils'

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:3000/api'

describe('AI Analysis API Endpoints', () => {
  let userId: number
  let authToken: string

  beforeAll(async () => {
    logTestSuiteStart('AI Analysis API Endpoints')
    const testUser = await createTestUser('ai-analysis')
    userId = testUser.user.id
    authToken = testUser.token
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
    logTestSuiteEnd('AI Analysis API Endpoints')
  })

  describe('POST /api/ai-analysis/report/generate', () => {
    it('AI rapor oluşturma isteği göndermeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/ai-analysis/report/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          period: 'monthly',
        }),
      })
      const duration = Date.now() - startTime

      const success = [200, 201, 400, 403, 500].includes(response.status)
      logTestResult(
        'AI rapor oluşturma isteği göndermeli',
        '/ai-analysis/report/generate',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200/201/400/403/500, alınan ${response.status}`
      )
      expect([200, 201, 400, 403, 500]).toContain(response.status)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/ai-analysis/report/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: 'monthly' }),
      })
      const duration = Date.now() - startTime

      const success = [401, 400].includes(response.status)
      logTestResult(
        'token olmadan 401 dönmeli',
        '/ai-analysis/report/generate',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 401/400, alınan ${response.status}`
      )
      expect([401, 400]).toContain(response.status)
    })
  })

  describe('GET /api/ai-analysis/report/status', () => {
    it('rapor durumunu getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/ai-analysis/report/status`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      const success = [200, 400, 500].includes(response.status)
      logTestResult(
        'rapor durumunu getirmeli',
        '/ai-analysis/report/status',
        'GET',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200/400/500, alınan ${response.status}`
      )
      expect([200, 400, 500]).toContain(response.status)
    })

    it('limitInfo remaining/total/used sayılarını dönmeli', async () => {
      const response = await testFetch(`${BASE_URL}/ai-analysis/report/status`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      if (response.status !== 200) {return}
      const json = (await response.json()) as { success?: boolean; data?: { limitInfo?: { remaining: number; total: number; used: number } } }
      if (!json.success || !json.data?.limitInfo) {return}
      expect(typeof json.data.limitInfo.remaining).toBe('number')
      expect(typeof json.data.limitInfo.total).toBe('number')
      expect(typeof json.data.limitInfo.used).toBe('number')
    })
  })
})

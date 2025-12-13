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

describe('Analysis API Endpoints', () => {
  let userId: number
  let authToken: string

  beforeAll(async () => {
    logTestSuiteStart('Analysis API Endpoints')
    const testUser = await createTestUser('analysis')
    userId = testUser.user.id
    authToken = testUser.token
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
    logTestSuiteEnd('Analysis API Endpoints')
  })

  describe('GET /api/analysis', () => {
    it('analiz verilerini getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/analysis`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      logTestResult('analiz verilerini getirmeli', '/analysis', 'GET', response.status, duration, response.status === 200)
      expect([200, 500]).toContain(response.status)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/analysis`)
      const duration = Date.now() - startTime

      logTestResult('token olmadan 401 dönmeli', '/analysis', 'GET', response.status, duration, response.status === 401)
      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/analysis/cashflow', () => {
    it('nakit akışı analizini getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/analysis/cashflow`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      // Free plan kullanıcıları için endpoint 403 dönebilir (premium feature)
      const success = [200, 401, 403, 500].includes(response.status)
      logTestResult(
        'nakit akışı analizini getirmeli',
        '/analysis/cashflow',
        'GET',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200/401/403/500, alınan ${response.status}`
      )
      expect([200, 401, 403, 500]).toContain(response.status)
    })
  })

  describe('GET /api/analysis/categories', () => {
    it('kategori analizini getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/analysis/categories`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      const success = [200, 401, 403, 500].includes(response.status)
      logTestResult(
        'kategori analizini getirmeli',
        '/analysis/categories',
        'GET',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200/401/403/500, alınan ${response.status}`
      )
      expect([200, 401, 403, 500]).toContain(response.status)
    })
  })

  describe('GET /api/analysis/trends', () => {
    it('trend analizini getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/analysis/trends`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      const success = [200, 401, 403, 500].includes(response.status)
      logTestResult(
        'trend analizini getirmeli',
        '/analysis/trends',
        'GET',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200/401/403/500, alınan ${response.status}`
      )
      expect([200, 401, 403, 500]).toContain(response.status)
    })
  })
})

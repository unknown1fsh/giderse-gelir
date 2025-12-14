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

describe('Auto Payments API Endpoints', () => {
  let userId: number
  let authToken: string

  beforeAll(async () => {
    logTestSuiteStart('Auto Payments API Endpoints')
    const testUser = await createTestUser('auto-payments')
    userId = testUser.user.id
    authToken = testUser.token
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
    logTestSuiteEnd('Auto Payments API Endpoints')
  })

  describe('GET /api/auto-payments', () => {
    it('otomatik ödemeleri getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auto-payments`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      const success = response.status === 200
      logTestResult(
        'otomatik ödemeleri getirmeli',
        '/auto-payments',
        'GET',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200, alınan ${response.status}`
      )
      expect(response.status).toBe(200)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auto-payments`)
      const duration = Date.now() - startTime

      logTestResult(
        'token olmadan 401 dönmeli',
        '/auto-payments',
        'GET',
        response.status,
        duration,
        response.status === 401
      )
      expect(response.status).toBe(401)
    })
  })
})

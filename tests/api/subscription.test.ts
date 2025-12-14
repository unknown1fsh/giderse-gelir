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
import { getPlanLimits } from '../../lib/plan-config'

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:3000/api'

describe('Subscription API Endpoints', () => {
  let userId: number
  let authToken: string

  beforeAll(async () => {
    logTestSuiteStart('Subscription API Endpoints')
    const testUser = await createTestUser('subscription')
    userId = testUser.user.id
    authToken = testUser.token
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
    logTestSuiteEnd('Subscription API Endpoints')
  })

  describe('GET /api/subscription/status', () => {
    it('abonelik durumunu getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/subscription/status`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      logTestResult(
        'abonelik durumunu getirmeli',
        '/subscription/status',
        'GET',
        response.status,
        duration,
        response.status === 200
      )
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('usage')
      expect(data.usage.transactionLimit).toBe(getPlanLimits('free').transactions)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/subscription/status`)
      const duration = Date.now() - startTime

      logTestResult(
        'token olmadan 401 dönmeli',
        '/subscription/status',
        'GET',
        response.status,
        duration,
        response.status === 401
      )
      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/subscription/plans', () => {
    it('planları getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/subscription/plans`)
      const duration = Date.now() - startTime

      logTestResult(
        'planları getirmeli',
        '/subscription/plans',
        'GET',
        response.status,
        duration,
        response.status === 200
      )
      expect(response.status).toBe(200)
    })
  })
})

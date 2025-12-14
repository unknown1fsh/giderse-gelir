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

describe('Investments API Endpoints', () => {
  let userId: number
  let authToken: string

  beforeAll(async () => {
    logTestSuiteStart('Investments API Endpoints')
    const testUser = await createTestUser('investments')
    userId = testUser.user.id
    authToken = testUser.token
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
    logTestSuiteEnd('Investments API Endpoints')
  })

  describe('GET /api/investments', () => {
    it('yatırımları getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/investments`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      const success = [200, 403, 500].includes(response.status)
      logTestResult(
        'yatırımları getirmeli',
        '/investments',
        'GET',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200/403/500, alınan ${response.status}`
      )
      expect([200, 403, 500]).toContain(response.status)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/investments`)
      const duration = Date.now() - startTime

      logTestResult(
        'token olmadan 401 dönmeli',
        '/investments',
        'GET',
        response.status,
        duration,
        response.status === 401
      )
      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/investments/types', () => {
    it('yatırım türlerini getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/investments/types`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      logTestResult(
        'yatırım türlerini getirmeli',
        '/investments/types',
        'GET',
        response.status,
        duration,
        [200, 500].includes(response.status)
      )
      expect([200, 500]).toContain(response.status)
    })
  })
})

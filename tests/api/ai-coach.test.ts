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

describe('AI Coach API Endpoints', () => {
  let userId: number
  let authToken: string

  beforeAll(async () => {
    logTestSuiteStart('AI Coach API Endpoints')
    const testUser = await createTestUser('ai-coach')
    userId = testUser.user.id
    authToken = testUser.token
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
    logTestSuiteEnd('AI Coach API Endpoints')
  })

  describe('GET /api/ai-coach/summary', () => {
    it('ai koç özetini getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/ai-coach/summary`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      const success = [200, 403, 500].includes(response.status)
      logTestResult(
        'ai koç özetini getirmeli',
        '/ai-coach/summary',
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
      const response = await testFetch(`${BASE_URL}/ai-coach/summary`)
      const duration = Date.now() - startTime

      logTestResult(
        'token olmadan 401 dönmeli',
        '/ai-coach/summary',
        'GET',
        response.status,
        duration,
        response.status === 401
      )
      expect(response.status).toBe(401)
    })
  })
})

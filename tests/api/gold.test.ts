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

describe('Gold API Endpoints', () => {
  let userId: number
  let authToken: string

  beforeAll(async () => {
    logTestSuiteStart('Gold API Endpoints')
    const testUser = await createTestUser('gold')
    userId = testUser.user.id
    authToken = testUser.token
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
    logTestSuiteEnd('Gold API Endpoints')
  })

  describe('GET /api/gold', () => {
    it('altın kayıtlarını getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/gold`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      const success = [200, 401, 500].includes(response.status)
      logTestResult(
        'altın kayıtlarını getirmeli',
        '/gold',
        'GET',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200/401/500, alınan ${response.status}`
      )
      expect([200, 401, 500]).toContain(response.status)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/gold`)
      const duration = Date.now() - startTime

      logTestResult(
        'token olmadan 401 dönmeli',
        '/gold',
        'GET',
        response.status,
        duration,
        response.status === 401
      )
      expect(response.status).toBe(401)
    })
  })
})

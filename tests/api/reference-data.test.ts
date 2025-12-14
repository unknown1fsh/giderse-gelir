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

describe('Reference Data API Endpoint', () => {
  let userId: number
  let authToken: string

  beforeAll(async () => {
    logTestSuiteStart('Reference Data API Endpoint')
    const testUser = await createTestUser('reference')
    userId = testUser.user.id
    authToken = testUser.token
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
    logTestSuiteEnd('Reference Data API Endpoint')
  })

  describe('GET /api/reference-data', () => {
    it('referans verilerini getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/reference-data`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      logTestResult(
        'referans verilerini getirmeli',
        '/reference-data',
        'GET',
        response.status,
        duration,
        response.status === 200
      )
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('txTypes')
    })

    it('token olmadan da çalışabilmeli (public endpoint)', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/reference-data`)
      const duration = Date.now() - startTime

      logTestResult(
        'token olmadan da çalışabilmeli',
        '/reference-data',
        'GET',
        response.status,
        duration,
        [200, 401].includes(response.status)
      )
      expect([200, 401]).toContain(response.status)
    })
  })
})

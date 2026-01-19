import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import {
  createTestUser,
  createTestEwallet,
  createAuthCookie,
  testFetch,
  logTestResult,
  logTestSuiteStart,
  logTestSuiteEnd,
} from '../helpers/test-utils'

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:3000/api'

describe('E-Wallets API Endpoints', () => {
  let userId: number
  let authToken: string

  beforeAll(async () => {
    logTestSuiteStart('E-Wallets API Endpoints')
    const testUser = await createTestUser('ewallets')
    userId = testUser.user.id
    authToken = testUser.token

    await createTestEwallet(userId)
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
    logTestSuiteEnd('E-Wallets API Endpoints')
  })

  describe('GET /api/ewallets', () => {
    it('e-cüzdanları getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/ewallets`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      const success = response.status === 200
      logTestResult(
        'e-cüzdanları getirmeli',
        '/ewallets',
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
      const response = await testFetch(`${BASE_URL}/ewallets`)
      const duration = Date.now() - startTime

      logTestResult(
        'token olmadan 401 dönmeli',
        '/ewallets',
        'GET',
        response.status,
        duration,
        response.status === 401
      )
      expect(response.status).toBe(401)
    })
  })
})

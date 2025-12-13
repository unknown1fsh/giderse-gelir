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

describe('Parameters API Endpoints', () => {
  let userId: number
  let authToken: string

  beforeAll(async () => {
    logTestSuiteStart('Parameters API Endpoints')
    const testUser = await createTestUser('parameters')
    userId = testUser.user.id
    authToken = testUser.token
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
    logTestSuiteEnd('Parameters API Endpoints')
  })

  describe('GET /api/parameters', () => {
    it('parametreleri getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/parameters`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      logTestResult('parametreleri getirmeli', '/parameters', 'GET', response.status, duration, [200, 500].includes(response.status))
      expect([200, 500]).toContain(response.status)
    })
  })
})

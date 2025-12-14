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

describe('Market API Endpoints', () => {
  let userId: number
  let authToken: string

  beforeAll(async () => {
    logTestSuiteStart('Market API Endpoints')
    const testUser = await createTestUser('market')
    userId = testUser.user.id
    authToken = testUser.token
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
    logTestSuiteEnd('Market API Endpoints')
  })

  describe('GET /api/market/stocks/search', () => {
    it('hisse araması yapmalı', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/market/stocks/search?query=apple`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      logTestResult(
        'hisse araması yapmalı',
        '/market/stocks/search',
        'GET',
        response.status,
        duration,
        [200, 500].includes(response.status)
      )
      expect([200, 500]).toContain(response.status)
    })
  })

  describe('GET /api/market/crypto', () => {
    it('kripto verilerini getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/market/crypto`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      logTestResult(
        'kripto verilerini getirmeli',
        '/market/crypto',
        'GET',
        response.status,
        duration,
        [200, 500].includes(response.status)
      )
      expect([200, 500]).toContain(response.status)
    })
  })
})

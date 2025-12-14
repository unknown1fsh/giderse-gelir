import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import {
  createTestUser,
  createTestAccount,
  createAuthCookie,
  testFetch,
  logTestResult,
  logTestSuiteStart,
  logTestSuiteEnd,
} from '../helpers/test-utils'

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:3000/api'

describe('Dashboard API Endpoint', () => {
  let userId: number
  let authToken: string

  beforeAll(async () => {
    logTestSuiteStart('Dashboard API Endpoint')
    const testUser = await createTestUser('dashboard')
    userId = testUser.user.id
    authToken = testUser.token

    await createTestAccount(userId)
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
    logTestSuiteEnd('Dashboard API Endpoint')
  })

  describe('GET /api/dashboard', () => {
    it('dashboard KPI verilerini getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/dashboard`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      logTestResult(
        'dashboard KPI verilerini getirmeli',
        '/dashboard',
        'GET',
        response.status,
        duration,
        response.status === 200
      )
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('kpi')
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/dashboard`)
      const duration = Date.now() - startTime

      logTestResult(
        'token olmadan 401 dönmeli',
        '/dashboard',
        'GET',
        response.status,
        duration,
        response.status === 401
      )
      expect(response.status).toBe(401)
    })
  })
})

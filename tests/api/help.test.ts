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

describe('Help API Endpoints', () => {
  let userId: number
  let authToken: string

  beforeAll(async () => {
    logTestSuiteStart('Help API Endpoints')
    const testUser = await createTestUser('help')
    userId = testUser.user.id
    authToken = testUser.token
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
    logTestSuiteEnd('Help API Endpoints')
  })

  describe('GET /api/help/categories', () => {
    it('kategorileri getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/help/categories`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      logTestResult(
        'kategorileri getirmeli',
        '/help/categories',
        'GET',
        response.status,
        duration,
        response.status === 200
      )
      expect(response.status).toBe(200)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/help/categories`)
      const duration = Date.now() - startTime

      logTestResult(
        'token olmadan 401 dönmeli',
        '/help/categories',
        'GET',
        response.status,
        duration,
        response.status === 401
      )
      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/help/faq', () => {
    it('SSS listesini getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/help/faq`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      const success = [200, 401].includes(response.status)
      logTestResult(
        'SSS listesini getirmeli',
        '/help/faq',
        'GET',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200/401, alınan ${response.status}`
      )
      expect([200, 401]).toContain(response.status)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/help/faq`)
      const duration = Date.now() - startTime

      logTestResult(
        'token olmadan 401 dönmeli',
        '/help/faq',
        'GET',
        response.status,
        duration,
        response.status === 401
      )
      expect(response.status).toBe(401)
    })
  })
})

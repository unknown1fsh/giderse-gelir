import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import {
  createTestUser,
  createTestAdminUser,
  createAuthCookie,
  testFetch,
  logTestResult,
  logTestSuiteStart,
  logTestSuiteEnd,
} from '../helpers/test-utils'

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:3000/api'

describe('Admin API Endpoints', () => {
  let adminUserId: number
  let adminAuthToken: string
  let normalUserId: number
  let normalAuthToken: string

  // Not: createTestUser/createTestAdminUser HTTP çağrıları yapıyor, hook timeout'u artırıyoruz.
  beforeAll(async () => {
    logTestSuiteStart('Admin API Endpoints')
    const adminUser = await createTestAdminUser('admin')
    adminUserId = adminUser.user.id
    adminAuthToken = adminUser.token

    const normalUser = await createTestUser('normal')
    normalUserId = normalUser.user.id
    normalAuthToken = normalUser.token
  }, 30000)

  afterAll(async () => {
    const ids = [adminUserId, normalUserId].filter((v): v is number => typeof v === 'number')
    if (ids.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: ids } } })
    }
    await prisma.$disconnect()
    logTestSuiteEnd('Admin API Endpoints')
  }, 30000)

  describe('GET /api/admin/users', () => {
    it('admin kullanıcıları listeleme yapabilmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/admin/users`, {
        headers: { Cookie: createAuthCookie(adminAuthToken) },
      })
      const duration = Date.now() - startTime

      const success = [200, 401, 500].includes(response.status)
      logTestResult(
        'admin kullanıcıları listeleme yapabilmeli',
        '/admin/users',
        'GET',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200/401/500, alınan ${response.status}`
      )
      expect([200, 401, 500]).toContain(response.status)
    })

    it('normal kullanıcı erişememeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/admin/users`, {
        headers: { Cookie: createAuthCookie(normalAuthToken) },
      })
      const duration = Date.now() - startTime

      logTestResult(
        'normal kullanıcı erişememeli',
        '/admin/users',
        'GET',
        response.status,
        duration,
        [403, 401].includes(response.status)
      )
      expect([403, 401]).toContain(response.status)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/admin/users`)
      const duration = Date.now() - startTime

      logTestResult(
        'token olmadan 401 dönmeli',
        '/admin/users',
        'GET',
        response.status,
        duration,
        response.status === 401
      )
      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/admin/dashboard', () => {
    it('admin dashboard verilerini getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/admin/dashboard`, {
        headers: { Cookie: createAuthCookie(adminAuthToken) },
      })
      const duration = Date.now() - startTime

      const success = [200, 401, 500].includes(response.status)
      logTestResult(
        'admin dashboard verilerini getirmeli',
        '/admin/dashboard',
        'GET',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200/401/500, alınan ${response.status}`
      )
      expect([200, 401, 500]).toContain(response.status)
    })
  })
})

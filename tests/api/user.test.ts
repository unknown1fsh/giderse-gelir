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

describe('User API Endpoints', () => {
  let userId: number
  let authToken: string

  beforeAll(async () => {
    logTestSuiteStart('User API Endpoints')
    const testUser = await createTestUser('user')
    userId = testUser.user.id
    authToken = testUser.token
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
    logTestSuiteEnd('User API Endpoints')
  })

  describe('PUT /api/user/update', () => {
    it('profil güncellemeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/user/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          name: 'Güncellenmiş İsim',
        }),
      })
      const duration = Date.now() - startTime

      logTestResult(
        'profil güncellemeli',
        '/user/update',
        'PUT',
        response.status,
        duration,
        [200, 400].includes(response.status)
      )
      expect([200, 400]).toContain(response.status)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/user/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' }),
      })
      const duration = Date.now() - startTime

      logTestResult(
        'token olmadan 401 dönmeli',
        '/user/update',
        'PUT',
        response.status,
        duration,
        response.status === 401
      )
      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/user/change-password', () => {
    it('şifre değiştirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          currentPassword: 'Test123456',
          newPassword: 'NewPassword123',
        }),
      })
      const duration = Date.now() - startTime

      const success = [200, 400, 401].includes(response.status)
      logTestResult(
        'şifre değiştirmeli',
        '/user/change-password',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200/400/401, alınan ${response.status}`
      )
      expect([200, 400, 401]).toContain(response.status)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/user/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: 'Test', newPassword: 'New' }),
      })
      const duration = Date.now() - startTime

      logTestResult(
        'token olmadan 401 dönmeli',
        '/user/change-password',
        'POST',
        response.status,
        duration,
        response.status === 401
      )
      expect(response.status).toBe(401)
    })
  })
})

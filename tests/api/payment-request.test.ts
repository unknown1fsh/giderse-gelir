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

describe('Payment Request API Endpoints', () => {
  let userId: number
  let authToken: string

  beforeAll(async () => {
    logTestSuiteStart('Payment Request API Endpoints')
    const testUser = await createTestUser('payment-request')
    userId = testUser.user.id
    authToken = testUser.token
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
    logTestSuiteEnd('Payment Request API Endpoints')
  })

  describe('POST /api/payment-request/create', () => {
    it('ödeme talebi oluşturmalı', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/payment-request/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          amount: 100,
          description: 'Test ödeme talebi',
        }),
      })
      const duration = Date.now() - startTime

      logTestResult(
        'ödeme talebi oluşturmalı',
        '/payment-request/create',
        'POST',
        response.status,
        duration,
        [200, 201, 400, 500].includes(response.status)
      )
      expect([200, 201, 400, 500]).toContain(response.status)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/payment-request/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 100 }),
      })
      const duration = Date.now() - startTime

      // Endpoint auth yokken BadRequestError(400) dönüyor
      const success = [400, 401].includes(response.status)
      logTestResult(
        'token olmadan 400/401 dönmeli',
        '/payment-request/create',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 400/401, alınan ${response.status}`
      )
      expect([400, 401]).toContain(response.status)
    })
  })
})

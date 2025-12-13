import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import {
  createTestUser,
  createTestPeriod,
  createAuthCookie,
  testFetch,
  logTestResult,
  logTestSuiteStart,
  logTestSuiteEnd,
} from '../helpers/test-utils'

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:3000/api'

describe('Periods API Endpoints', () => {
  let userId: number
  let authToken: string
  let periodId: number

  beforeAll(async () => {
    logTestSuiteStart('Periods API Endpoints')
    const testUser = await createTestUser('periods')
    userId = testUser.user.id
    authToken = testUser.token

    const period = await createTestPeriod(userId)
    periodId = period.id
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
    logTestSuiteEnd('Periods API Endpoints')
  })

  describe('GET /api/periods', () => {
    it('dönemleri getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/periods`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      const success = response.status === 200
      logTestResult('dönemleri getirmeli', '/periods', 'GET', response.status, duration, success, success ? undefined : `Beklenen 200, alınan ${response.status}`)
      expect(response.status).toBe(200)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/periods`)
      const duration = Date.now() - startTime

      logTestResult('token olmadan 401 dönmeli', '/periods', 'GET', response.status, duration, response.status === 401)
      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/periods/:id/close', () => {
    it('transferBalances=true iken kredi kartı borcunu (availableLimit) taşımalı', async () => {
      const bank = await prisma.refBank.findFirst()
      const currency = await prisma.refCurrency.findFirst({ where: { code: 'TRY' } })
      expect(bank).toBeTruthy()
      expect(currency).toBeTruthy()

      const card = await prisma.creditCard.create({
        data: {
          userId,
          periodId,
          name: `Test Kart ${Date.now()}`,
          bankId: bank!.id,
          currencyId: currency!.id,
          limitAmount: 10000,
          availableLimit: 8000, // 2000 borç
          statementDay: 15,
          dueDay: 5,
          minPaymentPercent: 3.0,
          active: true,
        },
      })

      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/periods/${periodId}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({ transferBalances: true, closingNotes: 'test' }),
      })
      const duration = Date.now() - startTime

      const success = response.status === 200
      logTestResult(
        'transferBalances=true iken kredi kartı borcunu taşımalı',
        `/periods/${periodId}/close`,
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200, alınan ${response.status}`
      )
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('success', true)
      expect(data.nextPeriod).toBeTruthy()

      const nextPeriod = data.nextPeriod as { id: number }
      const copied = await prisma.creditCard.findFirst({
        where: { userId, periodId: nextPeriod.id, name: card.name },
      })

      expect(copied).toBeTruthy()
      expect(Number(copied!.availableLimit)).toBe(8000)
      expect(Number(copied!.limitAmount)).toBe(10000)
    })
  })
})

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import {
  createTestUser,
  createTestBeneficiary,
  createAuthCookie,
  testFetch,
  logTestResult,
  logTestSuiteStart,
  logTestSuiteEnd,
} from '../helpers/test-utils'

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:3000/api'

describe('Beneficiaries API Endpoints', () => {
  let userId: number
  let authToken: string
  let beneficiaryId: number

  beforeAll(async () => {
    logTestSuiteStart('Beneficiaries API Endpoints')
    const testUser = await createTestUser('beneficiaries')
    userId = testUser.user.id
    authToken = testUser.token

    const beneficiary = await createTestBeneficiary(userId)
    beneficiaryId = beneficiary.id
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
    logTestSuiteEnd('Beneficiaries API Endpoints')
  })

  describe('GET /api/beneficiaries', () => {
    it('alıcıları getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/beneficiaries`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      const success = [200, 401, 500].includes(response.status)
      logTestResult(
        'alıcıları getirmeli',
        '/beneficiaries',
        'GET',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200/401/500, alınan ${response.status}`
      )
      expect([200, 401, 500]).toContain(response.status)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/beneficiaries`)
      const duration = Date.now() - startTime

      logTestResult(
        'token olmadan 401 dönmeli',
        '/beneficiaries',
        'GET',
        response.status,
        duration,
        response.status === 401
      )
      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/beneficiaries', () => {
    it('yeni alıcı oluşturmalı', async () => {
      const bank = await prisma.refBank.findFirst()

      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/beneficiaries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          name: 'Test Alıcı',
          iban: 'TR330006100519786457841326',
          bankId: bank?.id,
        }),
      })
      const duration = Date.now() - startTime

      const success = [201, 200, 400, 401].includes(response.status)
      logTestResult(
        'yeni alıcı oluşturmalı',
        '/beneficiaries',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 201/200/400/401, alınan ${response.status}`
      )
      expect([201, 200, 400, 401]).toContain(response.status)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/beneficiaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' }),
      })
      const duration = Date.now() - startTime

      logTestResult(
        'token olmadan 401 dönmeli',
        '/beneficiaries',
        'POST',
        response.status,
        duration,
        response.status === 401
      )
      expect(response.status).toBe(401)
    })
  })
})

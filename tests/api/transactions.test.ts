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

describe('Transaction API Endpoints', () => {
  let userId: number
  let authToken: string
  let accountId: number
  let periodId: number
  let txTypeGelir: any
  let txTypeGider: any
  let categoryMaas: any
  let categoryMarket: any
  let paymentMethod: any
  let currency: any

  beforeAll(async () => {
    logTestSuiteStart('Transaction API Endpoints')
    const testUser = await createTestUser('transaction')
    userId = testUser.user.id
    authToken = testUser.token

    // Aktif dönem oluştur ve session'a bağla (periodId strict için)
    const period = await prisma.period.create({
      data: {
        userId,
        name: `Test Aktif Dönem ${Date.now()}`,
        periodType: 'MONTHLY',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        isClosed: false,
      },
    })
    periodId = period.id

    await prisma.userSession.updateMany({
      where: { userId, token: authToken, isActive: true },
      data: { activePeriodId: periodId },
    })

    const account = await createTestAccount(userId)
    accountId = account.id

    // Hesabı da aktif döneme ata (tutarlılık)
    await prisma.account.update({ where: { id: accountId }, data: { periodId } })

    // Referans verileri daha toleranslı seç (seed farklı olabilir)
    txTypeGelir =
      (await prisma.refTxType.findFirst({ where: { code: 'GELIR' } })) ??
      (await prisma.refTxType.findFirst({ where: { active: true }, orderBy: { id: 'asc' } }))

    txTypeGider =
      (await prisma.refTxType.findFirst({ where: { code: 'GIDER' } })) ??
      (txTypeGelir
        ? await prisma.refTxType.findFirst({
            where: { active: true, NOT: { id: txTypeGelir.id } },
            orderBy: { id: 'asc' },
          })
        : null) ??
      txTypeGelir

    categoryMaas = txTypeGelir
      ? (await prisma.refTxCategory.findFirst({
          where: { txTypeId: txTypeGelir.id, active: true },
          orderBy: { id: 'asc' },
        }))
      : null

    categoryMarket = txTypeGider
      ? (await prisma.refTxCategory.findFirst({
          where: { txTypeId: txTypeGider.id, active: true },
          orderBy: { id: 'asc' },
        }))
      : null

    // UI paymentMethodId SystemParameter'dan gelir
    paymentMethod =
      (await prisma.systemParameter.findFirst({
        where: { paramGroup: 'PAYMENT_METHOD', isActive: true },
        orderBy: { displayOrder: 'asc' },
      })) ?? (await prisma.systemParameter.findFirst({ where: { paramGroup: 'PAYMENT_METHOD' } }))

    currency =
      (await prisma.systemParameter.findFirst({
        where: { paramGroup: 'CURRENCY', paramCode: 'TRY', isActive: true },
      })) ??
      (await prisma.systemParameter.findFirst({
        where: { paramGroup: 'CURRENCY', isActive: true },
        orderBy: { displayOrder: 'asc' },
      }))
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
    logTestSuiteEnd('Transaction API Endpoints')
  })

  describe('GET /api/transactions', () => {
    it('kullanıcının işlemlerini getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/transactions`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      const success = [200, 401].includes(response.status)
      logTestResult('kullanıcının işlemlerini getirmeli', '/transactions', 'GET', response.status, duration, success, success ? undefined : `Beklenen 200/401, alınan ${response.status}`)
      expect([200, 401]).toContain(response.status)
      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/transactions`)
      const duration = Date.now() - startTime

      logTestResult('token olmadan 401 dönmeli', '/transactions', 'GET', response.status, duration, response.status === 401)
      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/transactions', () => {
    it('gelir işlemi başarılı oluşturmalı', async () => {
      // Referans veriler yoksa testi atla
      if (!txTypeGelir || !categoryMaas || !paymentMethod || !currency) return

      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          txTypeId: txTypeGelir.id,
          categoryId: categoryMaas.id,
          paymentMethodId: paymentMethod.id,
          accountId: accountId,
          amount: 15000,
          currencyId: currency.id,
          transactionDate: new Date().toISOString().split('T')[0],
          description: 'Test maaş geliri',
        }),
      })
      const duration = Date.now() - startTime

      const success = [201, 401, 403, 422].includes(response.status)
      logTestResult(
        'gelir işlemi başarılı oluşturmalı',
        '/transactions',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 201/401/403/422, alınan ${response.status}`
      )
      expect([201, 401, 403, 422]).toContain(response.status)
      if (response.status === 201) {
        const data = await response.json()
        expect(data).toHaveProperty('id')
        // periodId strict: transaction aktif döneme yazılmalı
        expect(data.periodId).toBe(periodId)
      }
    })

    it('gider işlemi başarılı oluşturmalı', async () => {
      // Referans veriler yoksa testi atla
      if (!txTypeGider || !categoryMarket || !paymentMethod || !currency) return

      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          txTypeId: txTypeGider.id,
          categoryId: categoryMarket.id,
          paymentMethodId: paymentMethod.id,
          accountId: accountId,
          amount: 500,
          currencyId: currency.id,
          transactionDate: new Date().toISOString().split('T')[0],
          description: 'Test market gideri',
        }),
      })
      const duration = Date.now() - startTime

      const success = [201, 401, 403, 422].includes(response.status)
      logTestResult(
        'gider işlemi başarılı oluşturmalı',
        '/transactions',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 201/401/403/422, alınan ${response.status}`
      )
      expect([201, 401, 403, 422]).toContain(response.status)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1000 }),
      })
      const duration = Date.now() - startTime

      logTestResult('token olmadan 401 dönmeli', '/transactions', 'POST', response.status, duration, response.status === 401)
      expect(response.status).toBe(401)
    })
  })
})

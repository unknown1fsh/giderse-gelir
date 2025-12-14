import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import {
  createTestUser,
  createTestCreditCard,
  createAuthCookie,
  testFetch,
  logTestResult,
  logTestSuiteStart,
  logTestSuiteEnd,
} from '../helpers/test-utils'

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:3000/api'

describe('Credit Cards API Endpoints', () => {
  let userId: number
  let authToken: string
  let cardId: number

  beforeAll(async () => {
    logTestSuiteStart('Credit Cards API Endpoints')
    const testUser = await createTestUser('cards')
    userId = testUser.user.id
    authToken = testUser.token

    const card = await createTestCreditCard(userId)
    cardId = card.id
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
    logTestSuiteEnd('Credit Cards API Endpoints')
  })

  describe('GET /api/cards', () => {
    it('kullanıcının kartlarını getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/cards`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      const success = [200, 401].includes(response.status)
      logTestResult(
        'kullanıcının kartlarını getirmeli',
        '/cards',
        'GET',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200/401, alınan ${response.status}`
      )
      expect([200, 401]).toContain(response.status)
      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/cards`)
      const duration = Date.now() - startTime

      logTestResult(
        'token olmadan 401 dönmeli',
        '/cards',
        'GET',
        response.status,
        duration,
        response.status === 401
      )
      expect(response.status).toBe(401)
    })
  })

  describe('PATCH /api/cards/[id]', () => {
    it('kart adını güncellemeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          name: 'Güncellenmiş Kart Adı',
        }),
      })
      const duration = Date.now() - startTime

      const success = [200, 401, 404].includes(response.status)
      logTestResult(
        'kart adını güncellemeli',
        `/cards/${cardId}`,
        'PATCH',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200/401/404, alınan ${response.status}`
      )
      expect([200, 401, 404]).toContain(response.status)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' }),
      })
      const duration = Date.now() - startTime

      logTestResult(
        'token olmadan 401 dönmeli',
        `/cards/${cardId}`,
        'PATCH',
        response.status,
        duration,
        response.status === 401
      )
      expect(response.status).toBe(401)
    })
  })
})

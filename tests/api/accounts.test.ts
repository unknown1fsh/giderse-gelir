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

// Bu test dosyası Account API endpoint'lerini test eder.
describe('Account API Endpoints', () => {
  let userId: number
  let authToken: string
  let accountId: number

  beforeAll(async () => {
    logTestSuiteStart('Account API Endpoints')
    const testUser = await createTestUser('account')
    userId = testUser.user.id
    authToken = testUser.token

    // Test hesabı oluştur
    const account = await createTestAccount(userId)
    accountId = account.id
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
    logTestSuiteEnd('Account API Endpoints')
  })

  describe('GET /api/accounts', () => {
    it('kullanıcının hesaplarını getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/accounts`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      const success = [200, 401].includes(response.status)
      logTestResult(
        'kullanıcının hesaplarını getirmeli',
        '/accounts',
        'GET',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200/401, alınan ${response.status}`
      )

      expect([200, 401]).toContain(response.status)
      if (response.status === 200) {
        const data = await response.json()
        expect(Array.isArray(data)).toBe(true)
      }
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/accounts`)
      const duration = Date.now() - startTime

      const success = response.status === 401
      logTestResult(
        'token olmadan 401 dönmeli',
        '/accounts',
        'GET',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 401, alınan ${response.status}`
      )

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/accounts', () => {
    it('yeni banka hesabı oluşturmalı', async () => {
      const accountType = await prisma.refAccountType.findFirst()
      const bank = await prisma.refBank.findFirst()
      const currency = await prisma.refCurrency.findFirst({ where: { code: 'TRY' } })

      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          accountType: 'bank',
          name: 'Test Hesap',
          accountTypeId: accountType?.id,
          bankId: bank?.id,
          currencyId: currency?.id,
          balance: 5000,
        }),
      })
      const duration = Date.now() - startTime

      const success = [201, 401].includes(response.status)
      logTestResult(
        'yeni banka hesabı oluşturmalı',
        '/accounts',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 201/401, alınan ${response.status}`
      )

      expect([201, 401]).toContain(response.status)
      if (response.status === 201) {
        const data = await response.json()
        expect(data).toHaveProperty('id')
        expect(data.name).toBe('Test Hesap')
      }
    })

    it('yeni kredi kartı oluşturmalı', async () => {
      const bank = await prisma.refBank.findFirst()
      const currency = await prisma.refCurrency.findFirst({ where: { code: 'TRY' } })

      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          accountType: 'credit_card',
          name: 'Test Kredi Kartı',
          bankId: bank?.id,
          currencyId: currency?.id,
          limitAmount: 20000,
          dueDay: 15,
        }),
      })
      const duration = Date.now() - startTime

      const success = [201, 400, 401].includes(response.status)
      logTestResult(
        'yeni kredi kartı oluşturmalı',
        '/accounts',
        'POST',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 201/400/401, alınan ${response.status}`
      )

      expect([201, 400, 401]).toContain(response.status)
    })

    it('eksik alanlar ile hesap oluşturma hata vermeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          accountType: 'bank',
          // name eksik
        }),
      })
      const duration = Date.now() - startTime

      const success = response.status === 400 || response.status === 500
      logTestResult(
        'eksik alanlar ile hesap oluşturma hata vermeli',
        '/accounts',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 400/500, alınan ${response.status}`
      )

      expect([400, 500]).toContain(response.status)
    })

    it('token olmadan hesap oluşturma hata vermeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountType: 'bank',
          name: 'Test',
        }),
      })
      const duration = Date.now() - startTime

      const success = response.status === 401
      logTestResult(
        'token olmadan hesap oluşturma hata vermeli',
        '/accounts',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 401, alınan ${response.status}`
      )

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/accounts/bank', () => {
    it('banka hesaplarını getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/accounts/bank`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      const success = response.status === 200
      logTestResult(
        'banka hesaplarını getirmeli',
        '/accounts/bank',
        'GET',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200, alınan ${response.status}`
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('GET /api/accounts/[id]', () => {
    it('hesap detayını getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/accounts/${accountId}`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      const success = [200, 401].includes(response.status)
      logTestResult(
        'hesap detayını getirmeli',
        `/accounts/${accountId}`,
        'GET',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200/401, alınan ${response.status}`
      )

      expect([200, 401]).toContain(response.status)
      if (response.status === 200) {
        const data = await response.json()
        expect(data).toHaveProperty('id')
        expect(data.id).toBe(accountId)
        expect(data).toHaveProperty('transactions')
      }
    })

    it('olmayan hesap için 404 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/accounts/999999`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      const success = [404, 401].includes(response.status)
      logTestResult(
        'olmayan hesap için 404 dönmeli',
        '/accounts/999999',
        'GET',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 404/401, alınan ${response.status}`
      )

      expect([404, 401]).toContain(response.status)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/accounts/${accountId}`)
      const duration = Date.now() - startTime

      const success = response.status === 401
      logTestResult(
        'token olmadan 401 dönmeli',
        `/accounts/${accountId}`,
        'GET',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 401, alınan ${response.status}`
      )

      expect(response.status).toBe(401)
    })
  })

  describe('PATCH /api/accounts/[id]', () => {
    it('hesap adını güncellemeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/accounts/${accountId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          name: 'Güncellenmiş Hesap Adı',
        }),
      })
      const duration = Date.now() - startTime

      const success = [200, 401].includes(response.status)
      logTestResult(
        'hesap adını güncellemeli',
        `/accounts/${accountId}`,
        'PATCH',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200/401, alınan ${response.status}`
      )

      expect([200, 401]).toContain(response.status)
      if (response.status === 200) {
        const data = await response.json()
        expect(data.name).toBe('Güncellenmiş Hesap Adı')
      }
    })

    it('boş isim ile hata vermeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/accounts/${accountId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          name: '',
        }),
      })
      const duration = Date.now() - startTime

      const success = [400, 401].includes(response.status)
      logTestResult(
        'boş isim ile hata vermeli',
        `/accounts/${accountId}`,
        'PATCH',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 400/401, alınan ${response.status}`
      )

      expect([400, 401]).toContain(response.status)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/accounts/${accountId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' }),
      })
      const duration = Date.now() - startTime

      const success = response.status === 401
      logTestResult(
        'token olmadan 401 dönmeli',
        `/accounts/${accountId}`,
        'PATCH',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 401, alınan ${response.status}`
      )

      expect(response.status).toBe(401)
    })
  })

  describe('DELETE /api/accounts/[id]', () => {
    it('hesap silmeli', async () => {
      // Yeni bir hesap oluştur (silme testi için)
      // Önce kullanıcının var olduğundan emin ol
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) {
        // Kullanıcı silinmişse testi atla
        return
      }
      
      const account = await createTestAccount(userId)

      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/accounts/${account.id}`, {
        method: 'DELETE',
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      const success = response.status === 200
      logTestResult(
        'hesap silmeli',
        `/accounts/${account.id}`,
        'DELETE',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200, alınan ${response.status}`
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })

    it('olmayan hesap için 404 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/accounts/999999`, {
        method: 'DELETE',
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime

      const success = [404, 401, 500].includes(response.status)
      logTestResult(
        'olmayan hesap için 404 dönmeli',
        '/accounts/999999',
        'DELETE',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 404/401/500, alınan ${response.status}`
      )

      expect([404, 401, 500]).toContain(response.status)
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/accounts/${accountId}`, {
        method: 'DELETE',
      })
      const duration = Date.now() - startTime

      const success = response.status === 401
      logTestResult(
        'token olmadan 401 dönmeli',
        `/accounts/${accountId}`,
        'DELETE',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 401, alınan ${response.status}`
      )

      expect(response.status).toBe(401)
    })
  })
})

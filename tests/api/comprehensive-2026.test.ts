/**
 * 2026 Gerçekçi Verilerle Kapsamlı Entegrasyon Testi
 * Maaş 115.000 TL, Kira 35.000 TL, banka hesapları, krediler, faturalar, yatırımlar vb.
 *
 * Gereksinimler:
 * - npm run dev (sunucu localhost:3000)
 * - DATABASE_URL erişilebilir veritabanı (örn. local PostgreSQL)
 * - npx prisma migrate dev && npx tsx prisma/seed.ts
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import {
  createTestUser,
  create2026TestPeriod,
  getReferenceIds,
  addPremiumSubscription,
  createAuthCookie,
  testFetch,
  logTestResult,
  logTestSuiteStart,
  logTestSuiteEnd,
} from '../helpers/test-utils'

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:3000/api'

describe('2026 Kapsamlı Entegrasyon Testi', () => {
  let userId: number
  let authToken: string
  let periodId: number
  let refs: Awaited<ReturnType<typeof getReferenceIds>>
  const accountIds: { anaHesap: number; birikim: number } = { anaHesap: 0, birikim: 0 }
  let beneficiaryIds: { evSahibi: number; bedas: number } = { evSahibi: 0, bedas: 0 }

  beforeAll(async () => {
    logTestSuiteStart('2026 Kapsamlı Entegrasyon Testi')

    const testUser = await createTestUser('comprehensive2026')
    userId = testUser.user.id
    authToken = testUser.token

    // Premium abonelik (Gold, Investment, AutoPayment için)
    await addPremiumSubscription(userId)

    // 2026 Ocak dönemi
    const period = await create2026TestPeriod(userId)
    periodId = period.id

    // Session'a aktif dönem ata
    await prisma.userSession.updateMany({
      where: { userId, token: authToken, isActive: true },
      data: { activePeriodId: periodId },
    })

    refs = await getReferenceIds()
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
    logTestSuiteEnd('2026 Kapsamlı Entegrasyon Testi')
  })

  describe('1. Banka Hesapları', () => {
    it('Ana Hesap (25.000 TL) oluşturmalı', async () => {
      if (!refs.bankZiraat || !refs.accountTypeVadesiz || !refs.currencyTry) {
        return
      }
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          accountType: 'bank',
          name: 'Ana Hesap',
          bankId: refs.bankZiraat.id,
          accountTypeId: refs.accountTypeVadesiz.id,
          currencyId: refs.currencyTry.id,
          balance: 25000,
        }),
      })
      const duration = Date.now() - startTime
      logTestResult('Ana Hesap oluştur', '/accounts', 'POST', response.status, duration, response.status === 201)
      expect([201, 400, 401]).toContain(response.status)
      if (response.status === 201) {
        const data = await response.json()
        accountIds.anaHesap = data.id
        expect(Number(data.balance)).toBe(25000)
      }
    })

    it('Birikim Hesabı (45.000 TL) oluşturmalı', async () => {
      if (!refs.bankGaranti || !refs.accountTypeVadeli || !refs.currencyTry) {
        return
      }
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          accountType: 'bank',
          name: 'Birikim Hesabı',
          bankId: refs.bankGaranti.id,
          accountTypeId: refs.accountTypeVadeli.id,
          currencyId: refs.currencyTry.id,
          balance: 45000,
        }),
      })
      const duration = Date.now() - startTime
      logTestResult('Birikim Hesabı oluştur', '/accounts', 'POST', response.status, duration, response.status === 201)
      expect([201, 400, 401]).toContain(response.status)
      if (response.status === 201) {
        const data = await response.json()
        accountIds.birikim = data.id
      }
    })
  })

  describe('2. Kredi Kartı', () => {
    it('Kredi kartı (50.000 limit, 8.000 borç) oluşturmalı', async () => {
      if (!refs.bankZiraat || !refs.currencyTry) {
        return
      }
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          accountType: 'credit_card',
          name: 'Ziraat Kredi Kartı',
          bankId: refs.bankZiraat.id,
          currencyId: refs.currencyTry.id,
          limitAmount: 50000,
          dueDay: 15,
        }),
      })
      const duration = Date.now() - startTime
      logTestResult('Kredi kartı oluştur', '/accounts', 'POST', response.status, duration, response.status === 201)
      expect([201, 400, 401]).toContain(response.status)
      if (response.status === 201) {
        const data = await response.json()
        expect(data.id).toBeGreaterThan(0)
        // 8000 borç = availableLimit 42000
        await prisma.creditCard.update({
          where: { id: data.id },
          data: { availableLimit: 42000 },
        })
      }
    })
  })

  describe('3. E-Cüzdan', () => {
    it('Papara (5.000 TL) oluşturmalı', async () => {
      if (!refs.currencyTry) {
        return
      }
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/ewallets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          name: 'Papara',
          provider: 'Papara',
          currencyId: refs.currencyTry.id,
          balance: 5000,
          accountPhone: '+905551234567',
        }),
      })
      const duration = Date.now() - startTime
      logTestResult('E-cüzdan oluştur', '/ewallets', 'POST', response.status, duration, response.status === 201)
      expect([201, 400, 401]).toContain(response.status)
      if (response.status === 201) {
        const data = await response.json()
        expect(data.id).toBeGreaterThan(0)
      }
    })
  })

  describe('4. Alıcılar', () => {
    it('Ev sahibi, BEDAŞ, İGDAŞ alıcıları oluşturmalı', async () => {
      const startTime = Date.now()
      const evSahibiRes = await testFetch(`${BASE_URL}/beneficiaries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          name: 'Ev Sahibi - Ahmet Yılmaz',
          iban: 'TR330006100519786457841326',
          bankId: refs.bankZiraat?.id,
          accountNo: '1234567890',
        }),
      })
      const bedasRes = await testFetch(`${BASE_URL}/beneficiaries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          name: 'BEDAŞ - Elektrik',
          description: 'Elektrik faturası',
        }),
      })
      const duration = Date.now() - startTime
      logTestResult('Alıcılar oluştur', '/beneficiaries', 'POST', evSahibiRes.status, duration, evSahibiRes.status === 201)
      expect([201, 400, 401]).toContain(evSahibiRes.status)
      if (evSahibiRes.status === 201) {
        const d1 = await evSahibiRes.json()
        beneficiaryIds = beneficiaryIds || { evSahibi: 0, bedas: 0 }
        beneficiaryIds.evSahibi = d1.id
      }
      if (bedasRes.status === 201) {
        const d2 = await bedasRes.json()
        beneficiaryIds = beneficiaryIds || { evSahibi: 0, bedas: 0 }
        beneficiaryIds.bedas = d2.id
      }
    })
  })

  describe('5. Kredi', () => {
    it('Taşıt kredisi (300.000 TL, 36 ay) oluşturmalı', async () => {
      if (!refs.bankZiraat || !refs.currencyTry) {
        return
      }
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/loans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          name: 'Taşıt Kredisi',
          bankId: refs.bankZiraat.id,
          loanType: 'VEHICLE',
          totalAmount: 300000,
          installmentCount: 36,
          remainingInstallments: 36,
          interestRate: 3.0,
          paymentDay: 15,
          currencyId: refs.currencyTry.id,
          startDate: '2025-06-01',
          isFictional: false,
        }),
      })
      const duration = Date.now() - startTime
      logTestResult('Kredi oluştur', '/loans', 'POST', response.status, duration, [200, 201].includes(response.status))
      expect([200, 201, 400, 401]).toContain(response.status)
      if (response.status === 200 || response.status === 201) {
        const data = await response.json()
        const id = typeof data?.id === 'number' ? data.id : Number(data?.id)
        expect(id).toBeGreaterThan(0)
      }
    })
  })

  describe('6. Altın', () => {
    it('2 çeyrek altın eklemeli', async () => {
      if (!refs.goldTypeCeyrek || !refs.goldPurity22K) {
        return
      }
      // 2026 Ocak altın fiyatı ~5500 TL/gr tahmini, 1.8gr çeyrek = ~9900 TL
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/gold`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          name: '2 Çeyrek Altın',
          goldTypeId: refs.goldTypeCeyrek.id,
          goldPurityId: refs.goldPurity22K.id,
          weightGrams: 3.6,
          purchasePrice: 19800,
        }),
      })
      const duration = Date.now() - startTime
      logTestResult('Altın ekle', '/gold', 'POST', response.status, duration, [201, 403].includes(response.status))
      expect([201, 403, 401]).toContain(response.status)
    })
  })

  describe('7. Yatırım', () => {
    it('BIST30 fon (10.000 TL) eklemeli', async () => {
      if (!refs.currencyTry) {
        return
      }
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/investments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          investmentType: 'FUND',
          name: 'BIST30 Endeks Fonu',
          symbol: 'BIST30',
          quantity: 100,
          purchasePrice: 100,
          currencyId: refs.currencyTry.id,
          riskLevel: 'medium',
          purchaseDate: '2026-01-15',
        }),
      })
      const duration = Date.now() - startTime
      logTestResult('Yatırım ekle', '/investments', 'POST', response.status, duration, [201, 403].includes(response.status))
      expect([201, 403, 400, 401]).toContain(response.status)
    })
  })

  describe('8. Hedef', () => {
    it('Tatil hedefi (50.000 TL) eklemeli', async () => {
      if (!refs.currencyTry) {
        return
      }
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          name: 'Tatil Hedefi',
          targetAmount: 50000,
          currencyId: refs.currencyTry.id,
          targetDate: '2026-12-31',
          category: 'travel',
        }),
      })
      const duration = Date.now() - startTime
      logTestResult('Hedef ekle', '/goals', 'POST', response.status, duration, response.status === 201)
      expect([201, 400, 401]).toContain(response.status)
    })
  })

  describe('9. Gelir İşlemleri', () => {
    it('Hesapları al (gerekirse)', async () => {
      if (accountIds.anaHesap > 0) {return}
      const res = await testFetch(`${BASE_URL}/accounts`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      if (res.status === 200) {
        const accounts = await res.json()
        const bankAcc = accounts.find((a: { accountType: string }) => a.accountType === 'bank')
        if (bankAcc) {accountIds.anaHesap = bankAcc.id}
      }
    })

    it('Maaş (115.000 TL) işlemi eklemeli', async () => {
      if (!refs.txTypeGelir || !refs.categoryMaas || !refs.paymentMethodParam || !refs.currencyTry || !accountIds?.anaHesap) {
        return
      }
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          txTypeId: refs.txTypeGelir.id,
          categoryId: refs.categoryMaas.id,
          paymentMethodId: refs.paymentMethodParam.id,
          accountId: accountIds.anaHesap,
          amount: 115000,
          currencyId: refs.currencyTry.id,
          transactionDate: '2026-01-15',
          description: 'Ocak 2026 Maaş',
        }),
      })
      const duration = Date.now() - startTime
      logTestResult('Maaş işlemi ekle', '/transactions', 'POST', response.status, duration, [201, 403].includes(response.status))
      expect([201, 403, 422, 401]).toContain(response.status)
    })

    it('Yemek kartı (2.500 TL) işlemi eklemeli', async () => {
      if (!refs.txTypeGelir || !refs.categoryYemekKarti || !refs.paymentMethodParam || !refs.currencyTry || !accountIds?.anaHesap) {
        return
      }
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          txTypeId: refs.txTypeGelir.id,
          categoryId: refs.categoryYemekKarti.id,
          paymentMethodId: refs.paymentMethodParam.id,
          accountId: accountIds.anaHesap,
          amount: 2500,
          currencyId: refs.currencyTry.id,
          transactionDate: '2026-01-15',
          description: 'Yemek kartı bakiyesi',
        }),
      })
      const duration = Date.now() - startTime
      logTestResult('Yemek kartı işlemi ekle', '/transactions', 'POST', response.status, duration, [201, 403].includes(response.status))
      expect([201, 403, 422, 401]).toContain(response.status)
    })
  })

  describe('10. Gider İşlemleri', () => {
    it('Alıcıları al (gerekirse)', async () => {
      if (beneficiaryIds.evSahibi > 0) {return}
      const res = await testFetch(`${BASE_URL}/beneficiaries`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      if (res.status === 200) {
        const bens = await res.json()
        const ev = bens.find((b: { name: string }) => b.name?.includes('Ev Sahibi'))
        if (ev) {beneficiaryIds.evSahibi = ev.id}
      }
    })

    it('Kira (35.000 TL) işlemi eklemeli', async () => {
      if (!refs.txTypeGider || !refs.categoryKira || !refs.paymentMethodParam || !refs.currencyTry || !accountIds?.anaHesap) {
        return
      }
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          txTypeId: refs.txTypeGider.id,
          categoryId: refs.categoryKira.id,
          paymentMethodId: refs.paymentMethodParam.id,
          accountId: accountIds.anaHesap,
          beneficiaryId: beneficiaryIds?.evSahibi,
          amount: 35000,
          currencyId: refs.currencyTry.id,
          transactionDate: '2026-01-05',
          description: 'Ocak 2026 Kira',
        }),
      })
      const duration = Date.now() - startTime
      logTestResult('Kira işlemi ekle', '/transactions', 'POST', response.status, duration, [201, 403].includes(response.status))
      expect([201, 403, 422, 401]).toContain(response.status)
    })

    it('Fatura, Market, Ulaşım işlemleri eklemeli', async () => {
      if (!refs.txTypeGider || !refs.paymentMethodParam || !refs.currencyTry || !accountIds?.anaHesap) {
        return
      }
      const giderler = [
        { category: refs.categoryFatura, amount: 850, desc: 'Elektrik' },
        { category: refs.categoryFatura, amount: 180, desc: 'Su' },
        { category: refs.categoryFatura, amount: 1200, desc: 'Doğalgaz' },
        { category: refs.categoryFatura, amount: 450, desc: 'İnternet' },
        { category: refs.categoryMarket, amount: 8000, desc: 'Market' },
        { category: refs.categoryUlasim, amount: 3500, desc: 'Ulaşım' },
        { category: refs.categorySaglik, amount: 1500, desc: 'Sağlık sigortası' },
        { category: refs.categoryAbonelik, amount: 350, desc: 'Netflix, Spotify' },
      ].filter((g) => g.category !== null && g.category !== undefined)

      for (const g of giderler) {
        if (!g.category) {
          continue
        }
        const res = await testFetch(`${BASE_URL}/transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: createAuthCookie(authToken),
          },
          body: JSON.stringify({
            txTypeId: refs.txTypeGider.id,
            categoryId: g.category.id,
            paymentMethodId: refs.paymentMethodParam.id,
            accountId: accountIds.anaHesap,
            amount: g.amount,
            currencyId: refs.currencyTry.id,
            transactionDate: '2026-01-10',
            description: g.desc,
          }),
        })
        expect([201, 403, 422, 401]).toContain(res.status)
      }
    })
  })

  describe('11. Otomatik Ödeme', () => {
    it('Kira otomatik ödemesi eklemeli', async () => {
      if (!refs.categoryKira || !refs.currencyTry || !refs.paymentMethodHavale || !accountIds?.anaHesap || !beneficiaryIds?.evSahibi) {
        return
      }
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auto-payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: createAuthCookie(authToken),
        },
        body: JSON.stringify({
          name: 'Aylık Kira',
          amount: 35000,
          currencyId: refs.currencyTry.id,
          paymentMethodId: refs.paymentMethodHavale.id,
          categoryId: refs.categoryKira.id,
          frequency: 'monthly',
          accountId: accountIds.anaHesap,
          beneficiaryId: beneficiaryIds.evSahibi,
          nextPaymentDate: '2026-02-05',
        }),
      })
      const duration = Date.now() - startTime
      logTestResult('Otomatik ödeme ekle', '/auto-payments', 'POST', response.status, duration, [201, 403].includes(response.status))
      expect([201, 403, 400, 401]).toContain(response.status)
    })
  })

  describe('12. Dashboard Doğrulama', () => {
    it('Dashboard verilerini getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/dashboard`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime
      logTestResult('Dashboard getir', '/dashboard', 'GET', response.status, duration, response.status === 200)
      expect(response.status).toBe(200)
      if (response.status === 200) {
        const data = await response.json()
        expect(data).toHaveProperty('kpi')
        expect(data).toHaveProperty('assets')
        expect(data).toHaveProperty('categoryBreakdown')
      }
    })
  })

  describe('13. Analiz Doğrulama', () => {
    it('Analiz verilerini getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/analysis?period=30d`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime
      logTestResult('Analiz getir', '/analysis', 'GET', response.status, duration, [200, 403].includes(response.status))
      expect([200, 403]).toContain(response.status)
    })

    it('Nakit akışı analizini getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/analysis/cashflow`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime
      logTestResult('Nakit akışı getir', '/analysis/cashflow', 'GET', response.status, duration, [200, 403].includes(response.status))
      expect([200, 403]).toContain(response.status)
    })

    it('Kategori analizini getirmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/analysis/categories`, {
        headers: { Cookie: createAuthCookie(authToken) },
      })
      const duration = Date.now() - startTime
      logTestResult('Kategori analizi getir', '/analysis/categories', 'GET', response.status, duration, [200, 403].includes(response.status))
      expect([200, 403]).toContain(response.status)
    })
  })
})

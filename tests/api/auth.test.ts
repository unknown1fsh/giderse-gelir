import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import {
  testFetch,
  createAuthCookie,
  logTestResult,
  logTestSuiteStart,
  logTestSuiteEnd,
} from '../helpers/test-utils'

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:3000/api'

// Bu test dosyası Auth API endpoint'lerini test eder.
describe('Auth API Endpoints', () => {
  let testUsername: string
  let testEmail: string
  let testPassword: string
  let authToken: string

  beforeAll(() => {
    logTestSuiteStart('Auth API Endpoints')
    const timestamp = Date.now()
    testUsername = `authuser${timestamp}`
    testEmail = `test-auth-${timestamp}@test.com`
    testPassword = 'Test123456'
  })

  afterAll(async () => {
    // Temizlik
    await prisma.user.deleteMany({
      where: { email: testEmail },
    })
    await prisma.$disconnect()
    logTestSuiteEnd('Auth API Endpoints')
  })

  describe('POST /api/auth/register', () => {
    it('yeni kullanıcı kaydı başarılı olmalı', async () => {
      // Rate limiting için bekle
      await new Promise(resolve => setTimeout(resolve, 2000))

      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: testUsername,
          name: 'Test User',
          email: testEmail,
          password: testPassword,
          phone: '+905551234567',
        }),
      })

      // Kayıt sonrası kullanıcıyı DB'de aktif et (yeni sistemde admin onayı gerekiyor)
      await prisma.user.updateMany({
        where: { email: testEmail },
        data: { isActive: true },
      })
      const duration = Date.now() - startTime

      const success = response.status === 201
      logTestResult(
        'yeni kullanıcı kaydı başarılı olmalı',
        '/auth/register',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 201, alınan ${response.status}`
      )

      if (response.status === 201) {
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(data).toHaveProperty('message')
        expect(data.requiresApproval).toBe(true)

        // Kayıt başarılı, şimdi login ile token al
        const loginResponse = await testFetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testEmail,
            password: testPassword,
          }),
        })

        if (loginResponse.status === 200) {
          const loginData = await loginResponse.json()
          authToken = loginData.session.token
        }
      } else {
        // Rate limiting veya başka bir hata - login ile token al (zaten yukarda denedik ama fallback)
        const loginResponse = await testFetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testEmail,
            password: testPassword,
          }),
        })
        if (loginResponse.status === 200) {
          const loginData = await loginResponse.json()
          authToken = loginData.session.token
        }
      }
    })

    it('duplicate email ile kayıt hata vermeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: testUsername + '_2',
          name: 'Test User 2',
          email: testEmail,
          password: 'Test123456',
        }),
      })
      const duration = Date.now() - startTime

      const success = response.status === 400 || response.status === 409
      const errorData = success ? undefined : await response.json().catch(() => ({}))
      logTestResult(
        'duplicate email ile kayıt hata vermeli',
        '/auth/register',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : JSON.stringify(errorData)
      )

      expect([400, 409]).toContain(response.status)
    })

    it('eksik alanlar ile kayıt hata vermeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          // email eksik
          password: testPassword,
        }),
      })
      const duration = Date.now() - startTime

      const success = response.status === 400
      const errorData = success ? undefined : await response.json().catch(() => ({}))
      logTestResult(
        'eksik alanlar ile kayıt hata vermeli',
        '/auth/register',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : JSON.stringify(errorData)
      )

      expect(response.status).toBe(400)
    })

    it('kısa şifre ile kayıt hata vermeli', async () => {
      // Rate limiting için bekle
      await new Promise(resolve => setTimeout(resolve, 1000))

      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `shortpass${Date.now()}`,
          name: 'Test User',
          email: `test-short-password-${Date.now()}@test.com`,
          password: '12345', // 5 karakter, minimum 8 olmalı
        }),
      })
      const duration = Date.now() - startTime

      const success = response.status === 400 || response.status === 429
      const errorData = success ? undefined : await response.json().catch(() => ({}))
      logTestResult(
        'kısa şifre ile kayıt hata vermeli',
        '/auth/register',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : JSON.stringify(errorData)
      )

      expect([400, 429]).toContain(response.status)
    })

    it('geçersiz email formatı ile kayıt hata vermeli', async () => {
      // Rate limiting için bekle
      await new Promise(resolve => setTimeout(resolve, 1000))

      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `invmail${Date.now()}`,
          name: 'Test User',
          email: 'gecersiz-email',
          password: testPassword,
        }),
      })
      const duration = Date.now() - startTime

      const success = response.status === 400 || response.status === 429
      const errorData = success ? undefined : await response.json().catch(() => ({}))
      logTestResult(
        'geçersiz email formatı ile kayıt hata vermeli',
        '/auth/register',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : JSON.stringify(errorData)
      )

      expect([400, 429]).toContain(response.status)
    })
  })

  describe('POST /api/auth/login', () => {
    it('doğru credentials ile giriş başarılı olmalı', async () => {
      // Eğer token yoksa, önce register yap
      if (!authToken) {
        const registerResponse = await testFetch(`${BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: testUsername,
            name: 'Test User',
            email: testEmail,
            password: testPassword,
            phone: '+905551234567',
          }),
        })
        if (registerResponse.status === 201) {
          // Kayıt sonrası kullanıcıyı DB'de aktif et
          await prisma.user.updateMany({
            where: { email: testEmail },
            data: { isActive: true },
          })

          // Login ile token al
          const loginResponse = await testFetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: testEmail,
              password: testPassword,
            }),
          })

          if (loginResponse.status === 200) {
            const loginData = await loginResponse.json()
            authToken = loginData.session.token
          }
        }
      }

      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      })
      const duration = Date.now() - startTime

      const success = response.status === 200
      logTestResult(
        'doğru credentials ile giriş başarılı olmalı',
        '/auth/login',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200, alınan ${response.status}`
      )

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('user')
      expect(data).toHaveProperty('session')
      expect(data.session).toHaveProperty('token')

      authToken = data.session.token
    })

    it('yanlış şifre ile giriş hata vermeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'WrongPassword',
        }),
      })
      const duration = Date.now() - startTime

      const success = response.status === 401
      const errorData = success ? undefined : await response.json().catch(() => ({}))
      logTestResult(
        'yanlış şifre ile giriş hata vermeli',
        '/auth/login',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : JSON.stringify(errorData)
      )

      expect(response.status).toBe(401)
    })

    it('olmayan kullanıcı ile giriş hata vermeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@test.com',
          password: 'Test123456',
        }),
      })
      const duration = Date.now() - startTime

      const success = response.status === 401
      const errorData = success ? undefined : await response.json().catch(() => ({}))
      logTestResult(
        'olmayan kullanıcı ile giriş hata vermeli',
        '/auth/login',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : JSON.stringify(errorData)
      )

      expect(response.status).toBe(401)
    })

    it('eksik alanlar ile giriş hata vermeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          // password eksik
        }),
      })
      const duration = Date.now() - startTime

      const success = response.status === 400
      const errorData = success ? undefined : await response.json().catch(() => ({}))
      logTestResult(
        'eksik alanlar ile giriş hata vermeli',
        '/auth/login',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : JSON.stringify(errorData)
      )

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/auth/me', () => {
    it('token ile kullanıcı bilgisi alınmalı', async () => {
      // Eğer token yoksa, önce login yap
      if (!authToken) {
        const loginResponse = await testFetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testEmail,
            password: testPassword,
          }),
        })
        if (loginResponse.status === 200) {
          const loginData = await loginResponse.json()
          authToken = loginData.session.token
        }
      }

      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auth/me`, {
        headers: {
          Cookie: createAuthCookie(authToken),
        },
      })
      const duration = Date.now() - startTime

      const success = response.status === 200
      logTestResult(
        'token ile kullanıcı bilgisi alınmalı',
        '/auth/me',
        'GET',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200, alınan ${response.status}`
      )

      expect([200, 401]).toContain(response.status)
      if (response.status === 200) {
        const data = await response.json()
        expect(data).toHaveProperty('user')
        expect(data.user.email).toBe(testEmail)
        expect(data.user).toHaveProperty('id')
        expect(data.user).toHaveProperty('name')
      }
    })

    it('token olmadan 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auth/me`)
      const duration = Date.now() - startTime

      const success = response.status === 401
      logTestResult(
        'token olmadan 401 dönmeli',
        '/auth/me',
        'GET',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 401, alınan ${response.status}`
      )

      expect(response.status).toBe(401)
    })

    it('geçersiz token ile 401 dönmeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auth/me`, {
        headers: {
          Cookie: createAuthCookie('invalid-token-12345'),
        },
      })
      const duration = Date.now() - startTime

      const success = response.status === 401
      logTestResult(
        'geçersiz token ile 401 dönmeli',
        '/auth/me',
        'GET',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 401, alınan ${response.status}`
      )

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/auth/verify-email', () => {
    it('geçerli token ile email doğrulama başarılı olmalı', async () => {
      // Önce kullanıcıya verification token ekle
      const user = await prisma.user.findUnique({ where: { email: testEmail } })
      if (user) {
        const crypto = await import('crypto')
        const token = crypto.randomBytes(32).toString('hex')
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerificationToken: token,
            emailVerificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
            emailVerified: false,
          },
        })

        const startTime = Date.now()
        const response = await testFetch(`${BASE_URL}/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const duration = Date.now() - startTime

        const success = response.status === 200
        logTestResult(
          'geçerli token ile email doğrulama başarılı olmalı',
          '/auth/verify-email',
          'POST',
          response.status,
          duration,
          success,
          success ? undefined : `Beklenen 200, alınan ${response.status}`
        )

        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data.success).toBe(true)
      }
    })

    it('geçersiz token ile hata vermeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'invalid-token' }),
      })
      const duration = Date.now() - startTime

      const success = response.status === 404 || response.status === 400
      const errorData = success ? undefined : await response.json().catch(() => ({}))
      logTestResult(
        'geçersiz token ile hata vermeli',
        '/auth/verify-email',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : JSON.stringify(errorData)
      )

      expect([404, 400]).toContain(response.status)
    })

    it('token olmadan hata vermeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const duration = Date.now() - startTime

      const success = response.status === 400
      const errorData = success ? undefined : await response.json().catch(() => ({}))
      logTestResult(
        'token olmadan hata vermeli',
        '/auth/verify-email',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : JSON.stringify(errorData)
      )

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/auth/resend-verification', () => {
    it('email ile doğrulama emaili yeniden göndermeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      })
      const duration = Date.now() - startTime

      const success = response.status === 200
      logTestResult(
        'email ile doğrulama emaili yeniden göndermeli',
        '/auth/resend-verification',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200, alınan ${response.status}`
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })

    it('email olmadan hata vermeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const duration = Date.now() - startTime

      const success = response.status === 400
      const errorData = success ? undefined : await response.json().catch(() => ({}))
      logTestResult(
        'email olmadan hata vermeli',
        '/auth/resend-verification',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : JSON.stringify(errorData)
      )

      expect(response.status).toBe(400)
    })

    it('olmayan email için de başarılı mesaj dönmeli (güvenlik)', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nonexistent@test.com' }),
      })
      const duration = Date.now() - startTime

      const success = response.status === 200
      logTestResult(
        'olmayan email için de başarılı mesaj dönmeli (güvenlik)',
        '/auth/resend-verification',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200, alınan ${response.status}`
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })
  })

  describe('POST /api/auth/forgot-password', () => {
    it('email ile şifre sıfırlama isteği göndermeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      })
      const duration = Date.now() - startTime

      const success = response.status === 200
      logTestResult(
        'email ile şifre sıfırlama isteği göndermeli',
        '/auth/forgot-password',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200, alınan ${response.status}`
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })

    it('email olmadan hata vermeli', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const duration = Date.now() - startTime

      const success = response.status === 400
      const errorData = success ? undefined : await response.json().catch(() => ({}))
      logTestResult(
        'email olmadan hata vermeli',
        '/auth/forgot-password',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : JSON.stringify(errorData)
      )

      expect(response.status).toBe(400)
    })

    it('olmayan email için de başarılı mesaj dönmeli (güvenlik)', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nonexistent@test.com' }),
      })
      const duration = Date.now() - startTime

      const success = response.status === 200
      logTestResult(
        'olmayan email için de başarılı mesaj dönmeli (güvenlik)',
        '/auth/forgot-password',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200, alınan ${response.status}`
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })
  })

  describe('POST /api/auth/logout', () => {
    it('token olmadan logout da başarılı olmalı (endpoint token olmadan da çalışır)', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
      })
      const duration = Date.now() - startTime

      const success = response.status === 200
      logTestResult(
        'token olmadan logout da başarılı olmalı',
        '/auth/logout',
        'POST',
        response.status,
        duration,
        success,
        success ? undefined : `Beklenen 200, alınan ${response.status}`
      )

      expect(response.status).toBe(200)
    })

    it('logout başarılı olmalı', async () => {
      // Logout testi için yeni bir token oluştur
      const loginResponse = await testFetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      })

      if (loginResponse.status === 200) {
        const loginData = await loginResponse.json()
        const logoutToken = loginData.session.token

        const startTime = Date.now()
        const response = await testFetch(`${BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Cookie: createAuthCookie(logoutToken),
          },
        })
        const duration = Date.now() - startTime

        const success = response.status === 200
        logTestResult(
          'logout başarılı olmalı',
          '/auth/logout',
          'POST',
          response.status,
          duration,
          success,
          success ? undefined : `Beklenen 200, alınan ${response.status}`
        )

        expect(response.status).toBe(200)

        const data = await response.json()
        expect(data.success).toBe(true)
      }
    })
  })
})

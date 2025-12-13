import { PrismaClient } from '@prisma/client'
import { getTestLogger, TestResult } from './test-logger'

const prisma = new PrismaClient()
const logger = getTestLogger()

// Bu dosya test yardımcı fonksiyonlarını içerir.

// Bu metot test kullanıcısı oluşturur.
// Girdi: Email suffix (opsiyonel)
// Çıktı: { user, token, email, password }
// Hata: -
export async function createTestUser(emailSuffix = 'user') {
  const email = `test-${emailSuffix}-${Date.now()}@test.com`
  const password = 'Test123456'

  // Sunucudaki auth mekanizmasını kullanarak (register/login) geçerli session token al.
  // Not: Register/Login rate limit IP bazlı; her çağrıda farklı X-Forwarded-For veriyoruz.
  const baseUrl = 'http://localhost:3000/api'
  const randomIp = () =>
    `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`

  const registerResponse = await testFetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': randomIp(),
      'user-agent': 'vitest',
    },
    body: JSON.stringify({
      name: `Test ${emailSuffix}`,
      email,
      password,
      phone: '+905551234567',
      plan: 'free',
    }),
  })

  let token: string | undefined
  if (registerResponse.status === 201) {
    const data = await registerResponse.json()
    token = data?.session?.token
  } else {
    // Register başarısızsa (örn: 429) login ile devam et
    const loginResponse = await testFetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': randomIp(),
        'user-agent': 'vitest',
      },
      body: JSON.stringify({ email, password }),
    })
    if (loginResponse.status === 200) {
      const data = await loginResponse.json()
      token = data?.session?.token
    }
  }

  if (!token) {
    throw new Error(
      `Test kullanıcısı için token alınamadı. register=${registerResponse.status}. Sunucu loglarını kontrol edin.`
    )
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new Error(`Test kullanıcısı DB'de bulunamadı: ${email}`)
  }

  return { user, token, email, password }
}

// Bu metot admin test kullanıcısı oluşturur.
// Girdi: Email suffix (opsiyonel)
// Çıktı: { user, token, email, password }
// Hata: -
export async function createTestAdminUser(emailSuffix = 'admin') {
  const created = await createTestUser(emailSuffix)

  const updatedUser = await prisma.user.update({
    where: { id: created.user.id },
    data: {
      role: 'ADMIN',
      emailVerified: true,
    },
  })

  return { ...created, user: updatedUser }
}

// Bu metot test hesabı oluşturur.
// Girdi: userId
// Çıktı: account
// Hata: -
export async function createTestAccount(userId: number) {
  // Kullanıcının var olduğunu kontrol et
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error(`Kullanıcı bulunamadı: userId=${userId}. Önce createTestUser() ile kullanıcı oluşturun.`)
  }

  // Referans verileri al
  const accountType = await prisma.refAccountType.findFirst()
  const bank = await prisma.refBank.findFirst()
  const currency = await prisma.refCurrency.findFirst({ where: { code: 'TRY' } })

  if (!accountType || !bank || !currency) {
    throw new Error('Referans verileri eksik')
  }

  return prisma.account.create({
    data: {
      userId,
      name: 'Test Hesap',
      accountTypeId: accountType.id,
      bankId: bank.id,
      currencyId: currency.id,
      balance: 10000,
      active: true,
    },
  })
}

// Bu metot test kredi kartı oluşturur.
// Girdi: userId
// Çıktı: creditCard
// Hata: -
export async function createTestCreditCard(userId: number) {
  // Kullanıcının var olduğunu kontrol et
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error(`Kullanıcı bulunamadı: userId=${userId}. Önce createTestUser() ile kullanıcı oluşturun.`)
  }

  const bank = await prisma.refBank.findFirst()
  const currency = await prisma.refCurrency.findFirst({ where: { code: 'TRY' } })

  if (!bank || !currency) {
    throw new Error('Referans verileri eksik')
  }

  return prisma.creditCard.create({
    data: {
      userId,
      name: 'Test Kart',
      bankId: bank.id,
      currencyId: currency.id,
      limitAmount: 10000,
      availableLimit: 10000,
      statementDay: 15,
      dueDay: 5,
      minPaymentPercent: 3.0,
      active: true,
    },
  })
}

// Bu metot test dönemi oluşturur.
// Girdi: userId, periodType (opsiyonel)
// Çıktı: period
// Hata: -
export async function createTestPeriod(userId: number, periodType = 'monthly') {
  // Kullanıcının var olduğunu kontrol et
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error(`Kullanıcı bulunamadı: userId=${userId}. Önce createTestUser() ile kullanıcı oluşturun.`)
  }

  const startDate = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 1)

  return prisma.period.create({
    data: {
      userId,
      name: `Test Dönem ${Date.now()}`,
      periodType,
      startDate,
      endDate,
      isActive: false,
      isClosed: false,
    },
  })
}

// Bu metot test ticket oluşturur.
// Girdi: userId, categoryId (opsiyonel)
// Çıktı: ticket
// Hata: -
export async function createTestTicket(userId: number, categoryId?: number) {
  // Eğer categoryId verilmemişse, ilk aktif kategoriyi al
  let catId = categoryId
  if (!catId) {
    const category = await prisma.supportTicketCategory.findFirst({
      where: { isActive: true },
    })
    if (!category) {
      throw new Error('Aktif destek kategorisi bulunamadı')
    }
    catId = category.id
  }

  const ticketNumber = `SUP-${Date.now()}-${Math.floor(Math.random() * 1000000)}`

  return prisma.supportTicket.create({
    data: {
      ticketNumber,
      userId,
      categoryId: catId,
      subject: 'Test Ticket',
      description: 'Bu bir test ticket açıklamasıdır',
      status: 'pending',
      priority: 'medium',
    },
    include: {
      category: true,
    },
  })
}

// Bu metot test alıcı oluşturur.
// Girdi: userId
// Çıktı: beneficiary
// Hata: -
export async function createTestBeneficiary(userId: number) {
  // Kullanıcının var olduğunu kontrol et
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error(`Kullanıcı bulunamadı: userId=${userId}. Önce createTestUser() ile kullanıcı oluşturun.`)
  }

  const bank = await prisma.refBank.findFirst()

  return prisma.beneficiary.create({
    data: {
      userId,
      name: 'Test Alıcı',
      iban: 'TR330006100519786457841326',
      bankId: bank?.id,
      accountNo: '1234567890',
      phoneNumber: '+905551234567',
      email: 'test-beneficiary@test.com',
      active: true,
    },
    include: {
      bank: true,
    },
  })
}

// Bu metot test e-cüzdan oluşturur.
// Girdi: userId
// Çıktı: eWallet
// Hata: -
export async function createTestEwallet(userId: number) {
  // Kullanıcının var olduğunu kontrol et
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error(`Kullanıcı bulunamadı: userId=${userId}. Önce createTestUser() ile kullanıcı oluşturun.`)
  }

  const currency = await prisma.refCurrency.findFirst({ where: { code: 'TRY' } })

  if (!currency) {
    throw new Error('Referans verileri eksik')
  }

  return prisma.eWallet.create({
    data: {
      userId,
      name: 'Test E-Cüzdan',
      provider: 'TestProvider',
      accountEmail: 'test-ewallet@test.com',
      accountPhone: '+905551234567',
      balance: 1000,
      currencyId: currency.id,
      active: true,
    },
    include: {
      currency: true,
    },
  })
}

// Bu metot test kullanıcısını siler.
// Girdi: userId
// Çıktı: void
// Hata: -
export async function deleteTestUser(userId: number) {
  await prisma.user.delete({
    where: { id: userId },
  })
}

// Bu metot auth cookie string oluşturur.
// Girdi: token
// Çıktı: cookie string
// Hata: -
export function createAuthCookie(token: string): string {
  return `auth-token=${token}`
}

// Bu metot sunucunun çalışıp çalışmadığını kontrol eder.
// Girdi: -
// Çıktı: boolean
// Hata: -
export async function isServerRunning(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3000/api/health', {
      signal: AbortSignal.timeout(2000),
    })
    return response.ok
  } catch {
    return false
  }
}

// Bu metot fetch çağrısı yapar, sunucu çalışmıyorsa anlamlı hata verir.
// Girdi: url, options
// Çıktı: Response
// Hata: -
export async function testFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, options)
  } catch (error: any) {
    if (error?.code === 'ECONNREFUSED' || error?.message?.includes('ECONNREFUSED')) {
      throw new Error(`Sunucu çalışmıyor (${url}). Lütfen sunucuyu başlatın: npm run dev`)
    }
    throw error
  }
}

// Bu metot test sonucunu loglar ve logger'a yazar.
// Girdi: testName, endpoint, method, status, duration, success, error?, stackTrace?
// Çıktı: void
export function logTestResult(
  testName: string,
  endpoint: string,
  method: string,
  status: number,
  duration: number,
  success: boolean,
  error?: string,
  stackTrace?: string
) {
  const result: TestResult = {
    testName,
    endpoint,
    method,
    status,
    duration,
    success,
    error,
    stackTrace,
  }
  logger.logTestResult(result)
}

// Bu metot test suite başlangıcını loglar.
// Girdi: suiteName
// Çıktı: void
export function logTestSuiteStart(suiteName: string) {
  logger.logTestStart(suiteName)
}

// Bu metot test suite bitişini loglar.
// Girdi: suiteName
// Çıktı: void
export function logTestSuiteEnd(suiteName: string) {
  logger.logTestEnd(suiteName)
}

import { NextRequest, NextResponse } from 'next/server'
import { getActivePeriod, getCurrentUser } from '@/lib/auth'
import {
  buildAutoPaymentInput,
  serializeAutoPaymentRecord,
} from '@/lib/finance/auto-payments'
import { syncNotificationEvents } from '@/lib/notifications/service'
import { prisma } from '@/lib/prisma'

const AUTO_PAYMENT_INCLUDE = {
  category: true,
  currency: true,
  paymentMethod: true,
  account: {
    include: {
      bank: true,
      currency: true,
    },
  },
  creditCard: {
    include: {
      bank: true,
      currency: true,
    },
  },
  eWallet: true,
  beneficiary: {
    include: {
      bank: true,
    },
  },
} as const

async function ensurePremiumAccess(userId: number) {
  const subscription = await prisma.userSubscription.findFirst({
    where: {
      userId,
      status: 'active',
    },
    orderBy: { createdAt: 'desc' },
  })

  return (subscription?.planId || 'free') !== 'free'
}

async function resolvePaymentMethodId(inputId: number) {
  const directMatch = await prisma.refPaymentMethod.findFirst({
    where: {
      id: inputId,
      active: true,
    },
  })

  if (directMatch) {
    return directMatch.id
  }

  const systemParam = await prisma.systemParameter.findFirst({
    where: {
      id: inputId,
      paramGroup: 'PAYMENT_METHOD',
      isActive: true,
    },
  })

  if (!systemParam?.paramCode) {
    return null
  }

  const mapped = await prisma.refPaymentMethod.findFirst({
    where: {
      code: systemParam.paramCode,
      active: true,
    },
  })

  return mapped?.id ?? null
}

async function validateRelations(
  userId: number,
  input: {
    currencyId: number
    categoryId: number
    accountId: number | null
    creditCardId: number | null
    eWalletId: number | null
    beneficiaryId: number | null
  }
) {
  const [currency, category, account, creditCard, eWallet, beneficiary] = await Promise.all([
    prisma.refCurrency.findFirst({
      where: { id: input.currencyId, active: true },
      select: { id: true },
    }),
    prisma.refTxCategory.findFirst({
      where: { id: input.categoryId, active: true },
      select: { id: true },
    }),
    input.accountId
      ? prisma.account.findFirst({
          where: { id: input.accountId, userId, active: true },
          select: { id: true },
        })
      : Promise.resolve(null),
    input.creditCardId
      ? prisma.creditCard.findFirst({
          where: { id: input.creditCardId, userId, active: true },
          select: { id: true },
        })
      : Promise.resolve(null),
    input.eWalletId
      ? prisma.eWallet.findFirst({
          where: { id: input.eWalletId, userId, active: true },
          select: { id: true },
        })
      : Promise.resolve(null),
    input.beneficiaryId
      ? prisma.beneficiary.findFirst({
          where: { id: input.beneficiaryId, userId, active: true },
          select: { id: true },
        })
      : Promise.resolve(null),
  ])

  if (!currency) {
    return 'Gecerli bir para birimi secin.'
  }
  if (!category) {
    return 'Gecerli bir kategori secin.'
  }
  if (input.accountId && !account) {
    return 'Secilen hesap size ait degil veya aktif degil.'
  }
  if (input.creditCardId && !creditCard) {
    return 'Secilen kredi karti size ait degil veya aktif degil.'
  }
  if (input.eWalletId && !eWallet) {
    return 'Secilen e-cuzdan size ait degil veya aktif degil.'
  }
  if (input.beneficiaryId && !beneficiary) {
    return 'Secilen lehtar size ait degil veya aktif degil.'
  }

  return null
}

async function getOwnedAutoPayment(autoPaymentId: number, userId: number) {
  return prisma.autoPayment.findFirst({
    where: {
      id: autoPaymentId,
      userId,
    },
    include: AUTO_PAYMENT_INCLUDE,
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const { id } = await params
    const autoPaymentId = Number(id)
    if (!Number.isInteger(autoPaymentId) || autoPaymentId <= 0) {
      return NextResponse.json({ error: 'Geçersiz otomatik ödeme ID' }, { status: 400 })
    }

    const autoPayment = await getOwnedAutoPayment(autoPaymentId, user.id)
    if (!autoPayment) {
      return NextResponse.json({ error: 'Otomatik ödeme bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(serializeAutoPaymentRecord(autoPayment))
  } catch (error) {
    console.error('Auto payment detail GET error:', error)
    return NextResponse.json({ error: 'Otomatik odeme alinamadi' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const hasPremiumAccess = await ensurePremiumAccess(user.id)
    if (!hasPremiumAccess) {
      return NextResponse.json(
        {
          error: 'Otomatik odemeler premium uyelik gerektirir.',
          requiresPremium: true,
          feature: 'Otomatik Odemeler',
        },
        { status: 403 }
      )
    }

    const { id } = await params
    const autoPaymentId = Number(id)
    if (!Number.isInteger(autoPaymentId) || autoPaymentId <= 0) {
      return NextResponse.json({ error: 'Geçersiz otomatik ödeme ID' }, { status: 400 })
    }

    const existing = await getOwnedAutoPayment(autoPaymentId, user.id)
    if (!existing) {
      return NextResponse.json({ error: 'Otomatik ödeme bulunamadı' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = buildAutoPaymentInput(body)
    if (!parsed.data) {
      return NextResponse.json({ error: parsed.error || 'Geçersiz istek' }, { status: 400 })
    }

    const paymentMethodId = await resolvePaymentMethodId(parsed.data.paymentMethodId)
    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Gecerli bir odeme yontemi secin.' }, { status: 400 })
    }

    const relationError = await validateRelations(user.id, parsed.data)
    if (relationError) {
      return NextResponse.json({ error: relationError }, { status: 400 })
    }

    const updated = await prisma.autoPayment.update({
      where: { id: autoPaymentId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        amount: parsed.data.amount,
        currencyId: parsed.data.currencyId,
        paymentMethodId,
        cronSchedule: parsed.data.cronSchedule,
        nextPaymentDate: parsed.data.nextPaymentDate,
        categoryId: parsed.data.categoryId,
        accountId: parsed.data.accountId,
        creditCardId: parsed.data.creditCardId,
        eWalletId: parsed.data.eWalletId,
        beneficiaryId: parsed.data.beneficiaryId,
        active: parsed.data.active,
      },
      include: AUTO_PAYMENT_INCLUDE,
    })

    const activePeriod = await getActivePeriod(request)
    await syncNotificationEvents(prisma, {
      userId: user.id,
      activePeriodId: activePeriod?.id,
    })

    return NextResponse.json(serializeAutoPaymentRecord(updated))
  } catch (error) {
    console.error('Auto payment PATCH error:', error)
    return NextResponse.json({ error: 'Otomatik ödeme güncellenemedi' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const hasPremiumAccess = await ensurePremiumAccess(user.id)
    if (!hasPremiumAccess) {
      return NextResponse.json(
        {
          error: 'Otomatik odemeler premium uyelik gerektirir.',
          requiresPremium: true,
          feature: 'Otomatik Odemeler',
        },
        { status: 403 }
      )
    }

    const { id } = await params
    const autoPaymentId = Number(id)
    if (!Number.isInteger(autoPaymentId) || autoPaymentId <= 0) {
      return NextResponse.json({ error: 'Geçersiz otomatik ödeme ID' }, { status: 400 })
    }

    const existing = await getOwnedAutoPayment(autoPaymentId, user.id)
    if (!existing) {
      return NextResponse.json({ error: 'Otomatik ödeme bulunamadı' }, { status: 404 })
    }

    await prisma.autoPayment.delete({
      where: { id: autoPaymentId },
    })

    const activePeriod = await getActivePeriod(request)
    await syncNotificationEvents(prisma, {
      userId: user.id,
      activePeriodId: activePeriod?.id,
    })

    return NextResponse.json({
      success: true,
      message: 'Talimat silindi. Gecmis islemler etkilenmedi.',
    })
  } catch (error) {
    console.error('Auto payment DELETE error:', error)
    return NextResponse.json({ error: 'Otomatik ödeme silinemedi' }, { status: 500 })
  }
}

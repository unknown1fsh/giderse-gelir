import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getNextPeriodSuggestion } from '@/lib/period-helpers'
import { Prisma } from '@prisma/client'

// Dönemi kapat ve isteğe bağlı olarak bakiye devri yap
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Kullanıcı doğrulama
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const { id } = await params
    const periodId = parseInt(id)
    if (isNaN(periodId)) {
      return NextResponse.json({ error: 'Geçersiz dönem ID' }, { status: 400 })
    }

    const body = (await request.json()) as { transferBalances?: boolean; closingNotes?: string }
    const { transferBalances = false, closingNotes = '' } = body

    // Dönemin varlığını ve sahipliğini kontrol et
    const period = await prisma.period.findFirst({
      where: {
        id: periodId,
        userId: user.id,
      },
    })

    if (!period) {
      return NextResponse.json({ error: 'Dönem bulunamadı' }, { status: 404 })
    }

    // Zaten kapalıysa
    if (period.isClosed) {
      return NextResponse.json({ error: 'Dönem zaten kapalı' }, { status: 400 })
    }

    // Dönem bitiş tarihi geçmemişse uyarı (opsiyonel kontrol)
    const now = new Date()
    const endDate = new Date(period.endDate)
    if (now < endDate) {
      console.warn('Dönem bitiş tarihi henüz gelmedi, yine de kapatılıyor')
    }

    // Hesap bakiyelerini ve net değeri hesapla
    const [accounts, creditCards, eWallets, investments, goldItems] = await Promise.all([
      prisma.account.findMany({
        where: { periodId, active: true },
        select: { balance: true },
      }),
      prisma.creditCard.findMany({
        where: { periodId, active: true },
        select: { limitAmount: true, availableLimit: true },
      }),
      prisma.eWallet.findMany({
        where: { periodId, active: true },
        select: { balance: true },
      }),
      prisma.investment.findMany({
        where: { periodId, active: true },
        select: { quantity: true, currentPrice: true, purchasePrice: true },
      }),
      prisma.goldItem.findMany({
        where: { periodId },
        select: { currentValueTry: true },
      }),
    ])

    // Toplam varlıklar
    const accountsTotal = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0)
    const eWalletsTotal = eWallets.reduce((sum, ew) => sum + Number(ew.balance), 0)
    const investmentsTotal = investments.reduce((sum, inv) => {
      const price = inv.currentPrice || inv.purchasePrice
      return sum + Number(inv.quantity) * Number(price)
    }, 0)
    const goldTotal = goldItems.reduce((sum, gold) => sum + Number(gold.currentValueTry || 0), 0)

    const totalAssets = accountsTotal + eWalletsTotal + investmentsTotal + goldTotal

    // Toplam yükümlülükler (kredi kartı borçları)
    const totalLiabilities = creditCards.reduce(
      (sum, cc) => sum + (Number(cc.limitAmount) - Number(cc.availableLimit)),
      0
    )

    const netWorth = totalAssets - totalLiabilities

    // Transaction içinde işlemleri yap
    const result = await prisma.$transaction(async tx => {
      // Dönemi kapat
      await tx.period.update({
        where: { id: periodId },
        data: {
          isClosed: true,
          isActive: false,
        },
      })

      // Kapanış kaydı oluştur
      const closing = await (tx as any).periodClosing.create({
        data: {
          periodId,
          closedAt: new Date(),
          closedByUserId: user.id,
          totalAssets: new Prisma.Decimal(totalAssets),
          totalLiabilities: new Prisma.Decimal(totalLiabilities),
          netWorth: new Prisma.Decimal(netWorth),
          transferredToNext: transferBalances,
          closingNotes,
        },
      })

      let nextPeriod = null

      // Bakiye devri yapılacaksa
      if (transferBalances) {
        // Bir sonraki dönemi bul veya oluştur
        const periodForSuggestion: import('@/lib/period-helpers').Period = {
          id: period.id,
          userId: period.userId,
          name: period.name,
          periodType: period.periodType as 'YEARLY' | 'FISCAL_YEAR' | 'MONTHLY' | 'CUSTOM',
          startDate: period.startDate,
          endDate: period.endDate,
          isClosed: period.isClosed,
          isActive: period.isActive,
          description: period.description,
          createdAt: period.createdAt,
          updatedAt: period.updatedAt,
        }
        const nextPeriodData = getNextPeriodSuggestion(periodForSuggestion)

        // Yeni dönem oluştur
        nextPeriod = await tx.period.create({
          data: {
            userId: user.id,
            name: nextPeriodData.name,
            periodType: nextPeriodData.periodType,
            startDate: nextPeriodData.startDate,
            endDate: nextPeriodData.endDate,
            isActive: true,
          },
        })

        // Hesapları yeni döneme kopyala
        for (const account of await tx.account.findMany({
          where: { periodId, active: true },
        })) {
          const newAccount = await tx.account.create({
            data: {
              userId: user.id,
              periodId: nextPeriod.id,
              name: account.name,
              accountTypeId: account.accountTypeId,
              bankId: account.bankId,
              currencyId: account.currencyId,
              balance: account.balance, // Açılış bakiyesi
              accountNumber: account.accountNumber,
              iban: account.iban,
              active: true,
            },
          })

          // Transfer kaydı oluştur
          if (Number(account.balance) > 0) {
            await tx.periodTransfer.create({
              data: {
                fromPeriodId: periodId,
                toPeriodId: nextPeriod.id,
                accountId: newAccount.id,
                transferAmount: account.balance,
                transferType: 'OPENING_BALANCE',
                description: `${account.name} hesabının açılış bakiyesi`,
              },
            })
          }
        }

        // Kredi kartlarını kopyala
        for (const card of await tx.creditCard.findMany({
          where: { periodId, active: true },
        })) {
          await tx.creditCard.create({
            data: {
              userId: user.id,
              periodId: nextPeriod.id,
              name: card.name,
              bankId: card.bankId,
              currencyId: card.currencyId,
              limitAmount: card.limitAmount,
              // ✅ Borcu taşı: kullanılabilir limit aynı kalsın
              availableLimit: card.availableLimit,
              statementDay: card.statementDay,
              dueDay: card.dueDay,
              minPaymentPercent: card.minPaymentPercent,
              active: true,
            },
          })
        }

        // E-cüzdanları kopyala
        for (const wallet of await tx.eWallet.findMany({
          where: { periodId, active: true },
        })) {
          await tx.eWallet.create({
            data: {
              userId: user.id,
              periodId: nextPeriod.id,
              name: wallet.name,
              provider: wallet.provider,
              accountEmail: wallet.accountEmail,
              accountPhone: wallet.accountPhone,
              balance: wallet.balance,
              currencyId: wallet.currencyId,
              active: true,
            },
          })
        }

        // Yatırımları kopyala
        for (const investment of await tx.investment.findMany({
          where: { periodId, active: true },
        })) {
          await tx.investment.create({
            data: {
              userId: user.id,
              periodId: nextPeriod.id,
              investmentType: investment.investmentType,
              name: investment.name,
              symbol: investment.symbol,
              quantity: investment.quantity,
              purchasePrice: investment.currentPrice || investment.purchasePrice,
              currentPrice: investment.currentPrice,
              purchaseDate: nextPeriodData.startDate,
              currencyId: investment.currencyId,
              category: investment.category,
              riskLevel: investment.riskLevel,
              notes: investment.notes,
              metadata: investment.metadata
                ? (JSON.parse(JSON.stringify(investment.metadata)) as Prisma.InputJsonValue)
                : ({} as Prisma.InputJsonValue),
              active: true,
            },
          })
        }

        // Session'ı yeni döneme güncelle
        const token = request.cookies.get('auth-token')?.value
        if (token) {
          await tx.userSession.updateMany({
            where: {
              token,
              userId: user.id,
              isActive: true,
            },
            data: {
              activePeriodId: nextPeriod.id,
            },
          })
        }
      } else {
        // Bakiye devri yapılmayacaksa, başka bir aktif dönem var mı kontrol et
        const otherPeriod = await tx.period.findFirst({
          where: {
            userId: user.id,
            id: { not: periodId },
            isClosed: false,
          },
          orderBy: { startDate: 'desc' },
        })

        if (otherPeriod) {
          await tx.period.update({
            where: { id: otherPeriod.id },
            data: { isActive: true },
          })

          // Session'ı güncelle
          const token = request.cookies.get('auth-token')?.value
          if (token) {
            await tx.userSession.updateMany({
              where: {
                token,
                userId: user.id,
                isActive: true,
              },
              data: {
                activePeriodId: otherPeriod.id,
              },
            })
          }
        }
      }

      return { closing, nextPeriod }
    })

    return NextResponse.json({
      success: true,
      message: 'Dönem başarıyla kapatıldı',
      closing: result.closing,
      nextPeriod: result.nextPeriod,
    })
  } catch (error) {
    console.error('Period close error:', error)
    return NextResponse.json({ error: 'Dönem kapatılamadı' }, { status: 500 })
  }
}

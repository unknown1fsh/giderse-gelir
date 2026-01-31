import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const bankAccounts = await prisma.account.findMany({
      where: {
        active: true,
      },
      include: {
        accountType: true,
        bank: true,
        currency: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Veriyi frontend için uygun formata dönüştür
    const formattedAccounts = bankAccounts.map(account => ({
      id: account.id,
      uniqueId: `bank-${account.id}`,
      name: account.name,
      balance: account.balance.toString(),
      accountNumber: account.accountNumber,
      iban: account.iban,
      accountType: {
        id: account.accountType.id,
        name: account.accountType.name,
      },
      bank: {
        id: account.bank.id,
        name: account.bank.name,
        asciiName: account.bank.asciiName,
      },
      currency: {
        id: account.currency.id,
        code: account.currency.code,
        name: account.currency.name,
        symbol: account.currency.symbol,
      },
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    }))

    return NextResponse.json(formattedAccounts)
  } catch (error) {
    console.error('Banka hesapları yüklenirken hata:', error)
    return NextResponse.json({ error: 'Banka hesapları yüklenirken hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Kullanıcı doğrulama
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const body = await request.json()
    const { name, accountTypeId, bankId, currencyId, balance, accountNumber, iban } = body

    const newAccount = await prisma.account.create({
      data: {
        userId: user.id,
        name,
        accountTypeId: parseInt(accountTypeId),
        bankId: parseInt(bankId),
        currencyId: parseInt(currencyId),
        balance: parseFloat(balance),
        accountNumber,
        iban,
      },
      include: {
        accountType: true,
        bank: true,
        currency: true,
      },
    })

    return NextResponse.json(newAccount, { status: 201 })
  } catch (error) {
    console.error('Banka hesabı oluşturulurken hata:', error)
    return NextResponse.json({ error: 'Banka hesabı oluşturulurken hata oluştu' }, { status: 500 })
  }
}

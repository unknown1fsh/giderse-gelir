import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-refactored'

// Alıcı güncelle (sadece isim)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const { id } = await params
    const beneficiaryId = parseInt(id)
    const body = await request.json()

    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ error: 'Alıcı adı boş olamaz' }, { status: 400 })
    }

    const beneficiary = await prisma.beneficiary.update({
      where: {
        id: beneficiaryId,
        userId: user.id,
      },
      data: {
        name: body.name.trim(),
      },
      include: {
        bank: true,
      },
    })

    return NextResponse.json(beneficiary)
  } catch (error) {
    console.error('Beneficiary update error:', error)
    return NextResponse.json({ error: 'Alıcı güncellenemedi' }, { status: 500 })
  }
}

// Alıcı sil (cascade delete - ilişkili transaction'lar da silinir)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const { id } = await params
    const beneficiaryId = parseInt(id)

    // Transaction sayısını kontrol et (bilgi için)
    const txCount = await prisma.transaction.count({
      where: { beneficiaryId },
    })

    // Hard delete - Prisma cascade ile ilişkili transaction'lar da silinir
    await prisma.beneficiary.delete({
      where: {
        id: beneficiaryId,
        userId: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      deletedTransactions: txCount,
      message: txCount > 0 ? `Alıcı ve ${txCount} işlem kaydı silindi` : 'Alıcı silindi',
    })
  } catch (error) {
    console.error('Beneficiary delete error:', error)
    return NextResponse.json({ error: 'Alıcı silinemedi' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError } from '@/server/errors'
import bcrypt from 'bcryptjs'
import { AuthService } from '@/lib/auth'

// Bu metot şifre sıfırlama işlemini gerçekleştirir (POST).
// Girdi: NextRequest (JSON body: token, password)
// Çıktı: NextResponse (success message)
// Hata: 400, 404, 500
export const POST = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
    const { token, password } = await request.json()

    if (!token || !password) {
        throw new BadRequestError('Token ve yeni şifre gereklidir')
    }

    if (password.length < 8) {
        throw new BadRequestError('Şifre en az 8 karakter olmalıdır')
    }

    // Token ile kullanıcıyı bul
    const user = await prisma.user.findFirst({
        where: {
            resetPasswordToken: token,
            resetPasswordExpiry: {
                gt: new Date(), // Token süresi dolmamış
            },
        },
    })

    // Token geçersiz veya süresi dolmuşsa
    // Not: Güvenlik için token'ın veritabanında olup olmadığını net söylemeyebiliriz
    // ama UX için "geçersiz link" demek daha iyi olabilir.
    if (!user) {
        return NextResponse.json(
            {
                success: false,
                message: 'Geçersiz veya süresi dolmuş şifre sıfırlama linki.',
            },
            { status: 400 }
        )
    }

    // Yeni şifreyi hashle
    const passwordHash = await bcrypt.hash(password, 12)

    // Kullanıcıyı güncelle
    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordHash,
            resetPasswordToken: null,
            resetPasswordExpiry: null,
        },
    })

    // Tüm oturumları kapat (Güvenlik önlemi)
    await AuthService.logoutAll(user.id)

    return NextResponse.json({
        success: true,
        message: 'Şifreniz başarıyla değiştirildi. Yeni şifrenizle giriş yapabilirsiniz.',
    })
})

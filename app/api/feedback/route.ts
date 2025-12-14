import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const feedbackSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır').max(100),
  email: z.string().email('Geçerli bir email adresi giriniz'),
  type: z.enum(['suggestion', 'comment', 'feedback']),
  subject: z.string().max(200).optional(),
  message: z.string().min(10, 'Mesaj en az 10 karakter olmalıdır'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = feedbackSchema.parse(body)

    const feedback = await prisma.feedback.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        type: validatedData.type,
        subject: validatedData.subject || null,
        message: validatedData.message,
        status: 'pending',
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Görüşünüz başarıyla gönderildi. Teşekkür ederiz!',
        data: { id: feedback.id },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Geçersiz veri',
          errors: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('Feedback creation error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Görüş gönderilirken bir hata oluştu',
      },
      { status: 500 }
    )
  }
}

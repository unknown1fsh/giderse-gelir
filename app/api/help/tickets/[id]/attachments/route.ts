import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-refactored'
import { ExceptionMapper } from '@/server/errors'
import { UnauthorizedError, BadRequestError, NotFoundError } from '@/server/errors'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

/**
 * Destek talebine dosya ekler
 * POST /api/help/tickets/[id]/attachments
 */
export const POST = ExceptionMapper.asyncHandler(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const user = await getCurrentUser(request)

    if (!user) {
      throw new UnauthorizedError('Oturum bulunamadı')
    }

    // ID veya ticket number ile arama yap
    const ticketId = parseInt(params.id)
    const isTicketNumber = params.id.startsWith('SUP-')

    const where: any = {
      userId: user.id, // Kullanıcı sadece kendi taleplerini görebilir
    }

    if (isTicketNumber) {
      where.ticketNumber = params.id
    } else if (!isNaN(ticketId)) {
      where.id = ticketId
    } else {
      throw new BadRequestError('Geçersiz talep ID veya numarası')
    }

    // Ticket'ın kullanıcıya ait olduğunu kontrol et
    const ticket = await prisma.supportTicket.findFirst({
      where,
    })

    if (!ticket) {
      throw new NotFoundError('Destek talebi bulunamadı veya erişim yetkiniz yok')
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      throw new BadRequestError('Dosya gereklidir')
    }

    // Dosya boyutu kontrolü
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestError(`Dosya boyutu maksimum ${MAX_FILE_SIZE / 1024 / 1024}MB olabilir`)
    }

    // Dosya tipi kontrolü
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new BadRequestError('Geçersiz dosya tipi. İzin verilen formatlar: JPG, PNG, PDF, DOC, DOCX')
    }

    // Uploads klasörünü oluştur
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'support-tickets')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Dosya adını oluştur
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${ticket.id}-${timestamp}-${originalName}`
    const filePath = join(uploadsDir, fileName)

    // Dosyayı kaydet
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Veritabanına kaydet
    const attachment = await prisma.supportTicketAttachment.create({
      data: {
        ticketId: ticket.id,
        fileName: file.name,
        filePath: `/uploads/support-tickets/${fileName}`,
        fileSize: file.size,
        mimeType: file.type,
      },
    })

    return NextResponse.json({
      success: true,
      data: attachment,
      message: 'Dosya başarıyla yüklendi',
    })
  }
)


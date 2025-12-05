'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Download, MessageSquare } from 'lucide-react'
import FileUpload from '@/components/help/file-upload'
import NavigationButtons from '@/components/help/navigation-buttons'

interface Ticket {
  id: number
  ticketNumber: string
  subject: string
  description: string
  status: string
  priority: string
  createdAt: string
  category: {
    id: number
    name: string
  }
  attachments: Array<{
    id: number
    fileName: string
    filePath: string
    fileSize: number
    mimeType: string
  }>
  replies: Array<{
    id: number
    message: string
    createdAt: string
    user: {
      id: number
      name: string
      email: string
      role: string
    }
  }>
}

const statusLabels: Record<string, string> = {
  pending: 'Beklemede',
  in_progress: 'İşlemde',
  resolved: 'Çözüldü',
  closed: 'Kapatıldı',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return bytes + ' B'
  }
  if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' KB'
  }
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTicket = async () => {
    if (!params.id || Array.isArray(params.id)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/help/tickets/${params.id}`)
      const result = (await response.json()) as { success: boolean; data?: Ticket }

      if (result.success && result.data) {
        setTicket(result.data)
      } else {
        router.push('/help/tickets')
      }
    } catch (error) {
      console.error('Ticket yükleme hatası:', error)
      router.push('/help/tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchTicket()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!ticket) {
    return null
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Navigation Buttons */}
      <NavigationButtons backHref="/help/tickets" backLabel="Destek Taleplerine Dön" />

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <MessageSquare className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{ticket.subject}</h1>
              <p className="text-lg md:text-xl text-white/90">Talep No: {ticket.ticketNumber}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Talep Detayları</CardTitle>
                <Badge className={statusColors[ticket.status]}>{statusLabels[ticket.status]}</Badge>
              </div>
              <CardDescription>
                {ticket.category.name} • {formatDate(ticket.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-gray-700">{ticket.description}</p>
            </CardContent>
          </Card>

          {ticket.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Ekli Dosyalar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ticket.attachments.map(attachment => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">{attachment.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(attachment.fileSize)}
                        </p>
                      </div>
                      <a
                        href={attachment.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {ticket.replies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Yanıtlar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.replies.map(reply => (
                  <div key={reply.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">
                          {reply.user.role === 'ADMIN' ? '👨‍💼 Destek Ekibi' : reply.user.name}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(reply.createdAt)}</p>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-gray-700">{reply.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {ticket.status !== 'closed' && (
            <Card>
              <CardHeader>
                <CardTitle>Dosya Ekle</CardTitle>
                <CardDescription>
                  Talep ile ilgili ekran görüntüsü veya belge ekleyebilirsiniz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  ticketId={ticket.id}
                  onUploadSuccess={() => {
                    void fetchTicket()
                  }}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Talep Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Durum</p>
                <Badge className={statusColors[ticket.status]}>{statusLabels[ticket.status]}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Öncelik</p>
                <p className="text-sm font-medium">
                  {ticket.priority === 'low'
                    ? 'Düşük'
                    : ticket.priority === 'medium'
                      ? 'Orta'
                      : ticket.priority === 'high'
                        ? 'Yüksek'
                        : 'Acil'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Kategori</p>
                <p className="text-sm font-medium">{ticket.category.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Oluşturulma Tarihi</p>
                <p className="text-sm font-medium">{formatDate(ticket.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

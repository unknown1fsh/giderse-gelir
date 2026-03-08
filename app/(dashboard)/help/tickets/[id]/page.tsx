'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, PageHeader } from '@/components/mosaic'
import { Badge } from '@/components/mosaic'
import { Skeleton } from '@/components/mosaic'
import { Download, ArrowLeft } from 'lucide-react'
import FileUpload from '@/components/help/file-upload'
import Link from 'next/link'
import { getDisplayName } from '@/lib/utils'

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
      name: string | null
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
  pending: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
  in_progress: 'bg-blue-500/10 text-blue-500 border border-primary/20',
  resolved: 'bg-green-500/10 text-green-500 border border-green-500/20',
  closed: 'bg-muted text-muted-foreground border border-border',
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
      <PageHeader
        title={ticket.subject}
        description={`Talep No: ${ticket.ticketNumber}`}
        breadcrumbs={
          <Link href="/help/tickets" className="flex items-center hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Destek Taleplerine Dön
          </Link>
        }
      />

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
              <p className="whitespace-pre-wrap text-foreground">{ticket.description}</p>
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
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-muted rounded-lg"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium break-words">{attachment.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.fileSize)}
                        </p>
                      </div>
                      <a
                        href={attachment.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="self-start sm:self-auto text-primary hover:underline"
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
                  <div key={reply.id} className="border-l-4 border-primary pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">
                          {reply.user.role === 'ADMIN'
                            ? '👨‍💼 Destek Ekibi'
                            : getDisplayName(reply.user)}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</p>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-foreground">{reply.message}</p>
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
                <p className="text-sm text-muted-foreground">Durum</p>
                <Badge className={statusColors[ticket.status]}>{statusLabels[ticket.status]}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Öncelik</p>
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
                <p className="text-sm text-muted-foreground">Kategori</p>
                <p className="text-sm font-medium">{ticket.category.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Oluşturulma Tarihi</p>
                <p className="text-sm font-medium">{formatDate(ticket.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/lib/use-toast'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/mosaic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/mosaic'
import { Badge } from '@/components/mosaic'
import { Textarea } from '@/components/mosaic'
import { Label } from '@/components/mosaic'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/mosaic'
import { Skeleton } from '@/components/mosaic'
import { ArrowLeft, Download, Send, Loader2 } from 'lucide-react'
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
  user: {
    id: number
    username?: string
    name?: string
    email: string
    phone: string | null
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
    isInternal: boolean
    user: {
      id: number
      username?: string
      name?: string
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

export default function AdminTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyMessage, setReplyMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [sendingReply, setSendingReply] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast()

  useEffect(() => {
    if (params.id) {
      fetchTicket()
    }
  }, [params.id])

  async function fetchTicket() {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/support-tickets/${params.id}`)
      const data = await response.json()

      if (data.success) {
        setTicket(data.data)
      } else {
        router.push('/admin/support-tickets')
      }
    } catch (error) {
      console.error('Ticket yükleme hatası:', error)
      router.push('/admin/support-tickets')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(newStatus: string) {
    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/admin/support-tickets/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        await fetchTicket()
      } else {
        toastError('Hata', data.error || 'Durum güncellenemedi')
      }
    } catch (error) {
      console.error('Durum güncelleme hatası:', error)
      toastError('Hata', 'Durum güncellenirken bir hata oluştu')
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleSendReply() {
    if (!replyMessage.trim()) {
      toastWarning('Uyarı', 'Lütfen bir mesaj yazın')
      return
    }

    setSendingReply(true)
    try {
      const response = await fetch(`/api/admin/support-tickets/${params.id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: replyMessage.trim(),
          isInternal,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setReplyMessage('')
        setIsInternal(false)
        await fetchTicket()
        toastSuccess('Başarılı', 'Yanıt gönderildi')
      } else {
        toastError('Hata', data.error || 'Yanıt gönderilemedi')
      }
    } catch (error) {
      console.error('Yanıt gönderme hatası:', error)
      toastError('Hata', 'Yanıt gönderilirken bir hata oluştu')
    } finally {
      setSendingReply(false)
    }
  }

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="shrink-0">
          <Link href="/admin/support-tickets">
            <Button variant="outline" size="icon" aria-label="Geri">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 break-words">
            {ticket.subject}
          </h1>
          <p className="text-gray-600 mt-1 break-words">Talep No: {ticket.ticketNumber}</p>
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
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium break-words">{attachment.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(attachment.fileSize)}
                        </p>
                      </div>
                      <a
                        href={attachment.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="self-start sm:self-auto text-blue-600 hover:underline"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Yanıt Yaz</CardTitle>
              <CardDescription>Kullanıcıya yanıt yazın veya iç not ekleyin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reply">Mesaj</Label>
                <Textarea
                  id="reply"
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  placeholder="Yanıtınızı yazın..."
                  rows={6}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isInternal"
                  checked={isInternal}
                  onChange={e => setIsInternal(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isInternal" className="cursor-pointer">
                  İç not (kullanıcı göremez)
                </Label>
              </div>
              <Button onClick={handleSendReply} disabled={sendingReply} className="w-full">
                {sendingReply ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Yanıt Gönder
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {ticket.replies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Yanıtlar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.replies.map(reply => (
                  <div
                    key={reply.id}
                    className={`border-l-4 pl-4 ${reply.isInternal ? 'border-gray-400 bg-gray-50' : 'border-blue-500'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">
                          {reply.user.role === 'ADMIN' ? '👨‍💼 Admin' : getDisplayName(reply.user)}
                          {reply.isInternal && (
                            <Badge variant="secondary" className="ml-2">
                              İç Not
                            </Badge>
                          )}
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
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Talep Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Durum</p>
                <Select
                  value={ticket.status}
                  onValueChange={handleStatusChange}
                  disabled={updatingStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Beklemede</SelectItem>
                    <SelectItem value="in_progress">İşlemde</SelectItem>
                    <SelectItem value="resolved">Çözüldü</SelectItem>
                    <SelectItem value="closed">Kapatıldı</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm text-gray-500">Kullanıcı</p>
                <p className="text-sm font-medium">{getDisplayName(ticket.user)}</p>
                <p className="text-xs text-gray-500">{ticket.user.email}</p>
                {ticket.user.phone && <p className="text-xs text-gray-500">{ticket.user.phone}</p>}
              </div>

              <div>
                <p className="text-sm text-gray-500">Kategori</p>
                <p className="text-sm font-medium">{ticket.category.name}</p>
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

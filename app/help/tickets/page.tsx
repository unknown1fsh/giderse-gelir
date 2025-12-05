'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, MessageSquare } from 'lucide-react'

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

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const url =
        statusFilter === 'all'
          ? '/api/help/tickets'
          : `/api/help/tickets?status=${statusFilter}`
      const response = await fetch(url)
      const result = await response.json() as { success: boolean; data?: Ticket[] }

      if (result.success && result.data) {
        setTickets(result.data)
      }
    } catch (error) {
      console.error('Ticket yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Destek Taleplerim</h1>
          <p className="text-gray-600 mt-2">Tüm destek taleplerinizi buradan görüntüleyebilirsiniz</p>
        </div>
        <Link href="/help/tickets/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Talep
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Durum Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="pending">Beklemede</SelectItem>
            <SelectItem value="in_progress">İşlemde</SelectItem>
            <SelectItem value="resolved">Çözüldü</SelectItem>
            <SelectItem value="closed">Kapatıldı</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz destek talebiniz yok</h3>
            <p className="text-gray-600 mb-4">
              İlk destek talebinizi oluşturmak için aşağıdaki butona tıklayın
            </p>
            <Link href="/help/tickets/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Talep Oluştur
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <Link key={ticket.id} href={`/help/tickets/${ticket.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                        <Badge className={statusColors[ticket.status]}>
                          {statusLabels[ticket.status]}
                        </Badge>
                        <Badge variant="outline" className={priorityColors[ticket.priority]}>
                          {ticket.priority === 'low'
                            ? 'Düşük'
                            : ticket.priority === 'medium'
                              ? 'Orta'
                              : ticket.priority === 'high'
                                ? 'Yüksek'
                                : 'Acil'}
                        </Badge>
                      </div>
                      <CardDescription>
                        Talep No: {ticket.ticketNumber} • {ticket.category.name}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(ticket.createdAt)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}


'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/mosaic'
import { Button } from '@/components/mosaic'
import { Input } from '@/components/mosaic'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/mosaic'
import { Badge } from '@/components/mosaic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/mosaic'
import { Skeleton } from '@/components/mosaic'
import {
  Search,
  Eye,
  MessageSquare,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react'

interface Ticket {
  id: number
  ticketNumber: string
  subject: string
  status: string
  priority: string
  createdAt: string
  category: {
    id: number
    name: string
  }
  user: {
    id: number
    name: string
    email: string
  }
  _count: {
    replies: number
    attachments: number
  }
}

const statusLabels: Record<string, string> = {
  pending: 'Beklemede',
  in_progress: 'İşlemde',
  resolved: 'Çözüldü',
  closed: 'Kapatıldı',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
  resolved: 'bg-green-100 text-green-800 border-green-300',
  closed: 'bg-gray-100 text-gray-800 border-gray-300',
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800 border-gray-300',
  medium: 'bg-blue-100 text-blue-800 border-blue-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  urgent: 'bg-red-100 text-red-800 border-red-300',
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function SupportTicketsTable() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [allTickets, setAllTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) {
        params.append('search', search)
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      params.append('page', page.toString())
      params.append('limit', '20')

      const response = await fetch(`/api/admin/support-tickets?${params.toString()}`)
      const result = (await response.json()) as {
        success: boolean
        data?: Ticket[]
        pagination?: { totalPages: number }
      }

      if (result.success && result.data && result.pagination) {
        setTickets(result.data)
        setAllTickets(result.data)
        setTotalPages(result.pagination.totalPages)
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
  }, [search, statusFilter, page])

  const stats = useMemo(() => {
    const total = allTickets.length
    const pending = allTickets.filter(t => t.status === 'pending').length
    const inProgress = allTickets.filter(t => t.status === 'in_progress').length
    const resolved = allTickets.filter(t => t.status === 'resolved').length
    const closed = allTickets.filter(t => t.status === 'closed').length

    return { total, pending, inProgress, resolved, closed }
  }, [allTickets])

  const filteredTickets = useMemo(() => {
    let filtered = tickets

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter)
    }

    return filtered
  }, [tickets, priorityFilter])

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center gap-3">
            <MessageSquare className="h-10 w-10" />
            Destek Talepleri Yönetimi
          </h1>
          <p className="text-lg md:text-xl text-white/90">
            Tüm destek taleplerini görüntüleyin, yönetin ve yanıtlayın
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-2 hover:shadow-lg transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Toplam</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Beklemede</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">İşlemde</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Çözülen</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Kapatılan</p>
                <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-100">
                <XCircle className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <CardTitle>Filtreler</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Talep numarası, konu veya kullanıcı ara..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="pending">Beklemede</SelectItem>
                <SelectItem value="in_progress">İşlemde</SelectItem>
                <SelectItem value="resolved">Çözüldü</SelectItem>
                <SelectItem value="closed">Kapatıldı</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Öncelik" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Öncelikler</SelectItem>
                <SelectItem value="low">Düşük</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="high">Yüksek</SelectItem>
                <SelectItem value="urgent">Acil</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Destek Talepleri</CardTitle>
              <CardDescription>{filteredTickets.length} talep gösteriliyor</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                {tickets.length === 0 ? 'Destek talebi bulunamadı' : 'Filtre sonucu bulunamadı'}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border-2 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Talep No</TableHead>
                        <TableHead className="font-semibold">Konu</TableHead>
                        <TableHead className="font-semibold">Kullanıcı</TableHead>
                        <TableHead className="font-semibold">Kategori</TableHead>
                        <TableHead className="font-semibold">Durum</TableHead>
                        <TableHead className="font-semibold">Öncelik</TableHead>
                        <TableHead className="font-semibold">Yanıt</TableHead>
                        <TableHead className="font-semibold">Tarih</TableHead>
                        <TableHead className="font-semibold text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets.map(ticket => (
                        <TableRow key={ticket.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-mono text-sm font-semibold">
                            {ticket.ticketNumber}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="truncate font-medium">{ticket.subject}</p>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900">{ticket.user.name}</p>
                              <p className="text-xs text-gray-500">{ticket.user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {ticket.category.name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${statusColors[ticket.status]} border-2 font-semibold`}
                            >
                              {statusLabels[ticket.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${priorityColors[ticket.priority]} border-2 font-semibold`}
                            >
                              {ticket.priority === 'low'
                                ? 'Düşük'
                                : ticket.priority === 'medium'
                                  ? 'Orta'
                                  : ticket.priority === 'high'
                                    ? 'Yüksek'
                                    : 'Acil'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono">
                              {ticket._count.replies}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(ticket.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Link href={`/admin/support-tickets/${ticket.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-blue-50 hover:border-blue-300"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Görüntüle
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Önceki
                  </Button>
                  <span className="text-sm text-gray-600">
                    Sayfa {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Sonraki
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

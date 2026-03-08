'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Badge, Card, CardContent, CardHeader, CardTitle, PageHeader, Skeleton } from '@/components/mosaic'
import {
  BookOpen,
  MessageSquare,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'

interface HelpStats {
  faqs: {
    total: number
    active: number
    inactive: number
    categories: number
  }
  tickets: {
    total: number
    pending: number
    inProgress: number
    resolved: number
    closed: number
    avgResponseTime?: number
  }
  categories: Array<{
    name: string
    count: number
  }>
  recentTickets: Array<{
    id: number
    ticketNumber: string
    subject: string
    status: string
    priority: string
    createdAt: string
    user: {
      name: string
      email: string
    }
  }>
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
  resolved: 'bg-green-100 text-green-800 border-green-300',
  closed: 'bg-gray-100 text-gray-800 border-gray-300',
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

export default function HelpDashboard() {
  const [stats, setStats] = useState<HelpStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        // FAQ istatistikleri
        const faqResponse = await fetch('/api/admin/faq')
        const faqResult = (await faqResponse.json()) as {
          success: boolean
          data?: Array<{ isActive: boolean; category: string | null }>
        }

        // Ticket istatistikleri
        const ticketsResponse = await fetch('/api/admin/support-tickets?limit=1000')
        const ticketsResult = (await ticketsResponse.json()) as {
          success: boolean
          data?: Array<{
            id: number
            status: string
            priority: string
            createdAt: string
            ticketNumber: string
            subject: string
            user: { name: string; email: string }
          }>
        }

        if (faqResult.success && faqResult.data && ticketsResult.success && ticketsResult.data) {
          const faqs = faqResult.data
          const tickets = ticketsResult.data

          // FAQ kategorileri
          const categoryMap = new Map<string, number>()
          faqs.forEach(faq => {
            const cat = faq.category || 'Genel'
            categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
          })

          const helpStats: HelpStats = {
            faqs: {
              total: faqs.length,
              active: faqs.filter(f => f.isActive).length,
              inactive: faqs.filter(f => !f.isActive).length,
              categories: categoryMap.size,
            },
            tickets: {
              total: tickets.length,
              pending: tickets.filter(t => t.status === 'pending').length,
              inProgress: tickets.filter(t => t.status === 'in_progress').length,
              resolved: tickets.filter(t => t.status === 'resolved').length,
              closed: tickets.filter(t => t.status === 'closed').length,
            },
            categories: Array.from(categoryMap.entries()).map(([name, count]) => ({
              name,
              count,
            })),
            recentTickets: tickets
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5),
          }

          setStats(helpStats)
        }
      } catch (error) {
        console.error('Help stats yükleme hatası:', error)
      } finally {
        setLoading(false)
      }
    }

    void fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="border-2">
              <CardContent className="p-6">
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-12 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <Card className="border-2">
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">İstatistikler yüklenemedi</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Help Yönetim Dashboard"
        description="FAQ ve destek talepleri istatistiklerini tek ekranda izleyin."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Help Dashboard' }]}
      />

      {/* FAQ Stats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            SSS İstatistikleri
          </h2>
          <Link href="/admin/faq">
            <Badge variant="outline" className="cursor-pointer hover:bg-indigo-50">
              Yönet →
            </Badge>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Toplam SSS</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.faqs.total}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Aktif</p>
                  <p className="text-3xl font-bold text-green-600">{stats.faqs.active}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pasif</p>
                  <p className="text-3xl font-bold text-gray-600">{stats.faqs.inactive}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-gray-500 to-slate-500 shadow-lg">
                  <EyeOff className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Kategoriler</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.faqs.categories}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ticket Stats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-orange-600" />
            Destek Talepleri İstatistikleri
          </h2>
          <Link href="/admin/support-tickets">
            <Badge variant="outline" className="cursor-pointer hover:bg-orange-50">
              Yönet →
            </Badge>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Toplam</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.tickets.total}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-100">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Beklemede</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.tickets.pending}</p>
                </div>
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">İşlemde</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.tickets.inProgress}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-100">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Çözülen</p>
                  <p className="text-2xl font-bold text-green-600">{stats.tickets.resolved}</p>
                </div>
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Kapatılan</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.tickets.closed}</p>
                </div>
                <div className="p-2 rounded-lg bg-gray-100">
                  <XCircle className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Categories & Recent Tickets */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Categories */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              SSS Kategorileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.categories.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Henüz kategori yok</p>
            ) : (
              <div className="space-y-2">
                {stats.categories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium">{category.name}</span>
                    <Badge variant="secondary">{category.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Son Talepler
              </CardTitle>
              <Link href="/admin/support-tickets">
                <Badge variant="outline" className="cursor-pointer hover:bg-orange-50 text-xs">
                  Tümünü Gör
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentTickets.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Henüz talep yok</p>
            ) : (
              <div className="space-y-3">
                {stats.recentTickets.map(ticket => (
                  <Link
                    key={ticket.id}
                    href={`/admin/support-tickets/${ticket.id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{ticket.subject}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {ticket.user.name} • {ticket.ticketNumber}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={`${statusColors[ticket.status]} border text-xs`}>
                          {ticket.status === 'pending'
                            ? 'Beklemede'
                            : ticket.status === 'in_progress'
                              ? 'İşlemde'
                              : ticket.status === 'resolved'
                                ? 'Çözüldü'
                                : 'Kapatıldı'}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`${priorityColors[ticket.priority]} text-xs`}
                        >
                          {ticket.priority === 'low'
                            ? 'Düşük'
                            : ticket.priority === 'medium'
                              ? 'Orta'
                              : ticket.priority === 'high'
                                ? 'Yüksek'
                                : 'Acil'}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

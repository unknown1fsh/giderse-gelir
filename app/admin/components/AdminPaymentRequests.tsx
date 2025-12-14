'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle2, XCircle, Clock, Eye, Loader2 } from 'lucide-react'

interface PaymentRequest {
  id: number
  userId: number
  planId: string
  amount: number
  currency: string
  description: string | null
  status: string
  adminNotes: string | null
  createdAt: string
  user: {
    name: string
    email: string
  }
}

export default function AdminPaymentRequests() {
  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [processing, setProcessing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  // Payment request'leri yükle
  const fetchRequests = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/payment-requests')
      if (response.ok) {
        const data = await response.json()
        setRequests(data.data?.paymentRequests || [])
      }
    } catch (error) {
      console.error('Fetch payment requests error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  // İşlem durumu güncelleme
  const handleAction = async (requestId: number, action: 'approve' | 'reject') => {
    setProcessing(true)
    try {
      const response = await fetch(`/api/admin/payment-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action === 'approve' ? 'approved' : 'rejected',
          adminNotes,
        }),
      })

      if (response.ok) {
        // Liste'yi yenile
        await fetchRequests()
        setSelectedRequest(null)
        setAdminNotes('')
      } else {
        alert('Bir hata oluştu')
      }
    } catch (error) {
      console.error('Payment request action error:', error)
      alert('Bir hata oluştu')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Bekliyor
          </Badge>
        )
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Onaylandı
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Reddedildi
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPlanName = (planId: string) => {
    const names: Record<string, string> = {
      free: 'Ücretsiz',
      premium: 'Premium',
      enterprise: 'Enterprise',
      enterprise_premium: 'Enterprise Premium',
    }
    return names[planId] || planId
  }

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') {
      return true
    }
    return req.status === filter
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ödeme Talepleri</CardTitle>
          <CardDescription>Kullanıcıların plan yükseltme taleplerini yönetin</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtreler */}
          <div className="flex space-x-2 mb-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Tümü ({requests.length})
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Bekleyen ({requests.filter(r => r.status === 'pending').length})
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('approved')}
            >
              Onaylı ({requests.filter(r => r.status === 'approved').length})
            </Button>
            <Button
              variant={filter === 'rejected' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('rejected')}
            >
              Reddedilen ({requests.filter(r => r.status === 'rejected').length})
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {filter === 'all'
                ? 'Henüz ödeme talebi yok'
                : `${filter === 'pending' ? 'Bekleyen' : filter === 'approved' ? 'Onaylı' : 'Reddedilen'} talep yok`}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map(request => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.user.name}</div>
                        <div className="text-sm text-gray-500">{request.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getPlanName(request.planId)}</TableCell>
                    <TableCell>
                      {request.amount > 0 ? `${request.amount} ${request.currency}` : 'Özel Fiyat'}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{new Date(request.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedRequest(request)
                          setAdminNotes(request.adminNotes || '')
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detay Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ödeme Talebi Detayları</DialogTitle>
            <DialogDescription>Talep ID: {selectedRequest?.id}</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {/* Kullanıcı bilgileri */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Kullanıcı</label>
                  <p className="text-sm">{selectedRequest.user.name}</p>
                  <p className="text-sm text-gray-500">{selectedRequest.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Plan</label>
                  <p className="text-sm">{getPlanName(selectedRequest.planId)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tutar</label>
                  <p className="text-sm">
                    {selectedRequest.amount > 0
                      ? `${selectedRequest.amount} ${selectedRequest.currency}`
                      : 'Özel Fiyat'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Durum</label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>

              {/* Açıklama */}
              {selectedRequest.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Açıklama</label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded border whitespace-pre-wrap">
                    {selectedRequest.description}
                  </p>
                </div>
              )}

              {/* Admin notları */}
              <div>
                <label className="text-sm font-medium text-gray-700">Admin Notları</label>
                <Textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Admin notları ekleyin..."
                  rows={3}
                  disabled={selectedRequest.status !== 'pending' || processing}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedRequest?.status === 'pending' && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleAction(selectedRequest.id, 'reject')}
                  disabled={processing}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Reddet
                </Button>
                <Button
                  onClick={() => handleAction(selectedRequest.id, 'approve')}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Onayla
                </Button>
              </div>
            )}
            {selectedRequest?.status !== 'pending' && (
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                Kapat
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

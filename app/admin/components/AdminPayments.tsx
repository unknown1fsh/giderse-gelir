'use client'

import { useState, useEffect } from 'react'
import DataTable from './DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/validators'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react'
import { getDisplayName } from '@/lib/utils'

interface PaymentRequest {
  id: number
  planId: string
  amount: number
  currency: string
  description: string | null
  status: string
  adminNotes: string | null
  approvedBy: number | null
  approvedAt: string | null
  rejectedAt: string | null
  createdAt: string
  user: {
    id: number
    username?: string
    name?: string
    email: string
  }
}

export default function AdminPayments() {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve')
  const [adminNotes, setAdminNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    void fetchPaymentRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter])

  const fetchPaymentRequests = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
      })

      if (statusFilter) {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/admin/payment-requests?${params.toString()}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Ödeme talepleri listesi alınamadı')
      }

      const result = (await response.json()) as {
        success: boolean
        data: { paymentRequests: PaymentRequest[]; pagination: { totalPages: number } }
      }
      if (result.success) {
        setPaymentRequests(result.data.paymentRequests)
        setTotalPages(result.data.pagination.totalPages)
      }
    } catch (err) {
      console.error('Payment requests fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = (request: PaymentRequest, type: 'approve' | 'reject') => {
    setSelectedRequest(request)
    setActionType(type)
    setAdminNotes('')
    setShowActionModal(true)
  }

  const handleConfirmAction = async () => {
    if (!selectedRequest) {
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/admin/payment-requests/${selectedRequest.id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: actionType,
          adminNotes: adminNotes || null,
        }),
      })

      const data = (await response.json()) as { success: boolean; message?: string }

      if (response.ok && data.success) {
        alert(data.message || 'İşlem başarılı')
        setShowActionModal(false)
        setSelectedRequest(null)
        setAdminNotes('')
        void fetchPaymentRequests()
      } else {
        alert(data.message || 'Bir hata oluştu')
      }
    } catch (err) {
      console.error('Action error:', err)
      alert('Bir hata oluştu')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = () => {
    const headers = [
      'ID',
      'Kullanıcı',
      'Email',
      'Plan',
      'Tutar',
      'Durum',
      'Açıklama',
      'Tarih',
      'Admin Notları',
    ]
    const rows = paymentRequests.map(pr => [
      pr.id,
      getDisplayName(pr.user),
      pr.user.email,
      pr.planId,
      `${pr.currency}${pr.amount}`,
      pr.status,
      pr.description || '',
      new Date(pr.createdAt).toLocaleDateString('tr-TR'),
      pr.adminNotes || '',
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `odeme_talepleri_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Beklemede
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Onaylandı
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Reddedildi
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const columns = [
    {
      key: 'user',
      header: 'Kullanıcı',
      render: (pr: PaymentRequest) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{getDisplayName(pr.user)}</div>
          <div className="text-sm text-slate-500">{pr.user.email}</div>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (pr: PaymentRequest) => <Badge variant="outline">{pr.planId}</Badge>,
    },
    {
      key: 'amount',
      header: 'Tutar',
      render: (pr: PaymentRequest) => (
        <span className="font-semibold">{formatCurrency(Number(pr.amount), pr.currency)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Durum',
      render: (pr: PaymentRequest) => getStatusBadge(pr.status),
    },
    {
      key: 'description',
      header: 'Açıklama',
      render: (pr: PaymentRequest) => (
        <span className="text-sm text-slate-600 max-w-xs truncate block">
          {pr.description || '-'}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Tarih',
      render: (pr: PaymentRequest) => (
        <span className="text-sm text-slate-500">
          {new Date(pr.createdAt).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (pr: PaymentRequest) => (
        <div className="flex items-center gap-2">
          {pr.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() => handleAction(pr, 'approve')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Onayla
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleAction(pr, 'reject')}>
                <XCircle className="h-4 w-4 mr-1" />
                Reddet
              </Button>
            </>
          )}
          {pr.status !== 'pending' && pr.adminNotes && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedRequest(pr)
                setAdminNotes(pr.adminNotes || '')
                setShowActionModal(true)
              }}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Notları Gör
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label>Durum Filtresi:</Label>
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">Tümü</option>
            <option value="pending">Beklemede</option>
            <option value="approved">Onaylandı</option>
            <option value="rejected">Reddedildi</option>
          </select>
        </div>
      </div>

      <DataTable
        data={paymentRequests}
        columns={columns}
        loading={loading}
        pagination={{
          page: currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        exportable={true}
        onExport={handleExport}
        emptyMessage="Ödeme talebi bulunamadı"
      />

      {/* Action Modal */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Ödeme Talebini Onayla' : 'Ödeme Talebini Reddet'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <strong>Kullanıcı:</strong> {getDisplayName(selectedRequest.user)} (
                    {selectedRequest.user.email})
                  </p>
                  <p>
                    <strong>Plan:</strong> {selectedRequest.planId}
                  </p>
                  <p>
                    <strong>Tutar:</strong>{' '}
                    {formatCurrency(Number(selectedRequest.amount), selectedRequest.currency)}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notları (Opsiyonel)</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder="Notlarınızı buraya yazın..."
                rows={4}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowActionModal(false)}>
                İptal
              </Button>
              <Button
                onClick={() => {
                  void handleConfirmAction()
                }}
                disabled={isProcessing}
                className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>İşleniyor...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {actionType === 'approve' ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Onayla</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        <span>Reddet</span>
                      </>
                    )}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

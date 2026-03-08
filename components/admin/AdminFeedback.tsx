'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/mosaic'
import { Button } from '@/components/mosaic'
import { MessageSquare, Search, Filter, CheckCircle2, Clock, Reply, Eye } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/mosaic'

interface Feedback {
  id: number
  name: string
  email: string
  type: string
  subject: string | null
  message: string
  status: string
  createdAt: string
  updatedAt: string
  repliedAt: string | null
  replyMessage: string | null
}

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
  const [isReplying, setIsReplying] = useState(false)

  useEffect(() => {
    fetchFeedbacks()
  }, [statusFilter, typeFilter])

  const fetchFeedbacks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (typeFilter !== 'all') {
        params.append('type', typeFilter)
      }

      const response = await fetch(`/api/admin/feedback?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setFeedbacks(data.data)
      }
    } catch (error) {
      console.error('Feedback fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()
      if (data.success) {
        fetchFeedbacks()
        if (selectedFeedback?.id === id) {
          setSelectedFeedback({ ...selectedFeedback, status })
        }
      }
    } catch (error) {
      console.error('Status update error:', error)
    }
  }

  const handleReply = async (id: number) => {
    if (!replyMessage.trim()) {
      return
    }

    try {
      setIsReplying(true)
      const response = await fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'replied',
          replyMessage: replyMessage.trim(),
        }),
      })

      const data = await response.json()
      if (data.success) {
        setReplyMessage('')
        setIsReplying(false)
        fetchFeedbacks()
        if (selectedFeedback?.id === id) {
          setSelectedFeedback(data.data)
        }
      }
    } catch (error) {
      console.error('Reply error:', error)
      setIsReplying(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'read':
        return <Eye className="h-4 w-4 text-blue-500" />
      case 'replied':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede'
      case 'read':
        return 'Okundu'
      case 'replied':
        return 'Yanıtlandı'
      default:
        return status
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feedback':
        return 'Görüş'
      case 'suggestion':
        return 'Öneri'
      case 'comment':
        return 'Yorum'
      default:
        return type
    }
  }

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        feedback.name.toLowerCase().includes(search) ||
        feedback.email.toLowerCase().includes(search) ||
        feedback.message.toLowerCase().includes(search) ||
        (feedback.subject && feedback.subject.toLowerCase().includes(search))
      )
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Görüş ve Öneriler</h1>
          <p className="text-gray-600 mt-1">Kullanıcı geri bildirimlerini yönetin</p>
        </div>
      </div>

      {/* Filtreler */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Ara..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="pending">Beklemede</SelectItem>
                <SelectItem value="read">Okundu</SelectItem>
                <SelectItem value="replied">Yanıtlandı</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tip" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Tipler</SelectItem>
                <SelectItem value="feedback">Görüş</SelectItem>
                <SelectItem value="suggestion">Öneri</SelectItem>
                <SelectItem value="comment">Yorum</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchFeedbacks} variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Yenile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Listesi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste */}
        <div className="lg:col-span-1 space-y-3">
          {filteredFeedbacks.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">Görüş bulunamadı</CardContent>
            </Card>
          ) : (
            filteredFeedbacks.map(feedback => (
              <Card
                key={feedback.id}
                className={`cursor-pointer transition-all ${
                  selectedFeedback?.id === feedback.id
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedFeedback(feedback)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{feedback.name}</div>
                      <div className="text-sm text-gray-600">{feedback.email}</div>
                    </div>
                    <div className="flex items-center gap-2">{getStatusIcon(feedback.status)}</div>
                  </div>
                  {feedback.subject && (
                    <div className="text-sm font-medium text-gray-700 mb-1">{feedback.subject}</div>
                  )}
                  <div className="text-xs text-gray-500 mb-2 line-clamp-2">{feedback.message}</div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{getTypeLabel(feedback.type)}</span>
                    <span>{new Date(feedback.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Detay */}
        <div className="lg:col-span-2">
          {selectedFeedback ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedFeedback.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{selectedFeedback.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                      {getTypeLabel(selectedFeedback.type)}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        selectedFeedback.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : selectedFeedback.status === 'read'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {getStatusLabel(selectedFeedback.status)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedFeedback.subject && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Konu</label>
                    <p className="text-gray-900 mt-1">{selectedFeedback.subject}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Mesaj</label>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                    {selectedFeedback.message}
                  </p>
                </div>

                <div className="text-xs text-gray-500">
                  Gönderilme: {new Date(selectedFeedback.createdAt).toLocaleString('tr-TR')}
                </div>

                {selectedFeedback.replyMessage && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <label className="text-sm font-medium text-green-700">Yanıt</label>
                    <p className="text-green-900 mt-1 whitespace-pre-wrap">
                      {selectedFeedback.replyMessage}
                    </p>
                    {selectedFeedback.repliedAt && (
                      <div className="text-xs text-green-600 mt-2">
                        Yanıtlanma: {new Date(selectedFeedback.repliedAt).toLocaleString('tr-TR')}
                      </div>
                    )}
                  </div>
                )}

                {selectedFeedback.status !== 'replied' && (
                  <div className="space-y-3 pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Yanıt Mesajı
                      </label>
                      <textarea
                        value={replyMessage}
                        onChange={e => setReplyMessage(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Yanıt mesajınızı buraya yazın..."
                      />
                    </div>
                    <Button
                      onClick={() => handleReply(selectedFeedback.id)}
                      disabled={!replyMessage.trim() || isReplying}
                      className="w-full"
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      {isReplying ? 'Gönderiliyor...' : 'Yanıtla'}
                    </Button>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  {selectedFeedback.status !== 'read' && selectedFeedback.status !== 'replied' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(selectedFeedback.id, 'read')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Okundu İşaretle
                    </Button>
                  )}
                  {selectedFeedback.status === 'read' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(selectedFeedback.id, 'pending')}
                    >
                      Beklemede İşaretle
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Detayları görmek için bir görüş seçin</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

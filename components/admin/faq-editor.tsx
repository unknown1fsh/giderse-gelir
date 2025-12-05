'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Search,
  BookOpen,
  Filter,
  TrendingUp,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface FAQ {
  id: number
  question: string
  answer: string
  category: string | null
  displayOrder: number
  isActive: boolean
}

export default function FAQEditor() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    displayOrder: 0,
    isActive: true,
  })
  const [saving, setSaving] = useState(false)

  const fetchFAQs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/faq')
      const result = (await response.json()) as { success: boolean; data?: FAQ[] }

      if (result.success && result.data) {
        setFaqs(result.data)
      }
    } catch (error) {
      console.error('FAQ yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchFAQs()
  }, [])

  function handleEdit(faq: FAQ) {
    setEditingFaq(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
      displayOrder: faq.displayOrder,
      isActive: faq.isActive,
    })
    setIsDialogOpen(true)
  }

  function handleNew() {
    setEditingFaq(null)
    setFormData({
      question: '',
      answer: '',
      category: '',
      displayOrder: 0,
      isActive: true,
    })
    setIsDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const url = editingFaq ? `/api/admin/faq/${editingFaq.id}` : '/api/admin/faq'
      const method = editingFaq ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: formData.question,
          answer: formData.answer,
          category: formData.category || null,
          displayOrder: parseInt(formData.displayOrder.toString()),
          isActive: formData.isActive,
        }),
      })

      const result = (await response.json()) as { success: boolean; error?: string }

      if (result.success) {
        setIsDialogOpen(false)
        void fetchFAQs()
      } else {
        alert(result.error || 'Kaydetme hatası')
      }
    } catch (error) {
      console.error('Kaydetme hatası:', error)
      alert('Kaydetme sırasında bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bu SSS'yi silmek istediğinizden emin misiniz?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/faq/${id}`, {
        method: 'DELETE',
      })

      const result = (await response.json()) as { success: boolean; error?: string }

      if (result.success) {
        void fetchFAQs()
      } else {
        alert(result.error || 'Silme hatası')
      }
    } catch (error) {
      console.error('Silme hatası:', error)
      alert('Silme sırasında bir hata oluştu')
    }
  }

  const handleToggleActive = async (faq: FAQ) => {
    try {
      const response = await fetch(`/api/admin/faq/${faq.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !faq.isActive,
        }),
      })

      const result = (await response.json()) as { success: boolean; error?: string }

      if (result.success) {
        void fetchFAQs()
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error)
    }
  }

  const categories = useMemo(() => {
    const cats = new Set<string>()
    faqs.forEach(faq => {
      if (faq.category) {
        cats.add(faq.category)
      }
    })
    return Array.from(cats).sort()
  }, [faqs])

  const filteredFAQs = useMemo(() => {
    let filtered = faqs

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        faq =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query) ||
          (faq.category && faq.category.toLowerCase().includes(query))
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(faq => faq.category === categoryFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(faq => (statusFilter === 'active' ? faq.isActive : !faq.isActive))
    }

    return filtered
  }, [faqs, searchQuery, categoryFilter, statusFilter])

  const stats = useMemo(() => {
    const total = faqs.length
    const active = faqs.filter(f => f.isActive).length
    const inactive = faqs.filter(f => !f.isActive).length
    const categoriesCount = categories.length

    return { total, active, inactive, categoriesCount }
  }, [faqs, categories])

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center gap-3">
              <BookOpen className="h-10 w-10" />
              SSS Yönetimi
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Sıkça sorulan soruları yönetin ve düzenleyin
            </p>
          </div>
          <Button
            onClick={handleNew}
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            Yeni SSS
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Toplam SSS</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
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
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
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
                <p className="text-3xl font-bold text-gray-600">{stats.inactive}</p>
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
                <p className="text-3xl font-bold text-purple-600">{stats.categoriesCount}</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
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
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Soru, cevap veya kategori ile ara..."
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredFAQs.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                {faqs.length === 0 ? 'Henüz SSS bulunmamaktadır' : 'Filtre sonucu bulunamadı'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Soru</TableHead>
                    <TableHead className="font-semibold">Kategori</TableHead>
                    <TableHead className="font-semibold">Sıra</TableHead>
                    <TableHead className="font-semibold">Durum</TableHead>
                    <TableHead className="font-semibold text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFAQs.map(faq => (
                    <TableRow key={faq.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="max-w-md font-medium">{faq.question}</TableCell>
                      <TableCell>
                        {faq.category ? (
                          <Badge variant="outline" className="font-normal">
                            {faq.category}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {faq.displayOrder}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={faq.isActive}
                            onCheckedChange={() => {
                              void handleToggleActive(faq)
                            }}
                          />
                          <Badge
                            variant={faq.isActive ? 'default' : 'secondary'}
                            className={faq.isActive ? 'bg-green-500' : ''}
                          >
                            {faq.isActive ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(faq)}
                            className="hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              void handleDelete(faq.id)
                            }}
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFaq ? 'SSS Düzenle' : 'Yeni SSS'}</DialogTitle>
            <DialogDescription>
              Sıkça sorulan soru ve cevabını ekleyin veya düzenleyin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Soru *</Label>
              <Input
                id="question"
                value={formData.question}
                onChange={e => setFormData(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Soruyu girin"
                required
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">Cevap *</Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={e => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                placeholder="Cevabı girin"
                required
                rows={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Kategori (opsiyonel)"
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Görüntüleme Sırası</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">Durum</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={checked =>
                      setFormData(prev => ({ ...prev, isActive: checked }))
                    }
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    {formData.isActive ? 'Aktif' : 'Pasif'}
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                İptal
              </Button>
              <Button
                onClick={() => {
                  void handleSave()
                }}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  'Kaydet'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

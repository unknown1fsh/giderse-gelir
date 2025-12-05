'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'
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
      const result = await response.json() as { success: boolean; data?: FAQ[] }

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
      const url = editingFaq
        ? `/api/admin/faq/${editingFaq.id}`
        : '/api/admin/faq'
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

      const result = await response.json() as { success: boolean; error?: string }

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
    if (!confirm('Bu SSS\'yi silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/faq/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json() as { success: boolean; error?: string }

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

      const result = await response.json() as { success: boolean; error?: string }

      if (result.success) {
        void fetchFAQs()
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SSS Yönetimi</h1>
          <p className="text-gray-600 mt-2">Sıkça sorulan soruları yönetin</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni SSS
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : faqs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">Henüz SSS bulunmamaktadır</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Soru</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Sıra</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.map(faq => (
                  <TableRow key={faq.id}>
                    <TableCell className="max-w-md">{faq.question}</TableCell>
                    <TableCell>{faq.category || '-'}</TableCell>
                    <TableCell>{faq.displayOrder}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={faq.isActive}
                          onCheckedChange={() => { void handleToggleActive(faq) }}
                        />
                        <Badge variant={faq.isActive ? 'default' : 'secondary'}>
                          {faq.isActive ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(faq)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { void handleDelete(faq.id) }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
              <Button onClick={() => { void handleSave() }} disabled={saving}>
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


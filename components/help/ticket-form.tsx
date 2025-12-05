'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2, Plus } from 'lucide-react'

interface Category {
  id: number
  name: string
  description: string | null
  icon: string | null
  color: string | null
}

interface TicketFormProps {
  onSuccess?: (ticketId: number) => void
}

export default function TicketForm({ onSuccess }: TicketFormProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    categoryId: '',
    subject: '',
    description: '',
    priority: 'medium',
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/help/categories')
        const result = (await response.json()) as { success: boolean; data?: Category[] }

        if (result.success && result.data) {
          setCategories(result.data)
        }
      } catch (error) {
        console.error('Kategori yükleme hatası:', error)
      }
    }

    void fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/help/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId: parseInt(formData.categoryId),
          subject: formData.subject,
          description: formData.description,
          priority: formData.priority,
        }),
      })

      const result = (await response.json()) as {
        success: boolean
        data?: { id: number }
        error?: string
      }

      if (result.success && result.data) {
        if (onSuccess) {
          onSuccess(result.data.id)
        } else {
          router.push(`/help/tickets/${result.data.id}`)
        }
      } else {
        alert(result.error || 'Destek talebi oluşturulurken bir hata oluştu')
      }
    } catch (error) {
      console.error('Form gönderme hatası:', error)
      alert('Destek talebi oluşturulurken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form
        onSubmit={e => {
          void handleSubmit(e)
        }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <Label htmlFor="category">Kategori *</Label>
          <Select
            value={formData.categoryId}
            onValueChange={value => setFormData(prev => ({ ...prev, categoryId: value }))}
            required
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Konu *</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Sorununuzu kısaca özetleyin"
            required
            maxLength={500}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Açıklama *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Sorununuzu detaylı bir şekilde açıklayın..."
            required
            rows={6}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Öncelik</Label>
          <Select
            value={formData.priority}
            onValueChange={value => setFormData(prev => ({ ...prev, priority: value }))}
          >
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Düşük</SelectItem>
              <SelectItem value="medium">Orta</SelectItem>
              <SelectItem value="high">Yüksek</SelectItem>
              <SelectItem value="urgent">Acil</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Gönderiliyor...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Destek Talebi Oluştur
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

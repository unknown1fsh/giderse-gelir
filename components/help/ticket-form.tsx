'use client'

import { useEffect, useMemo, useState } from 'react'
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

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface TicketFormPrefill {
  categoryHint?: string
  subject?: string
  description?: string
  priority?: TicketPriority
}

interface TicketFormProps {
  onSuccess?: (ticketId: number) => void
  prefill?: TicketFormPrefill
}

function normalize(text: string) {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function TicketForm({ onSuccess, prefill }: TicketFormProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [autoCategoryNote, setAutoCategoryNote] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    categoryId: '',
    subject: prefill?.subject || '',
    description: prefill?.description || '',
    priority: (prefill?.priority || 'medium') as TicketPriority,
  })

  const categoryHint = useMemo(() => normalize(prefill?.categoryHint || ''), [prefill?.categoryHint])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true)
      setCategoriesError(null)
      try {
        const response = await fetch('/api/help/categories')
        
        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string }
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        const result = (await response.json()) as { success: boolean; data?: Category[] }

        if (result.success && result.data) {
          setCategories(result.data)
          if (result.data.length === 0) {
            setCategoriesError('Hiç kategori bulunamadı. Lütfen admin panelinden kategori ekleyin.')
          }
        } else {
          setCategoriesError('Kategoriler yüklenemedi.')
        }
      } catch (error) {
        console.error('Kategori yükleme hatası:', error)
        setCategoriesError(
          error instanceof Error
            ? `Kategori yükleme hatası: ${error.message}`
            : 'Kategoriler yüklenirken bir hata oluştu.'
        )
      } finally {
        setCategoriesLoading(false)
      }
    }

    void fetchCategories()
  }, [])

  // Prefill değişirse konu/açıklama/öncelik alanlarını güncelle
  useEffect(() => {
    if (!prefill) {
      return
    }
    setFormData(prev => ({
      ...prev,
      subject: prefill.subject ?? prev.subject,
      description: prefill.description ?? prev.description,
      priority: (prefill.priority ?? prev.priority) as TicketPriority,
    }))
  }, [prefill])

  // Kategori otomatik seçimi (membership gibi akışlarda kullanıcı uğraşmasın)
  useEffect(() => {
    if (categories.length === 0 || categoriesLoading) {
      return
    }
    if (formData.categoryId) {
      return
    }

    let selected: Category | undefined

    if (categoryHint) {
      // Premium için özel arama: "Premium", "Üyelik", "Abonelik" gibi kelimeleri ara
      if (categoryHint === 'premium' || categoryHint === 'üyelik') {
        const premiumKeywords = ['premium', 'üyelik', 'abonelik', 'membership', 'subscription']
        selected = categories.find(c => {
          const normalizedName = normalize(c.name)
          return premiumKeywords.some(keyword => normalizedName.includes(keyword))
        })
      }

      // Eğer premium için bulunamadıysa, genel arama yap
      if (!selected) {
        // Önce tam eşleşme ara
        selected = categories.find(c => normalize(c.name) === categoryHint)
        
        // Tam eşleşme yoksa içeriyor mu kontrol et
        if (!selected) {
          selected = categories.find(c => {
            const normalizedName = normalize(c.name)
            return normalizedName.includes(categoryHint) || categoryHint.includes(normalizedName)
          })
        }
      }
    }

    // Eğer hala bulunamadıysa ilk kategoriyi seç
    if (!selected && categories.length > 0) {
      selected = categories[0]
      if (prefill?.categoryHint) {
        setAutoCategoryNote(
          `Kategori otomatik seçildi (\"${selected.name}\"). İsterseniz değiştirebilirsiniz.`
        )
      }
    } else if (selected && prefill?.categoryHint) {
      setAutoCategoryNote(`Kategori otomatik seçildi (\"${selected.name}\").`)
    }

    if (selected) {
      setFormData(prev => ({ ...prev, categoryId: selected!.id.toString() }))
    }
  }, [categories, categoryHint, formData.categoryId, prefill?.categoryHint, categoriesLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.categoryId) {
      alert('Lütfen bir kategori seçin')
      return
    }

    const categoryId = parseInt(formData.categoryId, 10)
    if (Number.isNaN(categoryId)) {
      alert('Geçersiz kategori')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/help/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId,
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
          {categoriesLoading ? (
            <div className="flex items-center gap-2 p-3 border border-gray-300 rounded-md">
              <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
              <span className="text-sm text-gray-600">Kategoriler yükleniyor...</span>
            </div>
          ) : (
            <Select
              value={formData.categoryId}
              onValueChange={value => setFormData(prev => ({ ...prev, categoryId: value }))}
              required
              disabled={categories.length === 0}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder={categories.length === 0 ? 'Kategori bulunamadı' : 'Kategori seçin'} />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-gray-500">Kategori bulunamadı</div>
                )}
              </SelectContent>
            </Select>
          )}
          {autoCategoryNote && <p className="text-xs text-slate-500">{autoCategoryNote}</p>}
          {categoriesError && (
            <p className="text-xs text-red-600">{categoriesError}</p>
          )}
          {!categoriesLoading && categories.length === 0 && !categoriesError && (
            <p className="text-xs text-red-600">
              Destek kategorisi bulunamadı. Lütfen admin panelinden en az bir destek kategorisi ekleyin.
            </p>
          )}
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
          disabled={loading || categories.length === 0}
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
        {categories.length === 0 && (
          <p className="text-xs text-red-600">
            Destek kategorisi bulunamadı. Lütfen admin panelinden en az bir destek kategorisi ekleyin.
          </p>
        )}
      </form>
    </div>
  )
}

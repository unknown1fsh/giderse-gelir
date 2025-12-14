import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card'
import { X } from 'lucide-react'

interface EditNameModalProps {
  isOpen: boolean
  onClose: () => void
  currentName: string
  onSave: (newName: string) => Promise<void>
  title: string
  description?: string
}

export function EditNameModal({
  isOpen,
  onClose,
  currentName,
  onSave,
  title,
  description,
}: EditNameModalProps) {
  const [name, setName] = useState(currentName)
  const [saving, setSaving] = useState(false)

  if (!isOpen) {
    return null
  }

  const handleSave = async () => {
    if (!name.trim()) {
      alert('İsim boş olamaz')
      return
    }

    setSaving(true)
    try {
      await onSave(name.trim())
      onClose()
    } catch (error) {
      console.error('Kaydetme hatası:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setName(currentName)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={saving}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">İsim</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Yeni isim girin"
              autoFocus
              disabled={saving}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={saving}
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

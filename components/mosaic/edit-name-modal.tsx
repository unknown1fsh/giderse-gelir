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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-background shadow-xl border border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
              disabled={saving}
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">İsim</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="Yeni isim girin"
              autoFocus
              disabled={saving}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-input rounded-md hover:bg-accent hover:text-accent-foreground text-foreground transition-colors"
              disabled={saving}
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

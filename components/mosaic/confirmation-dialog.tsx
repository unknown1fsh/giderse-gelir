import { Card, CardContent, CardHeader, CardTitle } from './card'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title: string
  message: string
  warningMessage?: string
  confirmText?: string
  cancelText?: string
  confirmButtonClass?: string
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  warningMessage,
  confirmText = 'Evet, Sil',
  cancelText = 'İptal',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700',
}: ConfirmationDialogProps) {
  if (!isOpen) {
    return null
  }

  const handleConfirm = async () => {
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Onay hatası:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-background shadow-xl border border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <CardTitle>{title}</CardTitle>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{message}</p>

          {warningMessage && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
              <p className="text-sm text-amber-500">⚠️ {warningMessage}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-input rounded-md hover:bg-accent hover:text-accent-foreground text-foreground transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={`flex-1 px-4 py-2 text-white rounded-md ${confirmButtonClass}`}
            >
              {confirmText}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

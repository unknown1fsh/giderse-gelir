'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/lib/use-toast'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/mosaic'
import { Button } from '@/components/mosaic'
import { Badge } from '@/components/mosaic'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/mosaic'
import { X } from 'lucide-react'
import { getDisplayName } from '@/lib/utils'

export interface UserDetail {
  id: number
  email: string
  username?: string
  name?: string
  phone?: string
  role: string
  plan: string
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  lastLoginAt?: string
  _count?: {
    accounts: number
    transactions: number
    periods: number
    subscriptions: number
  }
}

interface UserDetailModalProps {
  open: boolean
  onClose: () => void
  user: UserDetail | null
  loading?: boolean
  onUserUpdate?: () => void
}

export default function UserDetailModal({
  open,
  onClose,
  user,
  loading,
  onUserUpdate,
}: UserDetailModalProps) {
  const [updatingPlan, setUpdatingPlan] = useState(false)
  const [currentPlan, setCurrentPlan] = useState(user?.plan || 'free')
  const { success: toastSuccess, error: toastError } = useToast()

  // user değiştiğinde currentPlan'i güncelle
  useEffect(() => {
    if (user) {
      setCurrentPlan(user.plan)
    }
  }, [user])

  const handlePlanChange = async (newPlanId: string) => {
    if (!user) {
      return
    }

    if (newPlanId === currentPlan) {
      return // Aynı plan seçilmişse işlem yapma
    }

    setUpdatingPlan(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: user.id, planId: newPlanId }),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string }
        throw new Error(errorData.error || 'Plan güncellenemedi')
      }

      setCurrentPlan(newPlanId)

      // Plan değişikliği event'i gönder
      window.dispatchEvent(new CustomEvent('plan-changed'))

      toastSuccess('Başarılı', 'Plan başarıyla güncellendi')
      if (onUserUpdate) {
        onUserUpdate()
      }
    } catch (err) {
      console.error('Plan update error:', err)
      toastError('Hata', err instanceof Error ? err.message : 'Plan güncellenirken hata oluştu')
      // Hata durumunda eski plana geri dön
      setCurrentPlan(user.plan)
    } finally {
      setUpdatingPlan(false)
    }
  }

  if (!user && !loading) {
    return null
  }

  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle className="flex items-center justify-between">
            <span>Kullanıcı Detayları</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </ModalTitle>
        </ModalHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : user ? (
          <div className="space-y-6 mt-4">
            {/* Temel Bilgiler */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ad Soyad</label>
                <p className="text-sm text-foreground mt-1">{getDisplayName(user)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">E-posta</label>
                <p className="text-sm text-foreground mt-1">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                <p className="text-sm text-foreground mt-1">{user.phone || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Rol</label>
                <div className="mt-1">
                  <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Plan</label>
                <div className="mt-1">
                  <Select
                    value={currentPlan}
                    onValueChange={value => {
                      void handlePlanChange(value)
                    }}
                    disabled={updatingPlan}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Pro</SelectItem>
                      <SelectItem value="family">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Durum</label>
                <div className="mt-1">
                  <Badge variant={user.isActive ? 'default' : 'destructive'}>
                    {user.isActive ? 'Aktif' : 'Pasif'}
                  </Badge>
                </div>
              </div>
              {/* <div>
                <label className="text-sm font-medium text-muted-foreground">E-posta Doğrulandı</label>
                <div className="mt-1">
                  <Badge variant={user.emailVerified ? 'default' : 'secondary'}>
                    {user.emailVerified ? 'Evet' : 'Hayır'}
                  </Badge>
                </div>
              </div> */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Kayıt Tarihi</label>
                <p className="text-sm text-foreground mt-1">
                  {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
              {user.lastLoginAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Son Giriş</label>
                  <p className="text-sm text-foreground mt-1">
                    {new Date(user.lastLoginAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              )}
            </div>

            {/* İstatistikler */}
            {user._count && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">İstatistikler</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{user._count.accounts}</div>
                    <div className="text-sm text-muted-foreground mt-1">Hesap</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-foreground">
                      {user._count.transactions}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">İşlem</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{user._count.periods}</div>
                    <div className="text-sm text-muted-foreground mt-1">Dönem</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-foreground">
                      {user._count.subscriptions}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Abonelik</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </ModalContent>
    </Modal>
  )
}

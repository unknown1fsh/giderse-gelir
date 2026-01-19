'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, ArrowLeft, Home, Edit, Trash2, Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/validators'
import { useToast } from '@/lib/use-toast'
import { EditNameModal } from '@/components/ui/edit-name-modal'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface EWallet {
  id: number
  name: string
  provider: string
  balance: string
  accountEmail: string | null
  accountPhone: string | null
  currency: {
    id: number
    code: string
    name: string
  }
  createdAt: string
}

export default function EWalletsPage() {
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useToast()
  const [eWallets, setEWallets] = useState<EWallet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<EWallet | null>(null)

  useEffect(() => {
    void fetchEWallets()
  }, [])

  const fetchEWallets = async () => {
    try {
      const response = await fetch('/api/ewallets', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = (await response.json()) as EWallet[]
        setEWallets(data)
      } else {
        setError('E-cüzdanlar yüklenemedi')
      }
    } catch (error) {
      console.error('E-cüzdanlar yüklenirken hata:', error)
      setError('E-cüzdanlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleEditName = async (newName: string) => {
    if (!selectedWallet) {
      return
    }

    try {
      const response = await fetch(`/api/ewallets/${selectedWallet.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
        credentials: 'include',
      })

      if (response.ok) {
        setEWallets(prev =>
          prev.map(wallet =>
            wallet.id === selectedWallet.id ? { ...wallet, name: newName } : wallet
          )
        )
        toastSuccess('Başarılı', 'E-cüzdan adı başarıyla güncellendi')
      } else {
        toastError('Hata', 'E-cüzdan adı güncellenemedi')
      }
    } catch (error) {
      console.error('E-cüzdan güncelleme hatası:', error)
      toastError('Hata', 'E-cüzdan güncellenirken hata oluştu')
    }
  }

  const handleDelete = async () => {
    if (!selectedWallet) {
      return
    }

    try {
      const response = await fetch(`/api/ewallets/${selectedWallet.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        const result = (await response.json()) as { message: string }
        toastSuccess('Başarılı', result.message || 'E-cüzdan silindi')
        setEWallets(prev => prev.filter(wallet => wallet.id !== selectedWallet.id))
      } else {
        toastError('Hata', 'E-cüzdan silinemedi')
      }
    } catch (error) {
      console.error('E-cüzdan silme hatası:', error)
      toastError('Hata', 'E-cüzdan silinirken hata oluştu')
    }
  }

  const totalBalance = eWallets.reduce((sum, wallet) => sum + parseFloat(wallet.balance), 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
          <Home className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">E-Cüzdanlar</h1>
          <p className="text-muted-foreground">PayPal, Papara, Ininal ve diğer e-cüzdanlarınız</p>
        </div>
        <Link
          href="/ewallets/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Yeni E-Cüzdan
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Toplam E-Cüzdan Bakiyesi</CardTitle>
          <CardDescription>{eWallets.length} aktif e-cüzdan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrency(totalBalance, 'TRY')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>E-Cüzdan Listesi</CardTitle>
          <CardDescription>Tüm dijital cüzdanlarınız</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">E-cüzdanlar yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          ) : eWallets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-8 w-8 mx-auto mb-2" />
              <p>Henüz e-cüzdan eklenmemiş</p>
            </div>
          ) : (
            <div className="space-y-4">
              {eWallets.map(wallet => (
                <div
                  key={wallet.id}
                  className="group p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200 bg-gradient-to-r from-slate-50 to-slate-100/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <h3 className="font-semibold text-slate-800">{wallet.name}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          {wallet.provider}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {wallet.accountEmail && <div>{wallet.accountEmail}</div>}
                        {wallet.accountPhone && <div>{wallet.accountPhone}</div>}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          {formatCurrency(parseFloat(wallet.balance), wallet.currency.code)}
                        </p>
                        <p className="text-sm text-slate-500">{wallet.currency.code}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedWallet(wallet)
                            setShowEditModal(true)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWallet(wallet)
                            setShowDeleteConfirm(true)
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Düzenleme Modal */}
      {selectedWallet && (
        <EditNameModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedWallet(null)
          }}
          currentName={selectedWallet.name}
          onSave={handleEditName}
          title="E-Cüzdan Adını Düzenle"
          description="E-cüzdanınızın görünen adını değiştirin"
        />
      )}

      {/* Silme Onay Dialog */}
      {selectedWallet && (
        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false)
            setSelectedWallet(null)
          }}
          onConfirm={handleDelete}
          title="E-Cüzdanı Sil"
          message={`"${selectedWallet.name}" e-cüzdanını silmek istediğinize emin misiniz?`}
          warningMessage="E-cüzdan silindiğinde, bu e-cüzdanla yapılan TÜM İŞLEMLER de silinecektir! Bu işlem geri alınamaz."
          confirmText="Evet, Sil"
          cancelText="İptal"
        />
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Coins,
  TrendingUp,
  AlertCircle,
  ArrowLeft,
  Home,
  Tag,
  Calendar,
  Edit,
  Trash2,
} from 'lucide-react'
import { formatCurrency } from '@/lib/validators'
import { EditNameModal } from '@/components/ui/edit-name-modal'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface GoldItem {
  id: number
  name: string
  weightGrams: string
  purchasePrice: string
  currentValueTry: string | null
  purchaseDate: string
  description: string | null
  goldType: {
    id: number
    name: string
  }
  goldPurity: {
    id: number
    name: string
  }
  createdAt: string
}

export default function GoldPage() {
  const router = useRouter()
  const [goldItems, setGoldItems] = useState<GoldItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedGold, setSelectedGold] = useState<GoldItem | null>(null)

  useEffect(() => {
    async function fetchGoldItems() {
      try {
        const response = await fetch('/api/gold', {
          credentials: 'include',
        })
        if (response.ok) {
          const data = (await response.json()) as GoldItem[]
          setGoldItems(data)
        } else {
          setError('Altın eşyaları yüklenemedi')
        }
      } catch (error) {
        console.error('Altın eşyaları yüklenirken hata:', error)
        setError('Altın eşyaları yüklenirken hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    void fetchGoldItems()
  }, [])

  const handleEditName = async (newName: string) => {
    if (!selectedGold) {
      return
    }

    try {
      const response = await fetch(`/api/gold/${selectedGold.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
        credentials: 'include',
      })

      if (response.ok) {
        // Listeyi güncelle
        setGoldItems(prev =>
          prev.map(gold => (gold.id === selectedGold.id ? { ...gold, name: newName } : gold))
        )
        alert('Altın adı başarıyla güncellendi')
      } else {
        alert('Altın adı güncellenemedi')
      }
    } catch (error) {
      console.error('Altın güncelleme hatası:', error)
      alert('Altın güncellenirken hata oluştu')
    }
  }

  const handleDelete = async () => {
    if (!selectedGold) {
      return
    }

    try {
      const response = await fetch(`/api/gold/${selectedGold.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        const result = (await response.json()) as { message: string }
        alert(result.message)
        // Listeyi güncelle
        setGoldItems(prev => prev.filter(gold => gold.id !== selectedGold.id))
      } else {
        alert('Altın silinemedi')
      }
    } catch (error) {
      console.error('Altın silme hatası:', error)
      alert('Altın silinirken hata oluştu')
    }
  }

  // Hesaplamalar
  const totalWeight = goldItems.reduce((sum, item) => sum + parseFloat(item.weightGrams), 0)
  const totalPurchaseValue = goldItems.reduce(
    (sum, item) => sum + parseFloat(item.purchasePrice),
    0
  )
  const totalCurrentValue = goldItems.reduce(
    (sum, item) => sum + parseFloat(item.currentValueTry || '0'),
    0
  )
  const totalProfitLoss = totalCurrentValue - totalPurchaseValue

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Home className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Altın ve Ziynet</h1>
            <p className="text-muted-foreground">
              Altın yatırımlarınızı ve ziynet eşyalarınızı takip edin
            </p>
          </div>
        </div>
        <Link
          href="/gold/new"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Coins className="mr-2 h-4 w-4" />
          Yeni Altın Eşyası
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gram</CardTitle>
            <Coins className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totalWeight.toFixed(2)} g</div>
            <p className="text-xs text-muted-foreground">Toplam altın ağırlığı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alış Değeri</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalPurchaseValue, 'TRY')}
            </div>
            <p className="text-xs text-muted-foreground">Toplam alış değeri</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Güncel Değer</CardTitle>
            <AlertCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalCurrentValue, 'TRY')}
            </div>
            <p className="text-xs text-muted-foreground">Güncel piyasa değeri</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kar/Zarar</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {formatCurrency(Math.abs(totalProfitLoss), 'TRY')}
              {totalProfitLoss >= 0 ? ' ↗' : ' ↘'}
            </div>
            <p className="text-xs text-muted-foreground">Toplam kar/zarar</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Altın Eşya Listesi</CardTitle>
          <CardDescription>Tüm altın ve ziynet eşyalarınızın listesi</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Altın eşyaları yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          ) : goldItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="h-8 w-8 mx-auto mb-2" />
              <p>Henüz altın eşyası eklenmemiş</p>
              <Link href="/gold/new" className="text-blue-600 hover:underline">
                İlk altın eşyanızı ekleyin
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {goldItems.map(item => (
                <div
                  key={item.id}
                  className="group p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200 bg-gradient-to-r from-slate-50 to-slate-100/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <h3 className="font-semibold text-slate-800">{item.name}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                          {item.goldPurity.name}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {item.goldType.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          {item.weightGrams} g
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.purchaseDate).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-600">
                          {formatCurrency(parseFloat(item.currentValueTry || '0'), 'TRY')}
                        </p>
                        <p className="text-sm text-slate-500">
                          Alış: {formatCurrency(parseFloat(item.purchasePrice), 'TRY')}
                        </p>
                        <p
                          className={`text-xs ${parseFloat(item.currentValueTry || '0') >= parseFloat(item.purchasePrice) ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {parseFloat(item.currentValueTry || '0') >= parseFloat(item.purchasePrice)
                            ? '↗'
                            : '↘'}
                          {formatCurrency(
                            Math.abs(
                              parseFloat(item.currentValueTry || '0') -
                                parseFloat(item.purchasePrice)
                            ),
                            'TRY'
                          )}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedGold(item)
                            setShowEditModal(true)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedGold(item)
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
      {selectedGold && (
        <EditNameModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedGold(null)
          }}
          currentName={selectedGold.name}
          onSave={handleEditName}
          title="Altın Adını Düzenle"
          description="Altın eşyanızın görünen adını değiştirin"
        />
      )}

      {/* Silme Onay Dialog */}
      {selectedGold && (
        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false)
            setSelectedGold(null)
          }}
          onConfirm={handleDelete}
          title="Altını Sil"
          message={`"${selectedGold.name}" altın eşyasını silmek istediğinize emin misiniz?`}
          warningMessage="Bu işlem geri alınamaz. Altın kaydı tamamen silinecektir."
          confirmText="Evet, Sil"
          cancelText="İptal"
        />
      )}
    </div>
  )
}

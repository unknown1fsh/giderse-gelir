'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, PageHeader } from '@/components/mosaic'
import { Users, Edit, Trash2, Plus, Mail, Phone } from 'lucide-react'
import { EditNameModal } from '@/components/mosaic'
import { ConfirmationDialog } from '@/components/mosaic'
import { useToast } from '@/lib/use-toast'

interface Beneficiary {
  id: number
  name: string
  iban: string | null
  accountNo: string | null
  phoneNumber: string | null
  email: string | null
  bank: {
    id: number
    name: string
  } | null
  createdAt: string
}

export default function BeneficiariesPage() {
  const { success: toastSuccess, error: toastError } = useToast()
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null)

  useEffect(() => {
    fetchBeneficiaries()
  }, [])

  const fetchBeneficiaries = async () => {
    try {
      const response = await fetch('/api/beneficiaries', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setBeneficiaries(data)
      } else {
        setError('Alıcılar yüklenemedi')
      }
    } catch (error) {
      console.error('Alıcılar yüklenirken hata:', error)
      setError('Alıcılar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleEditName = async (newName: string) => {
    if (!selectedBeneficiary) {
      return
    }

    try {
      const response = await fetch(`/api/beneficiaries/${selectedBeneficiary.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
        credentials: 'include',
      })

      if (response.ok) {
        setBeneficiaries(prev =>
          prev.map(beneficiary =>
            beneficiary.id === selectedBeneficiary.id
              ? { ...beneficiary, name: newName }
              : beneficiary
          )
        )
        toastSuccess('Başarılı', 'Alıcı adı başarıyla güncellendi')
      } else {
        toastError('Hata', 'Alıcı adı güncellenemedi')
      }
    } catch (error) {
      console.error('Alıcı güncelleme hatası:', error)
      toastError('Hata', 'Alıcı güncellenirken hata oluştu')
    }
  }

  const handleDelete = async () => {
    if (!selectedBeneficiary) {
      return
    }

    try {
      const response = await fetch(`/api/beneficiaries/${selectedBeneficiary.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        toastSuccess('Başarılı', result.message)
        setBeneficiaries(prev =>
          prev.filter(beneficiary => beneficiary.id !== selectedBeneficiary.id)
        )
      } else {
        toastError('Hata', 'Alıcı silinemedi')
      }
    } catch (error) {
      console.error('Alıcı silme hatası:', error)
      toastError('Hata', 'Alıcı silinirken hata oluştu')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alıcılar / Kişiler"
        description="Havale ve EFT işlemleriniz için kayıtlı kişileri yönetin."
        breadcrumbs={[{ label: 'Alıcılar' }]}
        actions={(
          <Link
            href="/beneficiaries/new"
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Yeni Alıcı
          </Link>
        )}
      />

      <Card>
        <CardHeader>
          <CardTitle>Alıcı Listesi</CardTitle>
          <CardDescription>{beneficiaries.length} kayıtlı alıcı</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-300">Alıcılar yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400">{error}</p>
            </div>
          ) : beneficiaries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <p>Henüz alıcı eklenmemiş</p>
              <p className="text-sm mt-2">Havale/EFT yaparken yeni alıcı ekleyebilirsiniz</p>
            </div>
          ) : (
            <div className="space-y-4">
              {beneficiaries.map(beneficiary => (
                <div
                  key={beneficiary.id}
                  className="group p-4 border border-slate-700 rounded-xl hover:shadow-md transition-all duration-200 bg-gradient-to-r from-slate-800 to-slate-100/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <h3 className="font-semibold text-slate-100">{beneficiary.name}</h3>
                        {beneficiary.bank && (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-400">
                            {beneficiary.bank.name}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-xs text-slate-500">
                        {beneficiary.iban && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">IBAN:</span>
                            <span className="font-mono">{beneficiary.iban}</span>
                          </div>
                        )}
                        {beneficiary.accountNo && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Hesap No:</span>
                            <span className="font-mono">{beneficiary.accountNo}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {beneficiary.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {beneficiary.email}
                            </div>
                          )}
                          {beneficiary.phoneNumber && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {beneficiary.phoneNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedBeneficiary(beneficiary)
                          setShowEditModal(true)
                        }}
                        className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBeneficiary(beneficiary)
                          setShowDeleteConfirm(true)
                        }}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Düzenleme Modal */}
      {selectedBeneficiary && (
        <EditNameModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedBeneficiary(null)
          }}
          currentName={selectedBeneficiary.name}
          onSave={handleEditName}
          title="Alıcı Adını Düzenle"
          description="Alıcının görünen adını değiştirin"
        />
      )}

      {/* Silme Onay Dialog */}
      {selectedBeneficiary && (
        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false)
            setSelectedBeneficiary(null)
          }}
          onConfirm={handleDelete}
          title="Alıcıyı Sil"
          message={`"${selectedBeneficiary.name}" alıcısını silmek istediğinize emin misiniz?`}
          warningMessage="Alıcı silindiğinde, bu alıcıyla yapılan TÜM İŞLEMLER de silinecektir! Bu işlem geri alınamaz."
          confirmText="Evet, Sil"
          cancelText="İptal"
        />
      )}
    </div>
  )
}

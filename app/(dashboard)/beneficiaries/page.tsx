'use client'

import { useState, useEffect } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  FormField,
  Input,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/mosaic'
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

interface ReferenceData {
  banks: Array<{ id: number; name: string }>
}

export default function BeneficiariesPage() {
  const { success: toastSuccess, error: toastError } = useToast()
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
  const [creating, setCreating] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [createForm, setCreateForm] = useState({
    name: '',
    bankId: '',
    iban: '',
    accountNo: '',
    phoneNumber: '',
    email: '',
    description: '',
  })

  useEffect(() => {
    void fetchBeneficiaries()
    void fetchReferenceData()
  }, [])

  const fetchReferenceData = async () => {
    try {
      const response = await fetch('/api/reference-data', {
        credentials: 'include',
      })
      if (!response.ok) {
        return
      }

      const data = (await response.json()) as ReferenceData
      setReferenceData(data)
    } catch {
      // Referans veri alınamazsa bankasız kayıt da yapılabilir
    }
  }

  const openCreateDrawer = () => {
    setFormErrors({})
    setCreateForm({
      name: '',
      bankId: '',
      iban: '',
      accountNo: '',
      phoneNumber: '',
      email: '',
      description: '',
    })
    setDrawerOpen(true)
  }

  const validateCreateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!createForm.name.trim()) {
      nextErrors.name = 'Alıcı adı zorunludur'
    }

    if (
      !createForm.iban.trim() &&
      !createForm.accountNo.trim() &&
      !createForm.phoneNumber.trim() &&
      !createForm.email.trim()
    ) {
      nextErrors.contact =
        'En az bir iletişim bilgisi girin (IBAN, hesap no, telefon veya e-posta)'
    }

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleCreateBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateCreateForm()) {
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: createForm.name.trim(),
          iban: createForm.iban.trim() || null,
          accountNo: createForm.accountNo.trim() || null,
          bankId: createForm.bankId ? Number(createForm.bankId) : null,
          phoneNumber: createForm.phoneNumber.trim() || null,
          email: createForm.email.trim() || null,
          description: createForm.description.trim() || null,
        }),
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        throw new Error(payload.error || 'Alıcı eklenemedi')
      }

      toastSuccess('Başarılı', 'Alıcı başarıyla eklendi')
      setDrawerOpen(false)
      await fetchBeneficiaries()
    } catch (err) {
      toastError('Hata', err instanceof Error ? err.message : 'Alıcı eklenemedi')
    } finally {
      setCreating(false)
    }
  }

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
          <Button onClick={openCreateDrawer}>
            <Plus className="h-4 w-4" />
            Yeni Alıcı
          </Button>
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

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="border-white/10 bg-slate-950 sm:max-w-xl">
          <form onSubmit={e => void handleCreateBeneficiary(e)} className="flex h-full flex-col">
            <DrawerHeader>
              <DrawerTitle>Yeni Alıcı Ekle</DrawerTitle>
              <DrawerDescription>
                Havale ve EFT işlemleri için alıcı kaydını bu sayfadan ayrılmadan oluşturun.
              </DrawerDescription>
            </DrawerHeader>

            <DrawerBody className="space-y-5">
              <FormField label="Alıcı Adı" required error={formErrors.name}>
                <Input
                  value={createForm.name}
                  onChange={event => {
                    setCreateForm(prev => ({ ...prev, name: event.target.value }))
                    if (formErrors.name) {
                      setFormErrors(prev => ({ ...prev, name: '' }))
                    }
                  }}
                  placeholder="Örn: Ahmet Yılmaz"
                  variant={formErrors.name ? 'error' : 'default'}
                />
              </FormField>

              <FormField label="Banka (opsiyonel)">
                <Select
                  value={createForm.bankId}
                  onValueChange={value => setCreateForm(prev => ({ ...prev, bankId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Banka seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {referenceData?.banks.map(bank => (
                      <SelectItem key={bank.id} value={String(bank.id)}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              {formErrors.contact && (
                <p className="text-sm font-medium text-destructive">{formErrors.contact}</p>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="IBAN">
                  <Input
                    value={createForm.iban}
                    onChange={event => {
                      setCreateForm(prev => ({ ...prev, iban: event.target.value }))
                      if (formErrors.contact) {
                        setFormErrors(prev => ({ ...prev, contact: '' }))
                      }
                    }}
                    placeholder="TR00..."
                  />
                </FormField>

                <FormField label="Hesap Numarası">
                  <Input
                    value={createForm.accountNo}
                    onChange={event => {
                      setCreateForm(prev => ({ ...prev, accountNo: event.target.value }))
                      if (formErrors.contact) {
                        setFormErrors(prev => ({ ...prev, contact: '' }))
                      }
                    }}
                    placeholder="1234567890"
                  />
                </FormField>

                <FormField label="Telefon">
                  <Input
                    value={createForm.phoneNumber}
                    onChange={event => {
                      setCreateForm(prev => ({ ...prev, phoneNumber: event.target.value }))
                      if (formErrors.contact) {
                        setFormErrors(prev => ({ ...prev, contact: '' }))
                      }
                    }}
                    placeholder="05XX XXX XX XX"
                  />
                </FormField>

                <FormField label="E-posta">
                  <Input
                    type="email"
                    value={createForm.email}
                    onChange={event => {
                      setCreateForm(prev => ({ ...prev, email: event.target.value }))
                      if (formErrors.contact) {
                        setFormErrors(prev => ({ ...prev, contact: '' }))
                      }
                    }}
                    placeholder="ornek@eposta.com"
                  />
                </FormField>
              </div>

              <FormField label="Not (opsiyonel)">
                <Textarea
                  value={createForm.description}
                  onChange={event => setCreateForm(prev => ({ ...prev, description: event.target.value }))}
                  rows={3}
                  placeholder="Alıcı hakkında ek bilgi"
                />
              </FormField>
            </DrawerBody>

            <DrawerFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>
                Vazgeç
              </Button>
              <Button type="submit" variant="glow" loading={creating} disabled={creating}>
                Alıcıyı Kaydet
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EditNameModal } from '@/components/ui/edit-name-modal'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { usePremium } from '@/lib/use-premium'
import { parseCurrencyInput } from '@/lib/validators'
import { useToast } from '@/lib/use-toast'
import {
  ArrowLeft,
  Save,
  TrendingUp,
  Plus,
  Crown,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Users,
} from 'lucide-react'

interface ReferenceData {
  txTypes: Array<{ id: number; code: string; name: string }>
  categories: Array<{ id: number; name: string; txTypeId: number }>
  paymentMethods: Array<{ id: number; code: string; name: string }>
  accounts: Array<{ id: number; name: string; bank: { name: string }; currency: { code: string } }>
  creditCards: Array<{
    id: number
    name: string
    bank: { name: string }
    currency: { code: string }
  }>
  eWallets: Array<{ id: number; name: string; provider: string; currency: { code: string } }>
  beneficiaries: Array<{ id: number; name: string; iban?: string; bank?: { name: string } }>
  banks: Array<{ id: number; name: string }>
  currencies: Array<{ id: number; code: string; name: string; symbol: string }>
}

export default function NewIncomePage() {
  const router = useRouter()
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast()
  const { isPremium, handlePremiumFeature } = usePremium()
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [gelirTxTypeId, setGelirTxTypeId] = useState<number>(0)
  const [giderTxTypeId, setGiderTxTypeId] = useState<number>(0)
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false)
  const [showEWalletModal, setShowEWalletModal] = useState(false)

  // Düzenli gelir için state'ler
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringData, setRecurringData] = useState({
    frequency: 'monthly',
    endDate: '',
    name: '',
  })

  // Alıcılar yönetimi için state'ler
  const [showBeneficiariesSection, setShowBeneficiariesSection] = useState(false)
  const [editingBeneficiary, setEditingBeneficiary] = useState<{ id: number; name: string } | null>(
    null
  )
  const [deletingBeneficiary, setDeletingBeneficiary] = useState<{
    id: number
    name: string
  } | null>(null)

  const [formData, setFormData] = useState({
    txTypeId: 0,
    categoryId: 0,
    paymentMethodId: 0,
    accountId: 0,
    creditCardId: 0,
    eWalletId: 0,
    beneficiaryId: 0,
    amount: '',
    currencyId: 0,
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
    tags: '',
  })

  const [beneficiaryForm, setBeneficiaryForm] = useState({
    name: '',
    iban: '',
    accountNo: '',
    bankId: 0,
    phoneNumber: '',
    email: '',
    description: '',
  })

  const [eWalletForm, setEWalletForm] = useState({
    name: '',
    provider: '',
    accountEmail: '',
    accountPhone: '',
    balance: '0',
    currencyId: 0,
  })

  useEffect(() => {
    async function fetchReferenceData() {
      try {
        const response = await fetch('/api/reference-data')
        if (response.ok) {
          const data = (await response.json()) as ReferenceData
          setReferenceData(data)

          // GELIR tipini bul - farklı olası kod formatlarını kontrol et
          const gelirType = data.txTypes.find(
            t => t.code === 'GELIR' || t.code === 'gelir' || t.name?.toLowerCase().includes('gelir')
          )

          // GIDER tipini de bul (gider kategorilerini hariç tutmak için)
          const giderType = data.txTypes.find(
            t => t.code === 'GIDER' || t.code === 'gider' || t.name?.toLowerCase().includes('gider')
          )

          if (gelirType) {
            console.log('✅ GELIR tipi bulundu:', gelirType)
            setGelirTxTypeId(gelirType.id)
            setFormData(prev => ({ ...prev, txTypeId: gelirType.id }))
          } else {
            console.warn('⚠️ GELIR tipi bulunamadı. Mevcut txTypes:', data.txTypes)
            // İlk txType'ı varsayılan olarak kullan (fallback)
            if (data.txTypes.length > 0) {
              const firstType = data.txTypes[0]
              console.warn('⚠️ İlk txType kullanılıyor:', firstType)
              setGelirTxTypeId(firstType.id)
              setFormData(prev => ({ ...prev, txTypeId: firstType.id }))
            }
          }

          if (giderType) {
            setGiderTxTypeId(giderType.id)
          }

          const tryCurrency = data.currencies.find(c => c.code === 'TRY')
          if (tryCurrency) {
            setFormData(prev => ({ ...prev, currencyId: tryCurrency.id }))
            setEWalletForm(prev => ({ ...prev, currencyId: tryCurrency.id }))
          }
        }
      } catch (error) {
        console.error('Referans verileri alınamadı:', error)
      } finally {
        setLoading(false)
      }
    }

    void fetchReferenceData()
  }, [])

  // Kategorileri filtrele - sadece gelir kategorilerini göster, gider kategorilerini kesinlikle hariç tut
  const gelirCategories = referenceData?.categories
    ? gelirTxTypeId > 0
      ? referenceData.categories.filter(cat => {
        // Sadece gelir kategorilerini göster
        const isGelir = cat.txTypeId === gelirTxTypeId
        // Gider kategorilerini kesinlikle hariç tut
        const isGider = giderTxTypeId > 0 && cat.txTypeId === giderTxTypeId
        return isGelir && !isGider
      })
      : // Eğer gelirTxTypeId bulunamadıysa, gider olmayan kategorileri göster (fallback)
      referenceData.categories.filter(cat =>
        giderTxTypeId > 0 ? cat.txTypeId !== giderTxTypeId : true
      )
    : []

  // Debug log - sadece geliştirme ortamında
  useEffect(() => {
    if (referenceData && process.env.NODE_ENV === 'development') {
      console.log('📊 Reference Data Debug (Gelir):', {
        gelirTxTypeId,
        giderTxTypeId,
        totalCategories: referenceData.categories.length,
        gelirCategoriesCount: gelirCategories.length,
        giderCategoriesCount: referenceData.categories.filter(c => c.txTypeId === giderTxTypeId)
          .length,
        txTypes: referenceData.txTypes.map(t => ({ id: t.id, code: t.code, name: t.name })),
        sampleCategories: referenceData.categories.slice(0, 10).map(c => ({
          id: c.id,
          name: c.name,
          txTypeId: c.txTypeId,
          isGelir: c.txTypeId === gelirTxTypeId,
          isGider: c.txTypeId === giderTxTypeId,
        })),
      })

      if (gelirCategories.length === 0 && referenceData.categories.length > 0) {
        console.warn('⚠️ Gelir kategorileri bulunamadı!')
      }

      // Gider kategorilerinin gelir listesinde olup olmadığını kontrol et
      const giderInGelir = gelirCategories.some(c => c.txTypeId === giderTxTypeId)
      if (giderInGelir && giderTxTypeId > 0) {
        console.error('❌ HATA: Gider kategorileri gelir listesinde görünüyor!')
      }
    }
  }, [referenceData, gelirTxTypeId, giderTxTypeId, gelirCategories.length])

  const selectedPaymentMethod = referenceData?.paymentMethods.find(
    p => p.id === formData.paymentMethodId
  )

  const getPaymentFieldType = () => {
    if (!selectedPaymentMethod) {
      return null
    }

    const code = selectedPaymentMethod.code
    if (code === 'BANK_TRANSFER') {
      return 'account'
    }
    if (code === 'CREDIT_CARD') {
      return 'creditCard'
    }
    if (code === 'NAKIT') {
      return 'none'
    }
    if (code === 'HAVALE_EFT') {
      return 'transferWithBeneficiary'
    } // Hem hesap hem alıcı
    if (code === 'DEBIT_KARTI') {
      return 'account'
    }
    if (code === 'E_CUZDAN') {
      return 'eWallet'
    }
    return null
  }

  const paymentFieldType = getPaymentFieldType()

  const handleAddBeneficiary = async () => {
    if (!beneficiaryForm.name) {
      toastError('Hata', 'Alıcı adı zorunludur')
      return
    }

    try {
      const response = await fetch('/api/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(beneficiaryForm),
        credentials: 'include',
      })

      if (response.ok) {
        const newBeneficiary = (await response.json()) as { id: number }
        const updatedData = await fetch('/api/reference-data').then(
          r => r.json() as Promise<ReferenceData>
        )
        setReferenceData(updatedData)
        setFormData(prev => ({ ...prev, beneficiaryId: newBeneficiary.id }))
        setShowBeneficiaryModal(false)
        setBeneficiaryForm({
          name: '',
          iban: '',
          accountNo: '',
          bankId: 0,
          phoneNumber: '',
          email: '',
          description: '',
        })
      } else {
        toastError('Hata', 'Alıcı eklenemedi')
      }
    } catch (error) {
      console.error('Alıcı eklenirken hata:', error)
      toastError('Hata', 'Alıcı eklenirken hata oluştu')
    }
  }

  const handleAddEWallet = async () => {
    if (!eWalletForm.name || !eWalletForm.provider) {
      toastError('Hata', 'E-cüzdan adı ve sağlayıcı zorunludur')
      return
    }

    try {
      const response = await fetch('/api/ewallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eWalletForm,
          balance: parseCurrencyInput(eWalletForm.balance),
        }),
        credentials: 'include',
      })

      if (response.ok) {
        const newEWallet = (await response.json()) as { id: number }
        const updatedData = await fetch('/api/reference-data').then(
          r => r.json() as Promise<ReferenceData>
        )
        setReferenceData(updatedData)
        setFormData(prev => ({ ...prev, eWalletId: newEWallet.id }))
        setShowEWalletModal(false)
        setEWalletForm({
          name: '',
          provider: '',
          accountEmail: '',
          accountPhone: '',
          balance: '0',
          currencyId: eWalletForm.currencyId,
        })
      } else {
        toastError('Hata', 'E-cüzdan eklenemedi')
      }
    } catch (error) {
      console.error('E-cüzdan eklenirken hata:', error)
      toastError('Hata', 'E-cüzdan eklenirken hata oluştu')
    }
  }

  // Alıcı silme fonksiyonu
  const handleDeleteBeneficiary = async () => {
    if (!deletingBeneficiary) {
      return
    }

    try {
      const response = await fetch(`/api/beneficiaries/${deletingBeneficiary.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        const refRes = await fetch('/api/reference-data')
        if (refRes.ok) {
          const data = (await refRes.json()) as ReferenceData
          setReferenceData(data)
        }
        toastSuccess('Başarılı', 'Alıcı başarıyla silindi')
      } else {
        toastError('Hata', 'Alıcı silinemedi')
      }
    } catch (error) {
      console.error('Alıcı silme hatası:', error)
      toastError('Hata', 'Alıcı silinemedi')
    } finally {
      setDeletingBeneficiary(null)
    }
  }

  // Alıcı düzenleme fonksiyonu
  const handleEditBeneficiary = async (newName: string) => {
    if (!editingBeneficiary) {
      return
    }

    try {
      const response = await fetch(`/api/beneficiaries/${editingBeneficiary.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
        credentials: 'include',
      })

      if (response.ok) {
        const refRes = await fetch('/api/reference-data')
        if (refRes.ok) {
          const data = (await refRes.json()) as ReferenceData
          setReferenceData(data)
        }
      }
    } catch (error) {
      console.error('Alıcı düzenleme hatası:', error)
    } finally {
      setEditingBeneficiary(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.categoryId) {
      toastError('Hata', 'Lütfen kategori seçiniz')
      return
    }
    if (!formData.paymentMethodId) {
      toastError('Hata', 'Lütfen ödeme yöntemi seçiniz')
      return
    }

    if (paymentFieldType === 'account' && !formData.accountId) {
      toastError('Hata', 'Lütfen hesap seçiniz')
      return
    }
    if (paymentFieldType === 'creditCard' && !formData.creditCardId) {
      toastError('Hata', 'Lütfen kredi kartı seçiniz')
      return
    }
    if (
      paymentFieldType === 'transferWithBeneficiary' &&
      (!formData.accountId || !formData.beneficiaryId)
    ) {
      toastError('Hata', 'Lütfen hem hesap hem de gönderici seçiniz')
      return
    }
    if (paymentFieldType === 'eWallet' && !formData.eWalletId) {
      toastError('Hata', 'Lütfen e-cüzdan seçiniz')
      return
    }

    // Düzenli gelir validasyonu
    if (isRecurring && !recurringData.name) {
      toastError('Hata', 'Lütfen düzenli gelir için bir isim girin')
      return
    }

    setSaving(true)

    try {
      const tagsArray = formData.tags
        ? formData.tags
          .split(',')
          .map(t => t.trim())
          .filter(t => t)
        : []

      const submitData: Record<string, unknown> = {
        txTypeId: formData.txTypeId,
        categoryId: formData.categoryId,
        paymentMethodId: formData.paymentMethodId,
        amount: parseCurrencyInput(formData.amount),
        currencyId: formData.currencyId,
        transactionDate: formData.transactionDate,
        tags: tagsArray,
      }

      if (formData.accountId > 0) {
        submitData.accountId = formData.accountId
      }
      if (formData.creditCardId > 0) {
        submitData.creditCardId = formData.creditCardId
      }
      if (formData.eWalletId > 0) {
        submitData.eWalletId = formData.eWalletId
      }
      if (formData.beneficiaryId > 0) {
        submitData.beneficiaryId = formData.beneficiaryId
      }
      if (formData.description) {
        submitData.description = formData.description
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string }
        toastError('Hata', errorData.error ?? 'Gelir eklenemedi')
        setSaving(false)
        return
      }

      // Eğer düzenli gelir ise, otomatik ödeme de oluştur
      if (isRecurring) {
        const autoPaymentData: Record<string, unknown> = {
          txTypeId: formData.txTypeId,
          name: recurringData.name,
          description: formData.description,
          amount: parseCurrencyInput(formData.amount),
          frequency: recurringData.frequency,
          nextPaymentDate: formData.transactionDate,
          categoryId: formData.categoryId,
          paymentMethodId: formData.paymentMethodId,
          currencyId: formData.currencyId,
        }

        if (recurringData.endDate) {
          autoPaymentData.endDate = recurringData.endDate
        }
        if (formData.accountId > 0) {
          autoPaymentData.accountId = formData.accountId
        }
        if (formData.creditCardId > 0) {
          autoPaymentData.creditCardId = formData.creditCardId
        }
        if (formData.eWalletId > 0) {
          autoPaymentData.eWalletId = formData.eWalletId
        }
        if (formData.beneficiaryId > 0) {
          autoPaymentData.beneficiaryId = formData.beneficiaryId
        }

        const autoResponse = await fetch('/api/auto-payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(autoPaymentData),
          credentials: 'include',
        })

        if (!autoResponse.ok) {
          console.error('Düzenli gelir oluşturulamadı')
          toastWarning('Dikkat', 'İşlem eklendi ancak düzenli gelir oluşturulamadı')
        }
      }

      router.push('/transactions')
    } catch (error) {
      console.error('Gelir eklenirken hata:', error)
      toastError('Hata', 'Gelir eklenirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-500" />
            <h1 className="text-3xl font-bold text-green-600">Yeni Gelir Ekle</h1>
          </div>
          <p className="text-muted-foreground">Gelir işleminizin detaylarını girin</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-green-600">Gelir Bilgileri</CardTitle>
          <CardDescription>Gelir işleminizin detaylarını doldurun</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={e => {
              void handleSubmit(e)
            }}
            className="space-y-6"
          >
            {/* Düzenli Gelir Checkbox */}
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={e => {
                  if (e.target.checked && !isPremium) {
                    handlePremiumFeature('Düzenli Gelir')
                    return
                  }
                  setIsRecurring(e.target.checked)
                }}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="recurring" className="flex-1 text-sm font-medium text-gray-900">
                Bu tekrar eden bir gelir
                {!isPremium && <Crown className="inline ml-2 h-4 w-4 text-purple-600" />}
              </label>
            </div>

            {/* Düzenli Gelir Formu */}
            {isRecurring && (
              <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-in slide-in-from-top duration-300">
                <h3 className="font-semibold text-green-900">Düzenli Gelir Ayarları</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Gelir Adı *</label>
                    <input
                      type="text"
                      value={recurringData.name}
                      onChange={e => setRecurringData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Örn: Maaş"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      required={isRecurring}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tekrar Sıklığı *</label>
                    <select
                      value={recurringData.frequency}
                      onChange={e =>
                        setRecurringData(prev => ({ ...prev, frequency: e.target.value }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    >
                      <option value="daily">Günlük</option>
                      <option value="weekly">Haftalık</option>
                      <option value="monthly">Aylık</option>
                      <option value="yearly">Yıllık</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Bitiş Tarihi (Opsiyonel)
                    </label>
                    <input
                      type="date"
                      value={recurringData.endDate}
                      onChange={e =>
                        setRecurringData(prev => ({ ...prev, endDate: e.target.value }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Boş bırakırsanız süresiz devam eder
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Gelir Kategorisi *</label>
                <select
                  value={formData.categoryId}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, categoryId: parseInt(e.target.value) }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value={0}>Gelir kategorisi seçiniz</option>
                  {gelirCategories.length > 0
                    ? gelirCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                    : referenceData && referenceData.categories.length > 0
                      ? // Fallback: Eğer gelir kategorileri yoksa, gider olmayan kategorileri göster
                      referenceData.categories
                        .filter(cat =>
                          giderTxTypeId > 0 ? cat.txTypeId !== giderTxTypeId : true
                        )
                        .map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))
                      : null}
                </select>
                {!referenceData || referenceData.categories.length === 0 ? (
                  <p className="text-xs text-red-600 mt-1">
                    ❌ Kategoriler yüklenemedi. Lütfen sayfayı yenileyin.
                  </p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tutar *</label>
                <input
                  type="text"
                  value={formData.amount}
                  onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0,00"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ödeme Yöntemi *</label>
                <select
                  value={formData.paymentMethodId}
                  onChange={e => {
                    const newPaymentMethodId = parseInt(e.target.value)
                    setFormData(prev => ({
                      ...prev,
                      paymentMethodId: newPaymentMethodId,
                      accountId: 0,
                      creditCardId: 0,
                      eWalletId: 0,
                      beneficiaryId: 0,
                    }))
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value={0}>Ödeme yöntemi seçiniz</option>
                  {referenceData?.paymentMethods.map(method => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tarih *</label>
                <input
                  type="date"
                  value={formData.transactionDate}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, transactionDate: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {paymentFieldType === 'account' && (
              <div>
                <label className="block text-sm font-medium mb-2">Banka Hesabı *</label>
                <select
                  value={formData.accountId}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, accountId: parseInt(e.target.value) }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value={0}>Hesap seçiniz</option>
                  {referenceData?.accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {account.bank.name} ({account.currency.code})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Seçilen hesabınıza eklenecektir</p>
              </div>
            )}

            {paymentFieldType === 'creditCard' && (
              <div>
                <label className="block text-sm font-medium mb-2">Kredi Kartı *</label>
                <select
                  value={formData.creditCardId}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, creditCardId: parseInt(e.target.value) }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value={0}>Kredi kartı seçiniz</option>
                  {referenceData?.creditCards.map(card => (
                    <option key={card.id} value={card.id}>
                      {card.name} - {card.bank.name} ({card.currency.code})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Kredi kartı bakiyenize eklenecektir</p>
              </div>
            )}

            {paymentFieldType === 'transferWithBeneficiary' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Hangi Hesaba *</label>
                  <select
                    value={formData.accountId}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, accountId: parseInt(e.target.value) }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value={0}>Hesap seçiniz</option>
                    {referenceData?.accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} - {account.bank.name} ({account.currency.code})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Havale/EFT alınacak hesap</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Gönderici/Kişi *</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.beneficiaryId}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, beneficiaryId: parseInt(e.target.value) }))
                      }
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value={0}>Gönderici seçiniz</option>
                      {referenceData?.beneficiaries.map(beneficiary => (
                        <option key={beneficiary.id} value={beneficiary.id}>
                          {beneficiary.name}{' '}
                          {beneficiary.iban ? `(${beneficiary.iban.slice(-4)})` : ''}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowBeneficiaryModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Yeni
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Havale/EFT gönderen kişi</p>
                </div>
              </div>
            )}

            {paymentFieldType === 'eWallet' && (
              <div>
                <label className="block text-sm font-medium mb-2">E-Cüzdan *</label>
                <div className="flex gap-2">
                  <select
                    value={formData.eWalletId}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, eWalletId: parseInt(e.target.value) }))
                    }
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value={0}>E-cüzdan seçiniz</option>
                    {referenceData?.eWallets.map(wallet => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} - {wallet.provider} ({wallet.currency.code})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowEWalletModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Yeni
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">PayPal, Papara, Ininal vb.</p>
              </div>
            )}

            {paymentFieldType === 'none' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  ℹ️ Nakit gelir seçildi. Otomatik olarak nakit hesabınıza eklenecektir.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Açıklama</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Gelir hakkında notlarınız..."
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Etiketler <span className="text-gray-400 font-normal">(virgülle ayırın)</span>
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="maaş, düzenli, aylık"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Alıcılar/Kişiler Yönetimi */}
            <div className="border-t pt-6">
              <button
                type="button"
                onClick={() => setShowBeneficiariesSection(!showBeneficiariesSection)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">Alıcılar / Kişiler Yönetimi</span>
                  <span className="text-xs text-gray-500">
                    ({referenceData?.beneficiaries.length || 0} kayıt)
                  </span>
                </div>
                {showBeneficiariesSection ? (
                  <ChevronUp className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                )}
              </button>

              {showBeneficiariesSection && (
                <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg animate-in slide-in-from-top duration-300">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Kayıtlı Gönderenler / Alıcılar</h3>
                    <button
                      type="button"
                      onClick={() => setShowBeneficiaryModal(true)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Yeni Ekle
                    </button>
                  </div>

                  {referenceData?.beneficiaries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p>Henüz kişi eklenmemiş</p>
                      <button
                        type="button"
                        onClick={() => setShowBeneficiaryModal(true)}
                        className="mt-2 text-sm text-blue-600 hover:underline"
                      >
                        İlk kişiyi ekleyin
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {referenceData?.beneficiaries.map(beneficiary => (
                        <div
                          key={beneficiary.id}
                          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md hover:shadow-sm transition-shadow"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{beneficiary.name}</div>
                            {beneficiary.iban && (
                              <div className="text-xs text-gray-500">IBAN: {beneficiary.iban}</div>
                            )}
                            {beneficiary.bank && (
                              <div className="text-xs text-gray-500">{beneficiary.bank.name}</div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingBeneficiary({
                                  id: beneficiary.id,
                                  name: beneficiary.name,
                                })
                              }
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeletingBeneficiary({
                                  id: beneficiary.id,
                                  name: beneficiary.name,
                                })
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={saving}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {saving ? (
                  'Kaydediliyor...'
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Gelir Ekle
                  </>
                )}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Yeni Alıcı/Gönderici Modal */}
      {showBeneficiaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white shadow-xl">
            <CardHeader>
              <CardTitle>Yeni Gönderici Ekle</CardTitle>
              <CardDescription>Havale/EFT gönderen kişi bilgilerini girin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Kişi Adı *</label>
                <input
                  type="text"
                  value={beneficiaryForm.name}
                  onChange={e => setBeneficiaryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Ahmet Yılmaz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">IBAN</label>
                <input
                  type="text"
                  value={beneficiaryForm.iban}
                  onChange={e => setBeneficiaryForm(prev => ({ ...prev, iban: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hesap No</label>
                <input
                  type="text"
                  value={beneficiaryForm.accountNo}
                  onChange={e =>
                    setBeneficiaryForm(prev => ({ ...prev, accountNo: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Banka</label>
                <select
                  value={beneficiaryForm.bankId}
                  onChange={e =>
                    setBeneficiaryForm(prev => ({ ...prev, bankId: parseInt(e.target.value) }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value={0}>Banka seçiniz</option>
                  {referenceData?.banks.map(bank => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telefon</label>
                <input
                  type="text"
                  value={beneficiaryForm.phoneNumber}
                  onChange={e =>
                    setBeneficiaryForm(prev => ({ ...prev, phoneNumber: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="05XX XXX XX XX"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBeneficiaryModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleAddBeneficiary()
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Ekle
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Yeni E-Cüzdan Modal */}
      {showEWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white shadow-xl">
            <CardHeader>
              <CardTitle>Yeni E-Cüzdan Ekle</CardTitle>
              <CardDescription>PayPal, Papara, Ininal vb. e-cüzdan bilgileri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">E-Cüzdan Adı *</label>
                <input
                  type="text"
                  value={eWalletForm.name}
                  onChange={e => setEWalletForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Papara Hesabım"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sağlayıcı *</label>
                <select
                  value={eWalletForm.provider}
                  onChange={e => setEWalletForm(prev => ({ ...prev, provider: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Seçiniz</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Papara">Papara</option>
                  <option value="Ininal">Ininal</option>
                  <option value="Paycell">Paycell</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">E-posta</label>
                <input
                  type="email"
                  value={eWalletForm.accountEmail}
                  onChange={e =>
                    setEWalletForm(prev => ({ ...prev, accountEmail: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telefon</label>
                <input
                  type="text"
                  value={eWalletForm.accountPhone}
                  onChange={e =>
                    setEWalletForm(prev => ({ ...prev, accountPhone: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="05XX XXX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mevcut Bakiye</label>
                <input
                  type="text"
                  value={eWalletForm.balance}
                  onChange={e => setEWalletForm(prev => ({ ...prev, balance: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="0,00"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEWalletModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleAddEWallet()
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Ekle
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Beneficiary Modal */}
      {editingBeneficiary && (
        <EditNameModal
          isOpen={!!editingBeneficiary}
          onClose={() => setEditingBeneficiary(null)}
          currentName={editingBeneficiary.name}
          onSave={handleEditBeneficiary}
          title="Alıcı/Gönderen Adını Düzenle"
        />
      )}

      {/* Delete Beneficiary Confirmation */}
      {deletingBeneficiary && (
        <ConfirmationDialog
          isOpen={!!deletingBeneficiary}
          onClose={() => setDeletingBeneficiary(null)}
          onConfirm={handleDeleteBeneficiary}
          title="Kişi Sil"
          message={`"${deletingBeneficiary.name}" kişisini silmek istediğinizden emin misiniz?`}
          warningMessage="Bu kişiyle ilişkili işlem kayıtları da silinecektir. Bu işlem geri alınamaz."
          confirmText="Sil"
          cancelText="İptal"
        />
      )}
    </div>
  )
}

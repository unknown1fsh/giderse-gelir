'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PremiumUpgradeModal from '@/components/premium-upgrade-modal'
import {
  Button,
  Card,
  CardContent,
  FormPageShell,
} from '@/components/mosaic'
import {
  AutoPaymentForm,
  createAutoPaymentFormState,
  type AutoPaymentFormState,
  type AutoPaymentReferenceData,
} from '../components/auto-payment-form'
import {
  buildAutoPaymentPayload,
  buildAutoPaymentReferenceData,
  getDefaultAutoPaymentSelections,
  type AutoPaymentReferenceApiResponse,
} from '../components/auto-payment-client'
import { isPremiumPlan } from '@/lib/plan-config'
import { useToast } from '@/lib/use-toast'
import { useUser } from '@/lib/user-context'
import { ArrowLeftRight, CalendarPlus, Home } from 'lucide-react'

export default function NewAutoPaymentPage() {
  const router = useRouter()
  const { user } = useUser()
  const { success: toastSuccess, error: toastError } = useToast()
  const isPremium = isPremiumPlan(user?.plan || 'free')

  const [referenceData, setReferenceData] = useState<AutoPaymentReferenceData>({
    categories: [],
    paymentMethods: [],
    currencies: [],
    accounts: [],
    creditCards: [],
    eWallets: [],
    beneficiaries: [],
  })
  const [formData, setFormData] = useState<AutoPaymentFormState>(
    createAutoPaymentFormState({ record: null })
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  useEffect(() => {
    void fetchReferenceData()
  }, [])

  const fetchReferenceData = async () => {
    try {
      setError(null)
      setLoading(true)

      const response = await fetch('/api/reference-data', { credentials: 'include' })
      const payload = (await response.json()) as AutoPaymentReferenceApiResponse & { error?: string }

      if (!response.ok) {
        throw new Error(payload.error || 'Referans verileri alınamadı')
      }

      const nextReferenceData = buildAutoPaymentReferenceData(payload)
      const defaults = getDefaultAutoPaymentSelections(nextReferenceData)

      setReferenceData(nextReferenceData)
      setFormData(
        createAutoPaymentFormState({
          record: null,
          fallbackCurrencyId: defaults.currencyId,
          fallbackPaymentMethodId: defaults.paymentMethodId,
          fallbackCategoryId: defaults.categoryId,
        })
      )
    } catch (fetchError) {
      console.error('Auto payment reference fetch error:', fetchError)
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Referans verileri yüklenirken bir hata oluştu.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isPremium) {
      setShowPremiumModal(true)
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/auto-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(buildAutoPaymentPayload(formData)),
      })

      const payload = (await response.json()) as { error?: string; requiresPremium?: boolean }
      if (!response.ok) {
        if (payload.requiresPremium) {
          setShowPremiumModal(true)
          return
        }

        throw new Error(payload.error || 'Otomatik ödeme oluşturulamadı')
      }

      toastSuccess('Başarılı', 'Yeni otomatik ödeme oluşturuldu')
      router.push('/auto-payments')
    } catch (submitError) {
      console.error('Auto payment create error:', submitError)
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Otomatik ödeme oluşturulamadı.'
      setError(message)
      toastError('Hata', message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <FormPageShell
        header={{
          title: 'Yeni Otomatik Ödeme',
          description: 'Otomatik ödeme kaynağı, takvimi ve ödeme yöntemini tanımlayın.',
          breadcrumbs: [
            { label: 'Gösterge Paneli', href: '/dashboard' },
            { label: 'Otomatik Ödemeler', href: '/auto-payments' },
            { label: 'Yeni Kayıt' },
          ],
          onBack: () => router.back(),
          leadingActions: [
            {
              href: '/dashboard',
              ariaLabel: 'Gösterge Paneli',
              icon: <Home className="h-4 w-4" />,
            },
          ],
          actions: (
            <Button variant="outline" onClick={() => router.push('/auto-payments')}>
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Listeye Dön
            </Button>
          ),
        }}
      >
        {loading ? (
          <Card variant="premium" className="border-white/10 bg-white/5">
            <CardContent className="p-8">
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
                <div>
                  <p className="text-lg font-semibold text-white">Form Hazırlanıyor</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Kaynaklar, kategoriler ve ödeme yöntemleri yükleniyor.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card variant="premium" className="border-rose-500/20 bg-rose-500/10">
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="text-lg font-semibold text-white">Form Yüklenemedi</p>
                <p className="mt-2 text-sm text-slate-300">{error}</p>
              </div>
              <Button variant="outline" onClick={() => void fetchReferenceData()}>
                Tekrar Dene
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {!isPremium ? (
              <Card variant="premium" className="border-amber-500/20 bg-amber-500/10">
                <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-amber-200">Premium Gerekli</p>
                    <p className="mt-1 text-sm text-slate-300">
                      Kaydı tamamlamak için premium plana geçmeniz gerekir.
                    </p>
                  </div>
                  <Button variant="premium" onClick={() => setShowPremiumModal(true)}>
                    Premium'u Gör
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            <Card variant="premium" className="border-white/10 bg-slate-950/70">
              <CardContent className="p-6">
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-cyan-500/15 bg-cyan-500/10 p-4">
                  <CalendarPlus className="h-5 w-5 text-cyan-300" />
                  <div>
                    <p className="text-sm font-semibold text-white">Otomatik Ödeme Formu</p>
                    <p className="text-xs text-slate-400">
                      Kaynağı, takvimi ve ödeme yöntemini aşağıdan tanımlayın.
                    </p>
                  </div>
                </div>

                <AutoPaymentForm
                  mode="create"
                  formData={formData}
                  referenceData={referenceData}
                  onChange={setFormData}
                  onSubmit={handleSubmit}
                  onCancel={() => router.push('/auto-payments')}
                  submitLabel="Otomatik Ödemeyi Oluştur"
                  submitting={saving}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </FormPageShell>

      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        featureName="Otomatik Ödemeler"
      />
    </>
  )
}

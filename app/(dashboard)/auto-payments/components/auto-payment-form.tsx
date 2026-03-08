'use client'

import {
  Badge,
  Card,
  CardContent,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '@/components/mosaic'
import {
  AUTO_PAYMENT_FREQUENCY_OPTIONS,
  type AutoPaymentFrequency,
  type AutoPaymentSourceType,
  getFrequencyLabel,
} from '@/lib/finance/auto-payments'
import { formatCurrency } from '@/lib/validators'

export interface AutoPaymentReferenceOption {
  id: number
  name: string
  code?: string
  description?: string | null
  provider?: string | null
  bank?: { id: number; name: string } | null
  currency?: { id: number; code: string; name: string; symbol?: string | null } | null
  iban?: string | null
}

export interface AutoPaymentReferenceData {
  categories: AutoPaymentReferenceOption[]
  paymentMethods: AutoPaymentReferenceOption[]
  currencies: AutoPaymentReferenceOption[]
  accounts: AutoPaymentReferenceOption[]
  creditCards: AutoPaymentReferenceOption[]
  eWallets: AutoPaymentReferenceOption[]
  beneficiaries: AutoPaymentReferenceOption[]
}

export interface AutoPaymentFormState {
  name: string
  description: string
  amount: string
  currencyId: string
  paymentMethodId: string
  categoryId: string
  frequency: AutoPaymentFrequency
  nextPaymentDate: string
  sourceType: AutoPaymentSourceType
  sourceId: string
  active: boolean
}

export const EMPTY_AUTO_PAYMENT_FORM: AutoPaymentFormState = {
  name: '',
  description: '',
  amount: '',
  currencyId: '',
  paymentMethodId: '',
  categoryId: '',
  frequency: 'monthly',
  nextPaymentDate: '',
  sourceType: 'none',
  sourceId: '',
  active: true,
}

const SOURCE_TYPE_LABELS: Record<AutoPaymentSourceType, string> = {
  none: 'Kaynak secmeden takip et',
  account: 'Banka hesabi',
  creditCard: 'Kredi karti',
  eWallet: 'E-cuzdan',
  beneficiary: 'Lehtar / alici',
}

function getSourceOptions(
  sourceType: AutoPaymentSourceType,
  referenceData: AutoPaymentReferenceData
) {
  switch (sourceType) {
    case 'account':
      return referenceData.accounts
    case 'creditCard':
      return referenceData.creditCards
    case 'eWallet':
      return referenceData.eWallets
    case 'beneficiary':
      return referenceData.beneficiaries
    default:
      return []
  }
}

function getSourceDescription(option: AutoPaymentReferenceOption | undefined, sourceType: AutoPaymentSourceType) {
  if (!option) {
    return 'Odeme kaynagi secilmediginde bu kayit takip ve hatirlatma amacli kullanilir.'
  }

  if (sourceType === 'account' || sourceType === 'creditCard') {
    return [option.bank?.name, option.currency?.code].filter(Boolean).join(' • ')
  }

  if (sourceType === 'eWallet') {
    return [option.provider, option.currency?.code].filter(Boolean).join(' • ')
  }

  if (sourceType === 'beneficiary') {
    return [option.bank?.name, option.iban].filter(Boolean).join(' • ')
  }

  return ''
}

export function createAutoPaymentFormState({
  fallbackCurrencyId,
  fallbackPaymentMethodId,
  fallbackCategoryId,
  record,
}: {
  fallbackCurrencyId?: string
  fallbackPaymentMethodId?: string
  fallbackCategoryId?: string
  record?: {
    name?: string | null
    description?: string | null
    amount?: number
    currencyId?: number | null
    paymentMethodId?: number | null
    categoryId?: number | null
    frequency?: AutoPaymentFrequency
    nextPaymentDate?: string | null
    active?: boolean
    sourceType?: AutoPaymentSourceType
    sourceId?: number | null
  } | null
}): AutoPaymentFormState {
  if (!record) {
    return {
      ...EMPTY_AUTO_PAYMENT_FORM,
      currencyId: fallbackCurrencyId ?? '',
      paymentMethodId: fallbackPaymentMethodId ?? '',
      categoryId: fallbackCategoryId ?? '',
    }
  }

  return {
    name: record.name ?? '',
    description: record.description ?? '',
    amount:
      typeof record.amount === 'number'
        ? Number.isInteger(record.amount)
          ? String(record.amount)
          : record.amount.toFixed(2)
        : '',
    currencyId: String(record.currencyId ?? fallbackCurrencyId ?? ''),
    paymentMethodId: String(record.paymentMethodId ?? fallbackPaymentMethodId ?? ''),
    categoryId: String(record.categoryId ?? fallbackCategoryId ?? ''),
    frequency: record.frequency ?? 'monthly',
    nextPaymentDate: record.nextPaymentDate ? record.nextPaymentDate.slice(0, 10) : '',
    sourceType: record.sourceType ?? 'none',
    sourceId: record.sourceId ? String(record.sourceId) : '',
    active: record.active ?? true,
  }
}

export function AutoPaymentForm({
  mode,
  formData,
  referenceData,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  submitting,
  allowActiveToggle = true,
}: {
  mode: 'create' | 'edit'
  formData: AutoPaymentFormState
  referenceData: AutoPaymentReferenceData
  onChange: (next: AutoPaymentFormState) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onCancel?: () => void
  submitLabel: string
  submitting?: boolean
  allowActiveToggle?: boolean
}) {
  const sourceOptions = getSourceOptions(formData.sourceType, referenceData)
  const selectedSource = sourceOptions.find(option => String(option.id) === formData.sourceId)
  const selectedCurrency = referenceData.currencies.find(
    currency => String(currency.id) === formData.currencyId
  )

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_320px]">
        <div className="space-y-5">
          <FormField label="Talimat Adı" htmlFor="auto-payment-name" required>
            <Input
              id="auto-payment-name"
              value={formData.name}
              onChange={event => onChange({ ...formData, name: event.target.value })}
              placeholder="Örn: Kira, internet, düzenli transfer"
              required
            />
          </FormField>

          <FormField label="Açıklama" htmlFor="auto-payment-description" hint="İsteğe bağlı">
            <Textarea
              id="auto-payment-description"
              value={formData.description}
              onChange={event => onChange({ ...formData, description: event.target.value })}
              rows={4}
              placeholder="Takip notları, ödeme günü veya hatırlatma bilgisi"
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Tutar" htmlFor="auto-payment-amount" required>
              <Input
                id="auto-payment-amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={event => onChange({ ...formData, amount: event.target.value })}
                placeholder="0.00"
                required
              />
            </FormField>

            <FormField label="Para Birimi" required>
              <Select
                value={formData.currencyId}
                onValueChange={value => onChange({ ...formData, currencyId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Para birimi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {referenceData.currencies.map(currency => (
                    <SelectItem key={currency.id} value={String(currency.id)}>
                      {currency.code} {currency.name ? `• ${currency.name}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Ödeme Yöntemi" required>
              <Select
                value={formData.paymentMethodId}
                onValueChange={value => onChange({ ...formData, paymentMethodId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ödeme yöntemi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {referenceData.paymentMethods.map(method => (
                    <SelectItem key={method.id} value={String(method.id)}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Kategori" required>
              <Select
                value={formData.categoryId}
                onValueChange={value => onChange({ ...formData, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {referenceData.categories.map(category => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Tekrarlama Sıklığı" required>
              <Select
                value={formData.frequency}
                onValueChange={value =>
                  onChange({ ...formData, frequency: value as AutoPaymentFrequency })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sıklık seçin" />
                </SelectTrigger>
                <SelectContent>
                  {AUTO_PAYMENT_FREQUENCY_OPTIONS.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Sonraki Ödeme Tarihi" htmlFor="auto-payment-next-date" required>
              <Input
                id="auto-payment-next-date"
                type="date"
                value={formData.nextPaymentDate}
                onChange={event => onChange({ ...formData, nextPaymentDate: event.target.value })}
                required
              />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
            <FormField
              label="Kaynak Tipi"
              hint="Aynı anda yalnızca tek kaynak bağlanabilir."
            >
              <Select
                value={formData.sourceType}
                onValueChange={value =>
                  onChange({
                    ...formData,
                    sourceType: value as AutoPaymentSourceType,
                    sourceId: '',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kaynak tipi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SOURCE_TYPE_LABELS).map(([id, label]) => (
                    <SelectItem key={id} value={id}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Kaynak Kaydı"
              hint={
                formData.sourceType === 'none'
                  ? 'Sadece takip etmek istiyorsanız boş bırakabilirsiniz.'
                  : 'Kaynak tipi seçtiğinizde bu alan zorunlu olur.'
              }
            >
              <Select
                value={formData.sourceId}
                onValueChange={value => onChange({ ...formData, sourceId: value })}
                disabled={formData.sourceType === 'none'}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      formData.sourceType === 'none'
                        ? 'Kaynak seçmeden ilerleniyor'
                        : 'Kaynak seçin'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {sourceOptions.map(option => (
                    <SelectItem key={option.id} value={String(option.id)}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {allowActiveToggle ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Talimat Aktif Olsun</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Pasif kayıtlar listede kalır ama hatırlatma ve odak panellerinden çıkar.
                  </p>
                </div>
                <Switch
                  checked={formData.active}
                  onCheckedChange={checked => onChange({ ...formData, active: checked })}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card variant="premium" className="border-white/10 bg-white/5">
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Önizleme</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {formData.name.trim() || 'Yeni otomatik ödeme'}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {mode === 'create'
                    ? 'Talimat eklendiğinde ana listede hemen görünür.'
                    : 'Değişiklikler kaydedildiğinde odak panelleri otomatik güncellenir.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant={formData.active ? 'success' : 'outline'}>
                  {formData.active ? 'Aktif' : 'Pasif'}
                </Badge>
                <Badge variant="info">{getFrequencyLabel(formData.frequency)}</Badge>
                {formData.sourceType !== 'none' ? (
                  <Badge variant="outline">{SOURCE_TYPE_LABELS[formData.sourceType]}</Badge>
                ) : (
                  <Badge variant="warning">Sadece takip kaydı</Badge>
                )}
              </div>

              <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Tutar Özeti</p>
                  <p className="mt-2 text-lg font-semibold text-cyan-300">
                    {formData.amount && selectedCurrency?.code
                      ? formatCurrency(Number(formData.amount), selectedCurrency.code)
                      : 'Tutar bekleniyor...'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Kaynak Bağlantısı</p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {selectedSource?.name || SOURCE_TYPE_LABELS[formData.sourceType]}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {getSourceDescription(selectedSource, formData.sourceType)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Takvim</p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {formData.nextPaymentDate
                      ? new Date(formData.nextPaymentDate).toLocaleDateString('tr-TR')
                      : 'Tarih seçilmedi'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {AUTO_PAYMENT_FREQUENCY_OPTIONS.find(option => option.id === formData.frequency)
                      ?.description ?? 'Takvim planı bekleniyor...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
              >
                Vazgeç
              </button>
            ) : null}
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={
                submitting ||
                !formData.name.trim() ||
                !formData.amount ||
                !formData.currencyId ||
                !formData.paymentMethodId ||
                !formData.categoryId ||
                !formData.nextPaymentDate ||
                (formData.sourceType !== 'none' && !formData.sourceId)
              }
            >
              {submitting ? 'Kaydediliyor...' : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

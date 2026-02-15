'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePeriod, CreatePeriodData } from '@/lib/period-context'
import { useUser } from '@/lib/user-context'
import { getDisplayName } from '@/lib/utils'
import { calculatePeriodDates } from '@/lib/period-helpers'
import {
  Check,
  Sparkles,
  ArrowRight,
  Rocket,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  Pencil,
  ChevronLeft,
  Loader2,
  AlertCircle,
  PartyPopper,
} from 'lucide-react'

type PeriodType = 'YEARLY' | 'FISCAL_YEAR' | 'MONTHLY' | 'CUSTOM'
type OnboardingStep = 'checking' | 'welcome' | 'type' | 'details' | 'success' | 'done'

interface PeriodTypeOption {
  value: PeriodType
  label: string
  description: string
  icon: React.ElementType
  gradient: string
  border: string
}

const periodTypes: PeriodTypeOption[] = [
  {
    value: 'YEARLY',
    label: 'Yıllık Dönem',
    description: 'Tüm yıl boyunca gelir ve giderlerinizi takip edin',
    icon: CalendarDays,
    gradient: 'from-blue-500 to-indigo-600',
    border: 'border-blue-500/50 hover:border-blue-400',
  },
  {
    value: 'MONTHLY',
    label: 'Aylık Dönem',
    description: 'Ay bazlı detaylı finansal takip',
    icon: CalendarRange,
    gradient: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-500/50 hover:border-emerald-400',
  },
  {
    value: 'FISCAL_YEAR',
    label: 'Mali Yıl',
    description: 'Resmi mali yıl takviminize uygun dönem',
    icon: CalendarClock,
    gradient: 'from-purple-500 to-pink-600',
    border: 'border-purple-500/50 hover:border-purple-400',
  },
  {
    value: 'CUSTOM',
    label: 'Özel Dönem',
    description: 'Kendi tarih aralığınızı belirleyin',
    icon: Pencil,
    gradient: 'from-amber-500 to-orange-600',
    border: 'border-amber-500/50 hover:border-amber-400',
  },
]

function generateAutoName(type: PeriodType): string {
  const now = new Date()
  switch (type) {
    case 'YEARLY':
      return `${now.getFullYear()} Yılı`
    case 'FISCAL_YEAR':
      return `${now.getFullYear()}-${now.getFullYear() + 1} Mali Yılı`
    case 'MONTHLY':
      return now.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
    case 'CUSTOM':
      return ''
  }
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Period Onboarding Wizard
 *
 * Professional multi-step onboarding for first-time users.
 * Replaces the old blocking modal with a polished wizard experience.
 */
export default function PeriodOnboarding() {
  const { user } = useUser()
  const { periods, loading, createPeriod, activePeriod, error: contextError, refreshPeriods } = usePeriod()

  const [step, setStep] = useState<OnboardingStep>('checking')
  const [selectedType, setSelectedType] = useState<PeriodType>('YEARLY')
  const [periodName, setPeriodName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [animating, setAnimating] = useState(false)

  // Check if onboarding should show
  useEffect(() => {
    if (!user || loading) {
      setStep('checking')
      return
    }
    if (contextError) {
      setStep('done')
      return
    }
    if (periods.length > 0 || activePeriod) {
      setStep('done')
    } else if (Array.isArray(periods) && periods.length === 0) {
      setStep('welcome')
    } else {
      setStep('done')
    }
  }, [user, loading, periods, activePeriod, contextError])

  // When type changes, auto-fill name and dates
  const handleTypeSelect = useCallback((type: PeriodType) => {
    setSelectedType(type)
    setError(null)

    const name = generateAutoName(type)
    setPeriodName(name)

    if (type !== 'CUSTOM') {
      const dates = calculatePeriodDates(type)
      setStartDate(formatDateForInput(dates.start))
      setEndDate(formatDateForInput(dates.end))
    } else {
      setStartDate('')
      setEndDate('')
    }
  }, [])

  // Animated step transition
  const goToStep = useCallback((nextStep: OnboardingStep) => {
    setAnimating(true)
    setTimeout(() => {
      setStep(nextStep)
      setTimeout(() => setAnimating(false), 50)
    }, 200)
  }, [])

  // Start onboarding
  const handleStart = () => {
    handleTypeSelect('YEARLY') // Pre-fill with yearly
    goToStep('type')
  }

  // Select type and move to details
  const handleTypeConfirm = () => {
    goToStep('details')
  }

  // Create period
  const handleCreate = async () => {
    if (!periodName.trim()) {
      setError('Dönem adı gereklidir')
      return
    }
    if (!startDate || !endDate) {
      setError('Başlangıç ve bitiş tarihleri gereklidir')
      return
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setError('Başlangıç tarihi bitiş tarihinden önce olmalıdır')
      return
    }

    setCreating(true)
    setError(null)

    try {
      const data: CreatePeriodData = {
        name: periodName.trim(),
        periodType: selectedType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description: description.trim() || undefined,
      }

      const result = await createPeriod(data)

      if (result.success) {
        goToStep('success')
        // After success animation, reload to dashboard
        setTimeout(async () => {
          await refreshPeriods()
          setStep('done')
        }, 2500)
      } else {
        setError(result.error || 'Dönem oluşturulamadı. Lütfen tekrar deneyin.')
      }
    } catch (err) {
      console.error('Create period error:', err)
      setError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setCreating(false)
    }
  }

  // Don't render anything if not needed
  if (!user || step === 'checking' || step === 'done' || loading || contextError) {
    return null
  }

  const displayName = user ? getDisplayName(user) : ''
  const selectedTypeInfo = periodTypes.find(t => t.value === selectedType)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-600/15 via-transparent to-transparent" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-2 h-2 bg-blue-400/30 rounded-full animate-pulse" />
        <div className="absolute top-[25%] right-[20%] w-3 h-3 bg-purple-400/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[30%] left-[25%] w-2 h-2 bg-pink-400/25 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[60%] right-[10%] w-2 h-2 bg-cyan-400/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-[15%] right-[35%] w-3 h-3 bg-indigo-400/20 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Content */}
      <div
        className={`relative w-full max-w-lg transition-all duration-300 ease-out ${animating ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
          }`}
      >
        {/* Step Indicator */}
        {step !== 'welcome' && step !== 'success' && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {['type', 'details'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${step === s
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-110'
                    : ['details'].indexOf(s) <= ['details'].indexOf(step)
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-white/5 text-slate-500 border border-white/10'
                    }`}
                >
                  {['details'].indexOf(s) < ['details'].indexOf(step) ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 1 && (
                  <div
                    className={`w-12 h-0.5 transition-all duration-500 ${['type', 'details'].indexOf(step) > i ? 'bg-blue-500' : 'bg-white/10'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ================================= */}
        {/* STEP 1: Welcome */}
        {/* ================================= */}
        {step === 'welcome' && (
          <div className="text-center space-y-8">
            {/* Animated Logo */}
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl rotate-6 opacity-80 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                <Rocket className="h-10 w-10 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Hoş Geldin{displayName ? `, ${displayName}` : ''}! 🎉
              </h1>
              <p className="text-slate-400 text-lg max-w-sm mx-auto">
                Finansal yönetim yolculuğuna başlamaya hazır mısın?
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto">
              {[
                { icon: '📊', text: 'Gelir & Gider Takibi' },
                { icon: '💳', text: 'Hesap Yönetimi' },
                { icon: '📈', text: 'Akıllı Analizler' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="px-3 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="text-xs text-slate-300 font-medium">{item.text}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleStart}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white font-semibold text-lg shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
            >
              <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              Başlayalım
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-xs text-slate-500">
              Sadece 30 saniye sürecek
            </p>
          </div>
        )}

        {/* ================================= */}
        {/* STEP 2: Period Type Selection */}
        {/* ================================= */}
        {step === 'type' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Dönem Tipini Seçin</h2>
              <p className="text-slate-400 text-sm">
                Gelir ve giderlerinizi nasıl organize etmek istersiniz?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {periodTypes.map((type) => {
                const Icon = type.icon
                const isSelected = selectedType === type.value
                return (
                  <button
                    key={type.value}
                    onClick={() => handleTypeSelect(type.value)}
                    className={`relative group p-4 rounded-2xl text-left transition-all duration-300 border-2 backdrop-blur-sm ${isSelected
                      ? `bg-gradient-to-br ${type.gradient} border-transparent shadow-lg scale-[1.02]`
                      : `bg-white/5 ${type.border} hover:bg-white/10`
                      }`}
                  >
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-blue-600" />
                      </div>
                    )}

                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all ${isSelected
                        ? 'bg-white/20'
                        : `bg-gradient-to-br ${type.gradient} shadow-md`
                        }`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>

                    <h3
                      className={`font-semibold text-sm mb-1 ${isSelected ? 'text-white' : 'text-slate-200'
                        }`}
                    >
                      {type.label}
                    </h3>
                    <p
                      className={`text-xs leading-relaxed ${isSelected ? 'text-white/80' : 'text-slate-400'
                        }`}
                    >
                      {type.description}
                    </p>
                  </button>
                )
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => goToStep('welcome')}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
              >
                <ChevronLeft className="h-4 w-4" />
                Geri
              </button>
              <button
                onClick={handleTypeConfirm}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all text-sm"
              >
                Devam Et
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================================= */}
        {/* STEP 3: Period Details */}
        {/* ================================= */}
        {step === 'details' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Dönem Bilgileri</h2>
              <p className="text-slate-400 text-sm">
                {selectedTypeInfo && (
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${selectedTypeInfo.gradient} text-white`}
                    >
                      {selectedTypeInfo.label}
                    </span>
                    dönem detayları
                  </span>
                )}
              </p>
            </div>

            <div className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
              {/* Period Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Dönem Adı <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={periodName}
                  onChange={(e) => {
                    setPeriodName(e.target.value)
                    setError(null)
                  }}
                  placeholder="Örn: 2026 Yılı"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Başlangıç <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      setError(null)
                    }}
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Bitiş <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value)
                      setError(null)
                    }}
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Description (optional) */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Açıklama <span className="text-slate-500 font-normal">(opsiyonel)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Bu dönem hakkında notlar..."
                  rows={2}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm resize-none"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => goToStep('type')}
                disabled={creating}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all text-sm font-medium disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Geri
              </button>
              <button
                onClick={() => void handleCreate()}
                disabled={creating}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Dönem Oluştur
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================================= */}
        {/* STEP 4: Success */}
        {/* ================================= */}
        {step === 'success' && (
          <div className="text-center space-y-6 py-4">
            {/* Success animation */}
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-ping opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30">
                <PartyPopper className="h-10 w-10 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-white">
                Harika! 🎉
              </h2>
              <p className="text-slate-400 text-lg">
                <span className="text-white font-medium">{periodName}</span> döneminiz oluşturuldu
              </p>
            </div>

            {/* Quick features */}
            <div className="space-y-2 max-w-xs mx-auto">
              {[
                'Gelir ve giderlerinizi takip edebilirsiniz',
                'Hesaplarınızı yönetebilirsiniz',
                'Detaylı raporlar oluşturabilirsiniz',
              ].map((text, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-left px-4 py-2 rounded-lg bg-white/5"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{text}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Dashboard&apos;a yönlendiriliyorsunuz...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

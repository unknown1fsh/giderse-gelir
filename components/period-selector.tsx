'use client'

import { usePeriod } from '@/lib/period-context'
import { formatPeriodName } from '@/lib/period-helpers'
import { Calendar, ChevronDown, Plus, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function PeriodSelector() {
  const { activePeriod, periods, loading, changePeriod, error } = usePeriod()
  const [isOpen, setIsOpen] = useState(false)

  if (loading) {
    return (
      <div className="w-full flex items-center space-x-2 px-4 py-2 bg-slate-700/30 rounded-lg animate-pulse">
        <Calendar className="h-4 w-4 text-slate-400" />
        <span className="text-sm text-slate-400">Yükleniyor...</span>
      </div>
    )
  }

  // Hata varsa hiçbir şey gösterme (migration öncesi)
  if (error) {
    return null
  }

  if (!activePeriod && periods.length === 0) {
    return (
      <Link
        href="/periods/new"
        className="w-full flex items-center justify-center space-x-2 px-4 min-h-[44px] py-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-colors"
      >
        <Plus className="h-4 w-4 text-yellow-400" />
        <span className="text-sm font-medium text-yellow-300">Dönem Oluştur</span>
      </Link>
    )
  }

  // Hiç period yoksa gösterme
  if (!activePeriod) {
    return null
  }

  const openPeriods = periods.filter(p => !p.isClosed)

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between space-x-3 px-4 min-h-[44px] py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all duration-200 group"
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <Calendar className="h-4 w-4 text-blue-400 flex-shrink-0" />
          <div className="text-left flex-1 min-w-0">
            <p className="text-xs text-slate-400">Aktif Dönem</p>
            <p className="text-sm font-medium text-white truncate">
              {formatPeriodName(activePeriod)}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden w-full">
            {/* Açık Dönemler */}
            {openPeriods.length > 0 && (
              <div>
                <div className="px-3 py-2 bg-slate-700/50 border-b border-slate-600">
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                    Açık Dönemler
                  </p>
                </div>
                <div className="max-h-[70vh] overflow-y-auto">
                  {openPeriods.map(period => (
                    <button
                      key={period.id}
                      onClick={() => {
                        void (async () => {
                          const success = await changePeriod(period.id)
                          if (success) {
                            setIsOpen(false)
                          }
                        })()
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors flex items-center justify-between group ${
                        period.id === activePeriod.id ? 'bg-blue-500/10' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                          {formatPeriodName(period)}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(period.startDate).toLocaleDateString('tr-TR')} -{' '}
                          {new Date(period.endDate).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      {period.id === activePeriod.id && (
                        <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Kapalı Dönemler */}
            {periods.some(p => p.isClosed) && (
              <div>
                <div className="px-3 py-2 bg-slate-700/50 border-y border-slate-600">
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                    Kapalı Dönemler
                  </p>
                </div>
                <div className="max-h-[40vh] overflow-y-auto">
                  {periods
                    .filter(p => p.isClosed)
                    .map(period => (
                      <button
                        key={period.id}
                        onClick={() => {
                          setIsOpen(false)
                          // Kapalı dönemlere geçiş yapılamaz, sadece görüntüleme için yönlendir
                          window.location.href = `/periods/${period.id}`
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-slate-700/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-400">
                              {formatPeriodName(period)}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {new Date(period.startDate).toLocaleDateString('tr-TR')} -{' '}
                              {new Date(period.endDate).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-slate-600 text-slate-300 rounded-full flex-shrink-0 ml-2">
                            Kapalı
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Yönet ve Yeni Oluştur */}
            <div className="border-t border-slate-600 p-2 space-y-1 bg-slate-700/30">
              <Link
                href="/periods"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center space-x-2 px-3 min-h-[44px] py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span>Dönemleri Yönet</span>
              </Link>
              <Link
                href="/periods/new"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center space-x-2 px-3 min-h-[44px] py-3 text-sm text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Yeni Dönem Oluştur</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

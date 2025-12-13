'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useUser } from '@/lib/user-context'
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Smartphone,
  Monitor,
  CreditCard,
  Mail,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowLeft,
  Home,
  Loader2,
  Crown,
  Sparkles,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const { user, updateUser, loading } = useUser()
  const [settings, setSettings] = useState({
    // Profil Ayarları
    name: '',
    email: '',
    phone: '',

    // Bildirim Ayarları
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    monthlyReports: true,
    paymentReminders: true,

    // Görünüm Ayarları
    theme: 'light',
    language: 'tr',
    currency: 'TRY',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1.234,56',

    // Güvenlik Ayarları
    twoFactorAuth: false,
    biometricAuth: true,
    autoLogout: true,
    sessionTimeout: 30,

    // Veri Ayarları
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 365,
    exportFormat: 'csv',
  })

  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [currencies, setCurrencies] = useState<
    Array<{ id: number; code: string; name: string; symbol: string }>
  >([])

  // Para birimlerini yükle
  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const response = await fetch('/api/reference-data')
        if (response.ok) {
          const data = (await response.json()) as {
            currencies?: Array<{ id: number; code: string; name: string; symbol: string }>
          }
          if (data.currencies && data.currencies.length > 0) {
            setCurrencies(data.currencies)
          }
        }
      } catch (error) {
        console.error('Para birimleri yüklenemedi:', error)
      }
    }
    void fetchCurrencies()
  }, [])

  // Kullanıcı verilerini yükle
  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        theme: 'light', // Varsayılan değerler
        language: 'tr',
        currency: 'TRY',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: '1.234,56',
      }))
    }
  }, [user])

  const tabs = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'notifications', name: 'Bildirimler', icon: Bell },
    { id: 'appearance', name: 'Görünüm', icon: Palette },
    { id: 'security', name: 'Güvenlik', icon: Shield },
    { id: 'data', name: 'Veri Yönetimi', icon: Database },
    { id: 'privacy', name: 'Gizlilik', icon: Lock },
  ]

  const handleSave = async () => {
    if (!user) {
      return
    }

    setIsSaving(true)
    setSaveMessage('')

    try {
      const success = await updateUser({
        name: settings.name,
        phone: settings.phone,
        theme: settings.theme,
        language: settings.language,
        currency: settings.currency,
        dateFormat: settings.dateFormat,
        numberFormat: settings.numberFormat,
      })

      if (success) {
        setSaveMessage('Ayarlar başarıyla kaydedildi!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage('Ayarlar kaydedilemedi. Lütfen tekrar deneyin.')
      }
    } catch (error) {
      setSaveMessage('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    // Veri dışa aktarma işlemi
    // eslint-disable-next-line no-console
    console.log('Veri dışa aktarılıyor...')
  }

  const handleImport = () => {
    // Veri içe aktarma işlemi
    // eslint-disable-next-line no-console
    console.log('Veri içe aktarılıyor...')
  }

  const handleDeleteAccount = () => {
    // Hesap silme işlemi
    // eslint-disable-next-line no-console
    console.log('Hesap siliniyor...')
  }

  const handleResetAllData = async () => {
    if (!user) {
      return
    }

    // Kullanıcıdan onay al
    const confirmed = window.confirm(
      '⚠️ UYARI: Bu işlem tüm verilerinizi kalıcı olarak silecektir!\n\n' +
        '• Tüm işlem geçmişi\n' +
        '• Tüm hesaplar\n' +
        '• Tüm kredi kartları\n' +
        '• Otomatik ödemeler\n' +
        '• Altın ve yatırım verileri\n\n' +
        'Bu işlem geri alınamaz!\n\n' +
        'Devam etmek istediğinizden emin misiniz?'
    )

    if (!confirmed) {
      return
    }

    // İkinci onay
    const doubleConfirmed = window.confirm(
      'Son uyarı: Tüm verileriniz silinecek!\n\n' +
        'Bu işlem geri alınamaz!\n\n' +
        'Kesinlikle devam etmek istiyor musunuz?'
    )

    if (!doubleConfirmed) {
      return
    }

    try {
      setIsSaving(true)

      const response = await fetch('/api/user/reset-all-data', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        alert('✅ Tüm verileriniz başarıyla silindi!')
        // Sayfayı yenile
        window.location.reload()
      } else {
        alert('❌ Veriler silinirken bir hata oluştu. Lütfen tekrar deneyin.')
      }
    } catch (error) {
      console.error('Reset data error:', error)
      alert('❌ Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  const handleGoHome = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Ayarlar
              </h1>
              <p className="text-slate-600 mt-1">Uygulama ve hesap ayarlarınızı yönetin</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              >
                <Home className="h-4 w-4 mr-2" />
                Anasayfa
              </Button>
              <Button
                onClick={() => {
                  void handleSave()
                }}
                disabled={isSaving || loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Kaydet
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className="px-8">
          <div
            className={`p-4 rounded-lg ${
              saveMessage.includes('başarıyla')
                ? 'bg-green-100 border border-green-200 text-green-800'
                : 'bg-red-100 border border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              {saveMessage.includes('başarıyla') ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">{saveMessage}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white/60 backdrop-blur-sm border-r border-slate-200/60 min-h-screen">
          <div className="p-6">
            {/* User Info */}
            {user && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      user.plan === 'premium'
                        ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                        : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                    }`}
                  >
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{user.name}</p>
                    <div className="flex items-center space-x-1">
                      {user.plan === 'premium' ? (
                        <>
                          <Crown className="h-3 w-3 text-purple-600" />
                          <span className="text-xs text-purple-600 font-medium">Premium</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 text-blue-600" />
                          <span className="text-xs text-blue-600 font-medium">Ücretsiz</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <nav className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-700 border border-blue-500/30 shadow-md'
                        : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-800'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md'
                          : 'bg-slate-200/50 text-slate-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    Profil Bilgileri
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Kişisel bilgilerinizi güncelleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Ad Soyad</label>
                      <Input
                        value={settings.name}
                        onChange={e => setSettings({ ...settings, name: e.target.value })}
                        placeholder="Adınızı girin"
                        className="border-slate-200 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">E-posta</label>
                      <div className="space-y-2">
                        <Input
                          type="email"
                          value={settings.email}
                          onChange={e => setSettings({ ...settings, email: e.target.value })}
                          placeholder="E-posta adresinizi girin"
                          className="border-slate-200 focus:border-blue-500"
                        />
                        {user && (
                          <div className="flex items-center gap-2">
                            {user.emailVerified ? (
                              <div className="flex items-center gap-1 text-sm text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span>E-posta doğrulanmış</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-sm text-yellow-600">
                                  <AlertTriangle className="h-4 w-4" />
                                  <span>E-posta doğrulanmamış</span>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    void (async () => {
                                      if (!user.email) {
                                        return
                                      }
                                      const response = await fetch(
                                        '/api/auth/resend-verification',
                                        {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ email: user.email }),
                                        }
                                      )
                                      const data = (await response.json()) as {
                                        success?: boolean
                                        message?: string
                                      }
                                      if (response.ok && data.success) {
                                        alert(
                                          'Doğrulama e-postası gönderildi. Lütfen e-posta kutunuzu kontrol edin.'
                                        )
                                      } else {
                                        alert(data.message || 'E-posta gönderilemedi')
                                      }
                                    })()
                                  }}
                                  className="text-xs"
                                >
                                  Doğrulama E-postası Gönder
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Telefon</label>
                      <Input
                        value={settings.phone}
                        onChange={e => setSettings({ ...settings, phone: e.target.value })}
                        placeholder="Telefon numaranızı girin"
                        className="border-slate-200 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Şifre</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Yeni şifre girin"
                          className="border-slate-200 focus:border-blue-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                      <Bell className="h-5 w-5 text-white" />
                    </div>
                    Bildirim Ayarları
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Hangi bildirimleri almak istediğinizi seçin
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-slate-800">E-posta Bildirimleri</p>
                          <p className="text-sm text-slate-600">Önemli güncellemeler ve raporlar</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={checked =>
                          setSettings({ ...settings, emailNotifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-slate-800">Push Bildirimleri</p>
                          <p className="text-sm text-slate-600">Anlık uygulama bildirimleri</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.pushNotifications}
                        onCheckedChange={checked =>
                          setSettings({ ...settings, pushNotifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-medium text-slate-800">Ödeme Hatırlatıcıları</p>
                          <p className="text-sm text-slate-600">Kredi kartı vade tarihleri</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.paymentReminders}
                        onCheckedChange={checked =>
                          setSettings({ ...settings, paymentReminders: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50">
                      <div className="flex items-center space-x-3">
                        <Monitor className="h-5 w-5 text-purple-500" />
                        <div>
                          <p className="font-medium text-slate-800">Haftalık Raporlar</p>
                          <p className="text-sm text-slate-600">Haftalık finansal özet</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.weeklyReports}
                        onCheckedChange={checked =>
                          setSettings({ ...settings, weeklyReports: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50">
                      <div className="flex items-center space-x-3">
                        <Settings className="h-5 w-5 text-indigo-500" />
                        <div>
                          <p className="font-medium text-slate-800">Aylık Raporlar</p>
                          <p className="text-sm text-slate-600">Detaylı aylık analiz</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.monthlyReports}
                        onCheckedChange={checked =>
                          setSettings({ ...settings, monthlyReports: checked })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 shadow-md">
                      <Palette className="h-5 w-5 text-white" />
                    </div>
                    Görünüm Ayarları
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Uygulamanın görünümünü kişiselleştirin
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Tema</label>
                      <Select
                        value={settings.theme}
                        onValueChange={value => setSettings({ ...settings, theme: value })}
                      >
                        <SelectTrigger className="border-slate-200 focus:border-purple-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">
                            <div className="flex items-center space-x-2">
                              <Sun className="h-4 w-4" />
                              <span>Açık Tema</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="dark">
                            <div className="flex items-center space-x-2">
                              <Moon className="h-4 w-4" />
                              <span>Koyu Tema</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="auto">
                            <div className="flex items-center space-x-2">
                              <Monitor className="h-4 w-4" />
                              <span>Sistem</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Dil</label>
                      <Select
                        value={settings.language}
                        onValueChange={value => setSettings({ ...settings, language: value })}
                      >
                        <SelectTrigger className="border-slate-200 focus:border-purple-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tr">Türkçe</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Para Birimi</label>
                      <Select
                        value={settings.currency}
                        onValueChange={value => setSettings({ ...settings, currency: value })}
                        disabled={currencies.length === 0}
                      >
                        <SelectTrigger className="border-slate-200 focus:border-purple-500">
                          <SelectValue
                            placeholder={
                              currencies.length === 0 ? 'Yükleniyor...' : 'Para birimi seçin'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.length > 0 ? (
                            currencies.map(currency => (
                              <SelectItem key={currency.id} value={currency.code}>
                                {currency.symbol} {currency.name} ({currency.code})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="TRY" disabled>
                              Para birimleri yükleniyor...
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {currencies.length === 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          Para birimleri yüklenemedi. Lütfen sayfayı yenileyin.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Tarih Formatı</label>
                      <Select
                        value={settings.dateFormat}
                        onValueChange={value => setSettings({ ...settings, dateFormat: value })}
                      >
                        <SelectTrigger className="border-slate-200 focus:border-purple-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 shadow-md">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    Güvenlik Ayarları
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Hesabınızın güvenliğini artırın
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50">
                      <div className="flex items-center space-x-3">
                        <Key className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-slate-800">İki Faktörlü Doğrulama</p>
                          <p className="text-sm text-slate-600">Ek güvenlik katmanı</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.twoFactorAuth}
                        onCheckedChange={checked =>
                          setSettings({ ...settings, twoFactorAuth: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-slate-800">Biyometrik Doğrulama</p>
                          <p className="text-sm text-slate-600">Parmak izi veya yüz tanıma</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.biometricAuth}
                        onCheckedChange={checked =>
                          setSettings({ ...settings, biometricAuth: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50">
                      <div className="flex items-center space-x-3">
                        <Lock className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-medium text-slate-800">Otomatik Çıkış</p>
                          <p className="text-sm text-slate-600">
                            Belirli süre sonra otomatik çıkış
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.autoLogout}
                        onCheckedChange={checked =>
                          setSettings({ ...settings, autoLogout: checked })
                        }
                      />
                    </div>

                    {settings.autoLogout && (
                      <div className="ml-6 space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Oturum Zaman Aşımı (dakika)
                        </label>
                        <Input
                          type="number"
                          value={settings.sessionTimeout}
                          onChange={e =>
                            setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })
                          }
                          className="border-slate-200 focus:border-red-500 w-32"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md">
                      <Database className="h-5 w-5 text-white" />
                    </div>
                    Veri Yönetimi
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Verilerinizi yedekleyin ve yönetin
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50">
                      <div className="flex items-center space-x-3">
                        <Database className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-slate-800">Otomatik Yedekleme</p>
                          <p className="text-sm text-slate-600">
                            Verilerinizi otomatik olarak yedekleyin
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.autoBackup}
                        onCheckedChange={checked =>
                          setSettings({ ...settings, autoBackup: checked })
                        }
                      />
                    </div>

                    {settings.autoBackup && (
                      <div className="ml-6 space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Yedekleme Sıklığı
                        </label>
                        <Select
                          value={settings.backupFrequency}
                          onValueChange={value =>
                            setSettings({ ...settings, backupFrequency: value })
                          }
                        >
                          <SelectTrigger className="border-slate-200 focus:border-indigo-500 w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Günlük</SelectItem>
                            <SelectItem value="weekly">Haftalık</SelectItem>
                            <SelectItem value="monthly">Aylık</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <Separator className="my-6" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        onClick={handleExport}
                        variant="outline"
                        className="flex items-center space-x-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-600"
                      >
                        <Download className="h-4 w-4" />
                        <span>Veri Dışa Aktar</span>
                      </Button>
                      <Button
                        onClick={handleImport}
                        variant="outline"
                        className="flex items-center space-x-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-600"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Veri İçe Aktar</span>
                      </Button>
                    </div>

                    <Separator className="my-6" />

                    {/* Tüm Verileri Sıfırla Butonu */}
                    <div className="p-6 border border-red-200 rounded-xl bg-gradient-to-r from-red-50 to-rose-50">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-6 w-6 text-red-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-red-800 text-lg">
                            Tüm Verilerimi Sıfırla
                          </p>
                          <p className="text-sm text-red-700 mt-2 mb-4">
                            ⚠️ <strong>UYARI:</strong> Bu işlem tüm işlemlerinizi, hesaplarınızı,
                            kredi kartlarınızı ve diğer tüm verilerinizi kalıcı olarak silecektir.
                            Bu işlem geri alınamaz!
                          </p>
                          <div className="space-y-2 text-sm text-red-600">
                            <p>• Tüm işlem geçmişi silinecek</p>
                            <p>• Tüm hesaplar silinecek</p>
                            <p>• Tüm kredi kartları silinecek</p>
                            <p>• Otomatik ödemeler silinecek</p>
                            <p>• Altın ve yatırım verileri silinecek</p>
                          </div>
                          <Button
                            onClick={() => {
                              void handleResetAllData()
                            }}
                            variant="destructive"
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Tüm Verilerimi Sıfırla
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border border-amber-200 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800">Veri Saklama</p>
                          <p className="text-sm text-amber-700 mt-1">
                            Verileriniz {settings.dataRetention} gün boyunca saklanır. Bu süre
                            sonunda otomatik olarak silinir.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-slate-500 to-gray-600 shadow-md">
                      <Lock className="h-5 w-5 text-white" />
                    </div>
                    Gizlilik ve Güvenlik
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Gizlilik ayarlarınızı yönetin
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 border border-green-200 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-800">Veri Şifreleme</p>
                          <p className="text-sm text-green-700 mt-1">
                            Tüm verileriniz end-to-end şifreleme ile korunmaktadır.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border border-blue-200 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="flex items-start space-x-3">
                        <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800">Veri Paylaşımı</p>
                          <p className="text-sm text-blue-700 mt-1">
                            Verileriniz üçüncü taraflarla paylaşılmaz ve sadece size aittir.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="p-6 border border-red-200 rounded-xl bg-gradient-to-r from-red-50 to-rose-50">
                      <div className="flex items-start space-x-3">
                        <Trash2 className="h-5 w-5 text-red-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-red-800">Hesabı Sil</p>
                          <p className="text-sm text-red-700 mt-1 mb-4">
                            Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem
                            geri alınamaz.
                          </p>
                          <Button
                            onClick={handleDeleteAccount}
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hesabı Sil
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

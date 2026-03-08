'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ConfirmDialog,
  PageHeader,
} from '@/components/mosaic'
import { useToast } from '@/lib/use-toast'
import { useUser } from '@/lib/user-context'
import { getDisplayName } from '@/lib/utils'
import {
  DEFAULT_APP_SETTINGS,
  DEFAULT_NOTIFICATION_PREFERENCES,
  normalizeAppSettings,
  normalizeNotificationPreferences,
} from '@/lib/user-preferences'
import {
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
  Target,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const { user, updateUser, loading } = useUser()
  const [settings, setSettings] = useState({
    // Profil Ayarları
    name: '',
    username: '',
    email: '',
    phone: '',

    // Bildirim Ayarları
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    monthlyReports: true,
    paymentReminders: true,
    budgetAlerts: true,
    goalMilestones: true,
    creditCardDueAlerts: true,

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
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const { success: toastSuccess, error: toastError } = useToast()
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
      const notificationPreferences = normalizeNotificationPreferences(user.notifications)
      const appSettings = normalizeAppSettings(user.settings)

      setSettings(prev => ({
        ...prev,
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        emailNotifications: notificationPreferences.emailNotifications,
        pushNotifications: notificationPreferences.pushNotifications,
        smsNotifications: notificationPreferences.smsNotifications,
        weeklyReports: notificationPreferences.weeklyReports,
        monthlyReports: notificationPreferences.monthlyReports,
        paymentReminders: notificationPreferences.paymentReminders,
        budgetAlerts: notificationPreferences.budgetAlerts,
        goalMilestones: notificationPreferences.goalMilestones,
        creditCardDueAlerts: notificationPreferences.creditCardDueAlerts,
        theme: user.theme || 'light',
        language: user.language || 'tr',
        currency: user.currency || 'TRY',
        dateFormat: user.dateFormat || 'DD/MM/YYYY',
        numberFormat: user.numberFormat || '1.234,56',
        twoFactorAuth: appSettings.twoFactorAuth,
        biometricAuth: appSettings.biometricAuth,
        autoLogout: appSettings.autoLogout,
        sessionTimeout: appSettings.sessionTimeout,
        autoBackup: appSettings.autoBackup,
        backupFrequency: appSettings.backupFrequency,
        dataRetention: appSettings.dataRetention,
        exportFormat: appSettings.exportFormat,
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
        username: settings.username,
        phone: settings.phone,
        theme: settings.theme,
        language: settings.language,
        currency: settings.currency,
        dateFormat: settings.dateFormat,
        numberFormat: settings.numberFormat,
        notifications: {
          ...DEFAULT_NOTIFICATION_PREFERENCES,
          emailNotifications: settings.emailNotifications,
          pushNotifications: settings.pushNotifications,
          smsNotifications: settings.smsNotifications,
          weeklyReports: settings.weeklyReports,
          monthlyReports: settings.monthlyReports,
          paymentReminders: settings.paymentReminders,
          budgetAlerts: settings.budgetAlerts,
          goalMilestones: settings.goalMilestones,
          creditCardDueAlerts: settings.creditCardDueAlerts,
        },
        settings: {
          ...DEFAULT_APP_SETTINGS,
          twoFactorAuth: settings.twoFactorAuth,
          biometricAuth: settings.biometricAuth,
          autoLogout: settings.autoLogout,
          sessionTimeout: settings.sessionTimeout,
          autoBackup: settings.autoBackup,
          backupFrequency: settings.backupFrequency,
          dataRetention: settings.dataRetention,
          exportFormat: settings.exportFormat,
        },
      })

      if (success) {
        toastSuccess('Başarılı', 'Ayarlar başarıyla kaydedildi!')
        setSaveMessage('Ayarlar başarıyla kaydedildi')
      } else {
        toastError('Hata', 'Ayarlar kaydedilemedi. Lütfen tekrar deneyin.')
        setSaveMessage('Ayarlar kaydedilemedi')
      }
    } catch (error) {
      setSaveMessage('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    console.log('Veri dışa aktarılıyor...')
  }

  const handleImport = () => {
    console.log('Veri içe aktarılıyor...')
  }

  const handleDeleteAccount = () => {
    console.log('Hesap siliniyor...')
  }

  const handleResetAllData = async () => {
    if (!user) {
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch('/api/user/reset-all-data', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        toastSuccess('Tüm verileriniz başarıyla silindi!')
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        toastError('Veriler silinirken bir hata oluştu. Lütfen tekrar deneyin.')
      }
    } catch (error) {
      console.error('Reset data error:', error)
      toastError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSaving(false)
      setIsResetDialogOpen(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">

      <PageHeader
        title="Ayarlar"
        description="Uygulama ve hesap ayarlarınızı yönetin"
        actions={
          <>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Anasayfa
            </Button>
            <Button onClick={handleSave} disabled={isSaving || loading} variant="default">
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </>
        }
      />

      {saveMessage && (
        <div
          className={`p-4 flex items-center gap-3 rounded-xl border ${saveMessage.includes('başarıyla')
            ? 'bg-green-500/10 border-green-500/30 text-green-600'
            : 'bg-destructive/10 border-destructive/30 text-destructive'
            }`}
        >
          {saveMessage.includes('başarıyla') ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <span className="text-sm font-medium">{saveMessage}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 space-y-6">
          {user && (
            <Card className="bg-muted/30 border-border/50">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold text-foreground truncate">{getDisplayName(user)}</p>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    {user.plan === 'premium' ? (
                      <>
                        <Crown className="h-3 w-3 text-purple-500" />
                        <span className="text-xs text-purple-500 font-medium tracking-wide">Premium</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span className="text-xs text-primary font-medium tracking-wide">Ücretsiz</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-muted-foreground" />
                  Profil Bilgileri
                </CardTitle>
                <CardDescription>
                  Kişisel bilgilerinizi güncelleyin ve hesabınızı yönetin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ad Soyad</label>
                    <Input
                      value={settings.name}
                      onChange={e => setSettings({ ...settings, name: e.target.value })}
                      placeholder="Adınızı girin"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kullanıcı Adı</label>
                    <div className="space-y-1">
                      <Input
                        value={settings.username}
                        onChange={e => setSettings({ ...settings, username: e.target.value })}
                        placeholder="Kullanıcı adınızı girin"
                        disabled={!!(user && user.usernameChangeCount >= 1)}
                      />
                      {user && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {user.usernameChangeCount >= 1
                            ? 'Kullanıcı adınızı daha önce değiştirdiğiniz için tekrar değiştiremezsiniz.'
                            : 'Kullanıcı adınızı sadece 1 kez değiştirebilirsiniz.'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">E-posta</label>
                    <Input
                      type="email"
                      value={settings.email}
                      onChange={e => setSettings({ ...settings, email: e.target.value })}
                      placeholder="E-posta adresiniz"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Telefon</label>
                    <Input
                      value={settings.phone}
                      onChange={e => setSettings({ ...settings, phone: e.target.value })}
                      placeholder="Telefon numaranızı girin"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Şifre</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Yeni şifre girin"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  Bildirim Ayarları
                </CardTitle>
                <CardDescription>
                  Almak istediğiniz bildirim tiplerini belirleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                  <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">E-posta Bildirimleri</p>
                      <p className="text-sm text-muted-foreground">Önemli güncellemeler ve raporlar</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={checked => setSettings({ ...settings, emailNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                  <div className="flex items-center gap-4">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Push Bildirimleri</p>
                      <p className="text-sm text-muted-foreground">Anlık uygulama içi bildirimler</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={checked => setSettings({ ...settings, pushNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                  <div className="flex items-center gap-4">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Ödeme Hatırlatıcıları</p>
                      <p className="text-sm text-muted-foreground">Kredi kartı ve faturta vadeleri</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.paymentReminders}
                    onCheckedChange={checked => setSettings({ ...settings, paymentReminders: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                  <div className="flex items-center gap-4">
                    <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Bütçe Aşımı Uyarıları</p>
                      <p className="text-sm text-muted-foreground">Kategori bazlı eşik ve aşım bildirimleri</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.budgetAlerts}
                    onCheckedChange={checked => setSettings({ ...settings, budgetAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                  <div className="flex items-center gap-4">
                    <Target className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Hedef İlerleme Bildirimleri</p>
                      <p className="text-sm text-muted-foreground">Milestone ve tamamlama anlarını kaçırmayın</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.goalMilestones}
                    onCheckedChange={checked => setSettings({ ...settings, goalMilestones: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                  <div className="flex items-center gap-4">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Kart Son Ödeme Uyarıları</p>
                      <p className="text-sm text-muted-foreground">Yaklaşan son ödeme günlerini erkenden görün</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.creditCardDueAlerts}
                    onCheckedChange={checked => setSettings({ ...settings, creditCardDueAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                  <div className="flex items-center gap-4">
                    <Monitor className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Haftalık Raporlar</p>
                      <p className="text-sm text-muted-foreground">Düzenli finansal özetiniz</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.weeklyReports}
                    onCheckedChange={checked => setSettings({ ...settings, weeklyReports: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                  <div className="flex items-center gap-4">
                    <Info className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Aylık Özetler</p>
                      <p className="text-sm text-muted-foreground">Ay sonu finans özeti ve net varlık snapshot raporu</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.monthlyReports}
                    onCheckedChange={checked => setSettings({ ...settings, monthlyReports: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="h-5 w-5 text-muted-foreground" />
                  Görünüm Ayarları
                </CardTitle>
                <CardDescription>
                  Dil, tema ve format seçeneklerini dilediğiniz gibi değiştirin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tema</label>
                    <Select value={settings.theme} onValueChange={val => setSettings({ ...settings, theme: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light"><div className="flex items-center gap-2"><Sun className="w-4 h-4" /> Açık Tema</div></SelectItem>
                        <SelectItem value="dark"><div className="flex items-center gap-2"><Moon className="w-4 h-4" /> Koyu Tema</div></SelectItem>
                        <SelectItem value="auto"><div className="flex items-center gap-2"><Monitor className="w-4 h-4" /> Sistem</div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dil</label>
                    <Select value={settings.language} onValueChange={val => setSettings({ ...settings, language: val })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tr">Türkçe</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Para Birimi</label>
                    <Select
                      value={settings.currency}
                      onValueChange={val => setSettings({ ...settings, currency: val })}
                      disabled={currencies.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={currencies.length === 0 ? 'Yükleniyor...' : 'Seçiniz'} />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(c => (
                          <SelectItem key={c.id} value={c.code}>{c.symbol} {c.name} ({c.code})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tarih Formatı</label>
                    <Select value={settings.dateFormat} onValueChange={val => setSettings({ ...settings, dateFormat: val })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">G/A/Y</SelectItem>
                        <SelectItem value="MM/DD/YYYY">A/G/Y</SelectItem>
                        <SelectItem value="YYYY-MM-DD">Y-A-G</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  Güvenlik Ayarları
                </CardTitle>
                <CardDescription>
                  Hesabınızı ve cihaz oturumunuzu ekstra katmanlarla koruyun
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                  <div className="flex items-center gap-4">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">İki Faktörlü Doğrulama</p>
                      <p className="text-sm text-muted-foreground">Ek güvenlik katmanı zorunluluğu</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={checked => setSettings({ ...settings, twoFactorAuth: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                  <div className="flex items-center gap-4">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Biyometrik Doğrulama</p>
                      <p className="text-sm text-muted-foreground">Mobil cihazda FaceID / Parmak İzi ile giriş</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.biometricAuth}
                    onCheckedChange={checked => setSettings({ ...settings, biometricAuth: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                  <div className="flex items-center gap-4">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Otomatik Çıkış</p>
                      <p className="text-sm text-muted-foreground">Hareketsizlik sonrası oturumu kapat</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.autoLogout}
                    onCheckedChange={checked => setSettings({ ...settings, autoLogout: checked })}
                  />
                </div>
                {settings.autoLogout && (
                  <div className="pl-14 pt-2">
                    <label className="text-sm font-medium mb-2 block">Oturum Zaman Aşımı (dk)</label>
                    <Input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={e => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 30 })}
                      className="w-32"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'data' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  Veri Yönetimi
                </CardTitle>
                <CardDescription>
                  Yedekleme, içe aktar/dışa aktar ve geçmişi sıfırlama işlemleri
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                  <div className="flex items-center gap-4">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Otomatik Yedekleme</p>
                      <p className="text-sm text-muted-foreground">Bulut yedeklemesini etkinleştirin</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={checked => setSettings({ ...settings, autoBackup: checked })}
                  />
                </div>
                {settings.autoBackup && (
                  <div className="pl-14">
                    <label className="text-sm font-medium mb-2 block">Yedekleme Sıklığı</label>
                    <Select value={settings.backupFrequency} onValueChange={val => setSettings({ ...settings, backupFrequency: val })}>
                      <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Her Gün</SelectItem>
                        <SelectItem value="weekly">Haftada Bir</SelectItem>
                        <SelectItem value="monthly">Ayda Bir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="h-px bg-border my-2" />

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" onClick={handleExport} className="flex-1">
                    <Download className="w-4 h-4 mr-2" /> Cihaza Yedek İndir (.csv)
                  </Button>
                  <Button variant="outline" onClick={handleImport} className="flex-1">
                    <Upload className="w-4 h-4 mr-2" /> Dosyadan İçe Aktar
                  </Button>
                </div>

                <div className="h-px bg-border my-2" />

                <div className="p-5 border border-destructive/30 rounded-xl bg-destructive/10">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <p className="font-semibold text-destructive">Tüm Verileri Sıfırla</p>
                      <p className="text-sm text-destructive/80">
                        Hesabınız açık kalır ancak işlem geçmişiniz, kredi kartları ve cüzdanlarınız içerisindeki tüm harici verileriniz kalıcı olarak silinir. Bu işlem geri döndürülemez.
                      </p>
                      <Button variant="destructive" onClick={() => setIsResetDialogOpen(true)} className="mt-2">
                        <Trash2 className="w-4 h-4 mr-2" /> Verileri Sıfırla
                      </Button>
                    </div>
                  </div>
                </div>

                <ConfirmDialog
                  isOpen={isResetDialogOpen}
                  onClose={() => setIsResetDialogOpen(false)}
                  onConfirm={handleResetAllData}
                  title="Verileri Sıfırla"
                  message="Tüm işlemlerinizi kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!"
                  warningMessage="Uyarı: Sistem sıfırlanınca eski verilere kesinlikle tekrar ulaşılamaz."
                  confirmText="Evet, Her Şeyi Sil"
                  cancelText="İptal"
                  variant="danger"
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'privacy' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  Gizlilik Anlaşmaları ve Hesap Ayarları
                </CardTitle>
                <CardDescription>Hesabınızı silme veya gizlilik koşulları</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border border-green-500/20 rounded-xl bg-green-500/5">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Şifrelenmiş Trafik</p>
                      <p className="text-sm text-muted-foreground mt-1">Sistemimiz giden/gelen verilerinizi uçtan uca yüksek standartlarda şifreler.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-xl bg-muted/20">
                  <div className="flex items-start gap-4">
                    <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">3. Parti Paylaşımı Kapalı</p>
                      <p className="text-sm text-muted-foreground mt-1">Sistem istatistik toplar ama verileriniz kesinlikle üçüncü parti reklam verenlerle paylaşılamaz.</p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border my-2" />

                <div className="p-5 border border-destructive/30 rounded-xl bg-destructive/10">
                  <div className="flex items-start gap-3">
                    <Trash2 className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div className="space-y-2 flex-1">
                      <p className="font-semibold text-destructive">Hesabı Tamamen Sil</p>
                      <p className="text-sm text-destructive/80">
                        Abonelik iptali ve hesabın tamamen buluttan silinmesi. Tüm bilgileriniz saniyeler içinde yok edilecektir.
                      </p>
                      <Button variant="destructive" onClick={handleDeleteAccount} className="mt-2">
                        <Trash2 className="w-4 h-4 mr-2" /> Hesabı Sil
                      </Button>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

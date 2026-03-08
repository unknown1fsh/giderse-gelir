'use client'

import { useState } from 'react'
import { Alert, AlertDescription, AuthCardShell, AuthShell, Button, Input } from '@/components/mosaic'
import {
  Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2, Sparkles,
  ShieldCheck, Gift, CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BrandLogo from '@/components/brand-logo'
import { useToast } from '@/lib/use-toast'

/* ── Şifre güç göstergesi ─────────────────────────────────── */
function passwordStrength(pwd: string): { score: number; label: string; color: string } {
  if (pwd.length === 0) {return { score: 0, label: '', color: '' }}
  let score = 0
  if (pwd.length >= 8) {score++}
  if (pwd.length >= 12) {score++}
  if (/[A-Z]/.test(pwd)) {score++}
  if (/[0-9]/.test(pwd)) {score++}
  if (/[^A-Za-z0-9]/.test(pwd)) {score++}
  if (score <= 1) {return { score, label: 'Çok zayıf', color: 'bg-red-500' }}
  if (score === 2) {return { score, label: 'Zayıf', color: 'bg-orange-500' }}
  if (score === 3) {return { score, label: 'Orta', color: 'bg-yellow-500' }}
  if (score === 4) {return { score, label: 'Güçlü', color: 'bg-emerald-500' }}
  return { score, label: 'Çok güçlü', color: 'bg-emerald-400' }
}

/* ── Username kuralları ────────────────────────────────────── */
const USERNAME_RE = /^[a-zA-Z0-9][a-zA-Z0-9_-]{1,48}[a-zA-Z0-9]$/

function validateUsername(v: string): string {
  if (v.length < 3) {return 'En az 3 karakter'}
  if (v.length > 50) {return 'En fazla 50 karakter'}
  if (!USERNAME_RE.test(v)) {return 'Harf/rakam ile başlayıp bitmeli; sadece _, - kullanılabilir'}
  return ''
}

export default function RegisterPage() {
  const router = useRouter()
  const { success, error: toastError } = useToast()

  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '',
  })
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const pwd = passwordStrength(form.password)
  const usernameError = form.username ? validateUsername(form.username) : ''
  const passwordMismatch = form.confirmPassword && form.password !== form.confirmPassword

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const uErr = validateUsername(form.username)
    if (uErr) { setError(uErr); return }
    if (form.password.length < 8) { setError('Şifre en az 8 karakter olmalıdır'); return }
    if (form.password !== form.confirmPassword) { setError('Şifreler eşleşmiyor'); return }
    if (!agreedToTerms) { setError('Kullanım şartlarını kabul etmelisiniz'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          plan: 'free',
        }),
      })
      const data = (await res.json()) as { success?: boolean; message?: string; error?: string }

      if (!res.ok) {
        const msg = data.error || data.message || 'Kayıt olurken bir hata oluştu'
        setError(msg)
        toastError('Kayıt Hatası', msg)
        return
      }

      if (data.success) {
        success(
          'Kayıt Başarılı',
          data.message || 'Hesabınız oluşturuldu. Yönlendiriliyorsunuz...',
          Infinity,
          'Tamam'
        )
        router.push('/auth/login')
      } else {
        const msg = data.message || data.error || 'Kayıt olurken bir hata oluştu'
        setError(msg)
        toastError('Kayıt Başarısız', msg)
      }
    } catch {
      const msg = 'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.'
      setError(msg)
      toastError('Sistem Hatası', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title=""
      hero={(
        <BrandLogo
          size={36}
          priority
          variant="dark"
          textClassName="text-xl font-bold text-white"
        />
      )}
    >
      <AuthCardShell className="mx-auto max-w-lg">
        <div className="space-y-6">

          {/* Promo badge */}
          <div className="flex items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
            <Gift className="h-4 w-4 shrink-0" />
            <span><strong>Yeni üyelere özel:</strong> İlk 30 gün Premium ücretsiz.</span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-2xl font-bold text-white">Hesabını oluştur</h1>
            <p className="mt-1 text-sm text-slate-400">
              Anonim kayıt · Kredi kartı gerekmez · İstediğin zaman sil
            </p>
          </div>

          {/* Error */}
          {error && (
            <Alert className="border-red-500/30 bg-red-500/15">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-sm text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={e => void handleSubmit(e)} className="space-y-4">

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Kullanıcı adı <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  value={form.username}
                  onChange={set('username')}
                  placeholder="kullanici_adi"
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-slate-500 focus:border-violet-500"
                  required
                  suppressHydrationWarning
                />
              </div>
              {form.username && (
                <p className={`flex items-center gap-1 text-xs ${usernameError ? 'text-red-400' : 'text-emerald-400'}`}>
                  {usernameError
                    ? <><AlertCircle className="h-3 w-3" />{usernameError}</>
                    : <><CheckCircle2 className="h-3 w-3" />Kullanıcı adı uygun</>
                  }
                </p>
              )}
              {!form.username && (
                <p className="text-xs text-slate-500">
                  3–50 karakter · harf, rakam, _ ve - kullanılabilir
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                E-posta <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="ornek@email.com"
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-slate-500 focus:border-violet-500"
                  required
                  suppressHydrationWarning
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Şifre <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="En az 8 karakter"
                  minLength={8}
                  className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-slate-500 focus:border-violet-500"
                  required
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
                  aria-label={showPwd ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength meter */}
              {form.password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${i <= pwd.score ? pwd.color : 'bg-white/10'}`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${pwd.score <= 2 ? 'text-orange-400' : pwd.score === 3 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {pwd.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Şifre tekrar <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="Şifrenizi tekrar girin"
                  className={`pl-10 pr-10 bg-white/5 text-white placeholder:text-slate-500 focus:border-violet-500 ${passwordMismatch ? 'border-red-500/60' : 'border-white/20'}`}
                  required
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
                  aria-label={showConfirm ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordMismatch && (
                <p className="flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle className="h-3 w-3" /> Şifreler eşleşmiyor
                </p>
              )}
              {form.confirmPassword && !passwordMismatch && (
                <p className="flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Şifreler eşleşiyor
                </p>
              )}
            </div>

            {/* Terms */}
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={e => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-violet-600"
              />
              <span className="text-sm text-slate-400 leading-snug">
                <Link href="/terms" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">
                  Kullanım şartlarını
                </Link>{' '}
                ve{' '}
                <Link href="/privacy" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">
                  gizlilik politikasını
                </Link>{' '}
                okudum, kabul ediyorum.
              </span>
            </label>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-base font-semibold shadow-lg"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Hesap oluşturuluyor...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />Hesabımı Oluştur</>
              )}
            </Button>
          </form>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />KVKK Uyumlu</span>
            <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />Veriler şifreli</span>
            <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />İstediğin zaman sil</span>
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-slate-400">
            Zaten hesabın var mı?{' '}
            <Link href="/auth/login" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
              Giriş yap
            </Link>
          </p>

        </div>
      </AuthCardShell>
    </AuthShell>
  )
}

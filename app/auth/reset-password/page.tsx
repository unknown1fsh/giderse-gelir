'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthCardShell, AuthShell, Button, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/mosaic'
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import BrandLogo from '@/components/brand-logo'

function ResetPasswordContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (!token) {
            setStatus('error')
            setMessage('Geçersiz veya eksik şifre sıfırlama bağlantısı.')
        }
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            setStatus('error')
            setMessage('Şifreler eşleşmiyor.')
            return
        }

        if (formData.password.length < 8) {
            setStatus('error')
            setMessage('Şifre en az 8 karakter olmalıdır.')
            return
        }

        setStatus('loading')
        setMessage('')

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password: formData.password,
                }),
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setStatus('success')
                setMessage(data.message || 'Şifreniz başarıyla güncellendi.')
                setTimeout(() => {
                    router.push('/auth/login')
                }, 3000)
            } else {
                setStatus('error')
                setMessage(data.message || 'Şifre sıfırlama başarısız oldu.')
            }
        } catch (error) {
            setStatus('error')
            setMessage('Bir hata oluştu. Lütfen tekrar deneyin.')
        }
    }

    return (
        <AuthCardShell className="w-full max-w-md">
            <CardHeader className="px-0 pb-4 text-center">
                <CardTitle className="text-2xl font-bold text-white">Yeni Şifre Belirle</CardTitle>
                <CardDescription className="text-slate-300">
                    Hesabınız için yeni bir şifre oluşturun.
                </CardDescription>
            </CardHeader>
            <div className="space-y-6">
                {status === 'success' ? (
                    <div className="text-center space-y-4">
                        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex flex-col items-center">
                            <CheckCircle2 className="h-8 w-8 text-green-400 mb-2" />
                            <p className="text-green-100 font-medium">{message}</p>
                        </div>
                        <p className="text-slate-300 text-sm">
                            Giriş sayfasına yönlendiriliyorsunuz...
                        </p>
                        <Button
                            className="w-full min-h-[48px] bg-white/10 hover:bg-white/20 text-white"
                            onClick={() => router.push('/auth/login')}
                        >
                            Giriş Yap
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {status === 'error' && (
                            <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-red-400" />
                                <span className="text-red-400 text-sm">{message}</span>
                            </div>
                        )}

                        {!token && (
                            <div className="text-center">
                                <Link href="/auth/forgot-password" className="text-purple-400 hover:text-purple-300">
                                    Yeni bir bağlantı isteyin
                                </Link>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Yeni Şifre</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="En az 8 karakter"
                                    className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-500"
                                    required
                                    disabled={!token}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 text-slate-400 hover:text-slate-300"
                                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Şifre Tekrar</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="Şifrenizi tekrar girin"
                                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-500"
                                    required
                                    disabled={!token}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={status === 'loading' || !token}
                            className="w-full min-h-[48px] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-base sm:text-lg font-semibold shadow-lg"
                        >
                            {status === 'loading' ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Güncelleniyor...
                                </>
                            ) : (
                                'Şifreyi Güncelle'
                            )}
                        </Button>
                    </form>
                )}
            </div>
        </AuthCardShell>
    )
}

export default function ResetPasswordPage() {
    return (
        <AuthShell
            title="Yeni Şifre Belirle"
            description="Hesabınız için güvenli bir yeni şifre oluşturun."
            backHref="/auth/login"
            backLabel="Girişe Dön"
            hero={(
                <BrandLogo
                    size={48}
                    priority
                    variant="dark"
                    textClassName="text-2xl font-bold text-white"
                />
            )}
        >
                <Suspense fallback={
                    <AuthCardShell className="w-full max-w-md">
                        <CardContent className="py-10 text-center text-white">
                            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
                            <p>Yükleniyor...</p>
                        </CardContent>
                    </AuthCardShell>
                }>
                <ResetPasswordContent />
            </Suspense>
        </AuthShell>
    )
}

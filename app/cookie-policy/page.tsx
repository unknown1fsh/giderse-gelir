'use client'

import { Cookie, Shield, Eye, Settings, ArrowLeft, Mail, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function CookiePolicyPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <div className="border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/landing')}
                        className="text-slate-300 hover:text-white mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Ana Sayfaya Dön
                    </Button>
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                            <Cookie className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">Çerez Politikası</h1>
                    </div>
                    <p className="text-slate-400 text-sm sm:text-base">
                        Son Güncelleme:{' '}
                        {new Date().toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="space-y-8">
                    {/* Giriş */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-4">Giriş</h2>
                        <p className="text-slate-300 leading-relaxed">
                            GiderSE-Gelir olarak, web sitemizi ziyaretlerinizde deneyiminizi geliştirmek için çerezler, pikseller, GIF'ler gibi belirli teknolojileri (“çerezler”) kullanıyoruz. Bu Cookie Politikası, web sitemiz aracılığıyla kullanılan çerezlerin amaçlarını ve nasıl yönetileceğini açıklar.
                        </p>
                    </div>

                    {/* Çerez Nedir? */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-4">1. Çerez Nedir?</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Çerezler, bir web sitesini ziyaret ettiğinizde bilgisayarınıza veya mobil cihazınıza kaydedilen küçük metin dosyalarıdır. Çerezler, web sitesinin daha verimli çalışmasını, kullanıcı tercihlerinin hatırlanmasını ve site yöneticilerine bilgi sağlanmasını sağlar.
                        </p>
                    </div>

                    {/* Hangi Çerezleri Kullanıyoruz? */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-4">2. Hangi Çerezleri Kullanıyoruz?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="h-5 w-5 text-emerald-400" />
                                    <h3 className="font-semibold text-white">Zorunlu Çerezler</h3>
                                </div>
                                <p className="text-slate-300 text-sm">
                                    Web sitemizin düzgün çalışması için gereklidir. Oturum yönetimi, güvenlik ve erişim kontrolü gibi temel fonksiyonları sağlar.
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Settings className="h-5 w-5 text-blue-400" />
                                    <h3 className="font-semibold text-white">İşlevsel Çerezler</h3>
                                </div>
                                <p className="text-slate-300 text-sm">
                                    Seçtiğiniz dil, tema veya diğer tercihlerinizi hatırlayarak size daha kişiselleştirilmiş bir deneyim sunmamıza yardımcı olur.
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Eye className="h-5 w-5 text-purple-400" />
                                    <h3 className="font-semibold text-white">Analitik Çerezler</h3>
                                </div>
                                <p className="text-slate-300 text-sm">
                                    Sitemizin nasıl kullanıldığını anlamamıza yardımcı olan anonim bilgiler toplarız. Hangi sayfaların en çok ziyaret edildiğini görmemizi sağlar.
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Cookie className="h-5 w-5 text-pink-400" />
                                    <h3 className="font-semibold text-white">Reklam Çerezleri</h3>
                                </div>
                                <p className="text-slate-300 text-sm">
                                    İlgi alanlarınıza göre size uygun reklamların gösterilmesi için kullanılır. (Şu an aktif olarak reklam gösterimi yapmıyoruz).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Çerezlerin Yönetimi */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-4">3. Çerezlerin Yönetimi</h2>
                        <p className="text-slate-300 mb-4 leading-relaxed">
                            Çoğu web tarayıcısı çerezleri otomatik olarak kabul eder, ancak tarayıcı ayarlarınızı değiştirerek çerezleri reddedebilir veya bir çerez gönderildiğinde sizi uyaracak şekilde ayarlayabilirsiniz.
                        </p>
                        <div className="space-y-2 text-slate-300 text-sm">
                            <p>• Google Chrome: Ayarlar &gt; Gizlilik ve Güvenlik &gt; Çerezler</p>
                            <p>• Mozilla Firefox: Seçenekler &gt; Gizlilik ve Güvenlik &gt; Çerezler</p>
                            <p>• Safari: Tercihler &gt; Gizlilik &gt; Çerezler</p>
                        </div>
                        <p className="text-red-300 mt-4 text-sm font-medium">
                            Not: Zorunlu çerezleri devre dışı bırakmanız halinde web sitemizin bazı fonksiyonları düzgün çalışmayabilir.
                        </p>
                    </div>

                    {/* İletişim */}
                    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-blue-500/30">
                        <h2 className="text-2xl font-bold text-white mb-4">İletişim</h2>
                        <p className="text-slate-300 mb-4">Çerez politikamız ile ilgili her türlü soru ve görüşünüz için bizimle iletişime geçebilirsiniz:</p>
                        <div className="bg-white/10 rounded-lg p-4 space-y-2">
                            <p className="text-white font-semibold">GiderSE-Gelir</p>
                            <div className="space-y-1 text-slate-300 text-sm">
                                <p className="flex items-center">
                                    <Mail className="h-4 w-4 mr-2 text-blue-400" />
                                    E-posta: info@giderse-gelir.com
                                </p>
                                <p className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                                    Adres: Türkiye
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        onClick={() => router.push('/landing')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                        Ana Sayfaya Dön
                    </Button>
                </div>
            </div>
        </div>
    )
}

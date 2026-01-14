'use client'

import { ShieldCheck, Info, Database, Lock, ArrowLeft, Mail, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function KVKKPage() {
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
                        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">KVKK Aydınlatma Metni</h1>
                    </div>
                    <p className="text-slate-400 text-sm sm:text-base">
                        6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında Bilgilendirme
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="space-y-8">
                    {/* Giriş */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-4">Veri Sorumlusunun Kimliği</h2>
                        <p className="text-slate-300 leading-relaxed">
                            GiderSE-Gelir (“Şirket” veya “Platform”) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, veri sorumlusu sıfatıyla, kişisel verilerinizin aşağıda açıklanan amaçlar kapsamında işlenmesine büyük önem veriyoruz.
                        </p>
                    </div>

                    {/* Kişisel Verilerin İşlenme Amacı */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
                        <div className="flex items-start space-x-4 mb-4">
                            <Database className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-1" />
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">1. Kişisel Verilerin İşlenme Amacı</h2>
                                <p className="text-slate-300 mb-4 leading-relaxed">Toplanan kişisel verileriniz, aşağıdaki amaçlarla işlenmektedir:</p>
                                <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                                    <li>Platform üyeliğinin tesisi ve hizmetlerin sunulması</li>
                                    <li>Gelir-gider yönetim takibi ve finansal analiz hizmetlerinin yürütülmesi</li>
                                    <li>Yapay zeka modellerinin kişiselleştirilmiş finansal öneriler için kullanılması</li>
                                    <li>Kullanıcı güvenliğinin ve veri gizliliğinin sağlanması</li>
                                    <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                                    <li>İletişim faaliyetlerinin yürütülmesi</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Kişisel Veri Toplama Yöntemi */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
                        <div className="flex items-start space-x-4 mb-4">
                            <Info className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">2. Kişisel Veri Toplama Yöntemi ve Hukuki Sebebi</h2>
                                <p className="text-slate-300 leading-relaxed">
                                    Kişisel verileriniz, Platform üzerindeki formları doldurmanız, sisteme girdiğiniz finansal işlemler ve uygulama kullanım verileriniz aracılığıyla tamamen veya kısmen otomatik yollarla toplanmaktadır. İşlemenin hukuki sebepleri:
                                </p>
                                <div className="bg-white/5 rounded-lg p-4 mt-4 space-y-2">
                                    <p className="text-slate-300 text-sm italic">• Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması.</p>
                                    <p className="text-slate-300 text-sm italic">• Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi.</p>
                                    <p className="text-slate-300 text-sm italic">• İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Veri Güvenliği */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
                        <div className="flex items-start space-x-4 mb-4">
                            <Lock className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-1" />
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">3. Kişisel Verilerinizin Aktarılması</h2>
                                <p className="text-slate-300 leading-relaxed">
                                    Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda; yasal mercilerin talebi üzerine adli ve idari makamlara veya hizmet sağlayıcılarımıza (bulut altyapısı, veri saklama servisleri) KVKK'nın 8. ve 9. maddeleri çerçevesinde aktarılabilir.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Haklarınız */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-4">4. İlgili Kişinin Hakları</h2>
                        <p className="text-slate-300 mb-4 leading-relaxed">KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                            <div className="p-3 bg-white/5 rounded-lg border border-white/10">• Kişisel verilerinizin işlenip işlenmediğini öğrenme</div>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/10">• Verileriniz işlenmişse bilgi talep etme</div>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/10">• İşlenme amacına uygun kullanılıp kullanılmadığını öğrenme</div>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/10">• Verilerin eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme</div>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/10">• Verilerin silinmesini veya yok edilmesini isteme</div>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/10">• İtiraz etme ve zararın giderilmesini talep etme</div>
                        </div>
                    </div>

                    {/* İletişim */}
                    <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-emerald-500/30">
                        <h2 className="text-2xl font-bold text-white mb-4">Başvuru ve İletişim</h2>
                        <p className="text-slate-300 mb-4">Haklarınızı kullanmak için aşağıdaki iletişim bilgileri üzerinden tarafımıza başvurabilirsiniz:</p>
                        <div className="bg-white/10 rounded-lg p-4 space-y-2">
                            <p className="text-white font-semibold">GiderSE-Gelir</p>
                            <div className="space-y-1 text-slate-300 text-sm">
                                <p className="flex items-center">
                                    <Mail className="h-4 w-4 mr-2 text-emerald-400" />
                                    E-posta: info@giderse-gelir.com
                                </p>
                                <p className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-2 text-emerald-400" />
                                    Adres: Türkiye
                                </p>
                            </div>
                        </div>
                        <p className="text-slate-400 mt-4 text-xs italic">
                            Başvurularınız, talebin niteliğine göre en kısa sürede ve en geç otuz gün içinde ücretsiz olarak sonuçlandırılacaktır.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        onClick={() => router.push('/landing')}
                        className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white"
                    >
                        Ana Sayfaya Dön
                    </Button>
                </div>
            </div>
        </div>
    )
}

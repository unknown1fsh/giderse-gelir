'use client'

import { Shield, Lock, Eye, Database, FileText, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function PrivacyPolicyPage() {
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Gizlilik Politikası</h1>
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
          {/* Introduction */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <div className="flex items-start space-x-4 mb-4">
              <FileText className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Giriş</h2>
                <p className="text-slate-300 leading-relaxed">
                  GiderSE-Gelir olarak, kişisel verilerinizin korunmasına büyük önem veriyoruz. Bu
                  Gizlilik Politikası, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK)
                  kapsamında, kişisel verilerinizin nasıl toplandığı, işlendiği, saklandığı ve
                  korunduğu hakkında sizleri bilgilendirmek amacıyla hazırlanmıştır. Hizmetlerimizi
                  kullanarak, bu politikanın şartlarını kabul etmiş sayılırsınız.
                </p>
              </div>
            </div>
          </div>

          {/* Veri Sorumlusu */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <div className="flex items-start space-x-4 mb-4">
              <Database className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-4">1. Veri Sorumlusu</h2>
                <p className="text-slate-300 mb-4 leading-relaxed">
                  Kişisel verilerinizin işlenmesinden sorumlu olan veri sorumlusu:
                </p>
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <p className="text-white font-semibold">GiderSE-Gelir</p>
                  <div className="space-y-1 text-slate-300 text-sm">
                    <p className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-purple-400" />
                      Adres: Türkiye
                    </p>
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-purple-400" />
                      Telefon: +90 (5xx) xxx xx xx
                    </p>
                    <p className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-purple-400" />
                      E-posta: info@giderse-gelir.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Toplanan Veriler */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <div className="flex items-start space-x-4 mb-4">
              <Eye className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-4">2. Toplanan Kişisel Veriler</h2>
                <p className="text-slate-300 mb-4 leading-relaxed">
                  Hizmetlerimizi sunabilmek için aşağıdaki kişisel verilerinizi topluyoruz:
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">2.1. Kimlik Bilgileri</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                      <li>Ad, soyad</li>
                      <li>E-posta adresi</li>
                      <li>Telefon numarası</li>
                      <li>Doğum tarihi (opsiyonel)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">2.2. Finansal Veriler</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                      <li>Gelir ve gider kayıtları</li>
                      <li>Hesap bilgileri (banka adı, hesap numarası - şifrelenmiş)</li>
                      <li>Kredi kartı bilgileri (son 4 hanesi - tam bilgiler saklanmaz)</li>
                      <li>Yatırım ve portföy bilgileri</li>
                      <li>Otomatik ödeme kayıtları</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">2.3. Teknik Veriler</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                      <li>IP adresi</li>
                      <li>Tarayıcı türü ve versiyonu</li>
                      <li>Cihaz bilgileri</li>
                      <li>Kullanım logları ve analitik veriler</li>
                      <li>Çerez bilgileri</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      2.4. İletişim Verileri
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                      <li>Destek talepleri ve mesajlar</li>
                      <li>Geri bildirimler</li>
                      <li>E-posta iletişim geçmişi</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Veri İşleme Amaçları */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">
              3. Kişisel Verilerin İşlenme Amaçları
            </h2>
            <p className="text-slate-300 mb-4 leading-relaxed">
              Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
              <li>Finansal yönetim hizmetlerinin sunulması ve geliştirilmesi</li>
              <li>Kullanıcı hesabının oluşturulması ve yönetimi</li>
              <li>AI destekli finansal analiz ve önerilerin sunulması</li>
              <li>Güvenlik önlemlerinin alınması ve dolandırıcılığın önlenmesi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Müşteri hizmetleri ve destek süreçlerinin yürütülmesi</li>
              <li>Hizmet kalitesinin iyileştirilmesi ve kullanıcı deneyiminin geliştirilmesi</li>
              <li>Pazarlama ve iletişim faaliyetleri (izniniz dahilinde)</li>
              <li>Yasal uyuşmazlıkların çözümü</li>
            </ul>
          </div>

          {/* Hukuki Dayanak */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">
              4. Kişisel Verilerin İşlenmesinin Hukuki Dayanağı
            </h2>
            <p className="text-slate-300 mb-4 leading-relaxed">
              Kişisel verileriniz KVKK&apos;nın 5. ve 6. maddelerinde belirtilen aşağıdaki hukuki
              sebeplere dayanarak işlenmektedir:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
              <li>
                <strong className="text-white">Açık Rıza:</strong> Hizmetlerimizi kullanmak için
                verdiğiniz açık rıza
              </li>
              <li>
                <strong className="text-white">Sözleşmenin Kurulması veya İfası:</strong> Hizmet
                sözleşmesinin kurulması ve ifası için gerekli olan verilerin işlenmesi
              </li>
              <li>
                <strong className="text-white">Yasal Yükümlülük:</strong> Yasal düzenlemelerden
                kaynaklanan yükümlülüklerin yerine getirilmesi
              </li>
              <li>
                <strong className="text-white">Meşru Menfaat:</strong> Hizmetlerimizin
                geliştirilmesi ve güvenliğin sağlanması
              </li>
            </ul>
          </div>

          {/* Veri Güvenliği */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <div className="flex items-start space-x-4 mb-4">
              <Lock className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-4">5. Veri Güvenliği</h2>
                <p className="text-slate-300 mb-4 leading-relaxed">
                  Kişisel verilerinizin güvenliği için aşağıdaki teknik ve idari önlemleri
                  almaktayız:
                </p>
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">5.1. Teknik Önlemler</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                      <li>End-to-end şifreleme (SSL/TLS protokolleri)</li>
                      <li>Güvenli veri saklama ve yedekleme sistemleri</li>
                      <li>Düzenli güvenlik güncellemeleri ve yamalar</li>
                      <li>Güçlü şifreleme algoritmaları (AES-256)</li>
                      <li>İki faktörlü kimlik doğrulama (2FA) desteği</li>
                      <li>Düzenli güvenlik denetimleri ve penetrasyon testleri</li>
                    </ul>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">5.2. İdari Önlemler</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                      <li>Personel eğitimleri ve gizlilik taahhütleri</li>
                      <li>Erişim kontrolü ve yetkilendirme sistemleri</li>
                      <li>Düzenli güvenlik politikası gözden geçirmeleri</li>
                      <li>Olay müdahale planları</li>
                      <li>Veri işleme kayıtlarının tutulması</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                  <p className="text-purple-200 text-sm">
                    <strong>Önemli:</strong> Hassas finansal verileriniz asla düz metin olarak
                    saklanmaz. Tüm veriler endüstri standardı şifreleme yöntemleri ile
                    korunmaktadır.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Veri Paylaşımı */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">
              6. Kişisel Verilerin Paylaşılması
            </h2>
            <p className="text-slate-300 mb-4 leading-relaxed">
              Kişisel verileriniz, aşağıdaki durumlar dışında üçüncü kişilerle paylaşılmaz:
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">6.1. Hizmet Sağlayıcılar</h3>
                <p className="text-slate-300 mb-2">
                  Hizmetlerimizin sunulması için gerekli olan aşağıdaki hizmet sağlayıcılarla
                  sınırlı veri paylaşımı yapılmaktadır:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                  <li>Bulut altyapı sağlayıcıları (veri saklama)</li>
                  <li>Ödeme işlemcisi (PayTR - sadece ödeme bilgileri)</li>
                  <li>E-posta servis sağlayıcıları (bildirimler için)</li>
                  <li>Analitik servisleri (anonimleştirilmiş veriler)</li>
                </ul>
                <p className="text-slate-300 mt-2 text-sm italic">
                  Tüm hizmet sağlayıcılarımız KVKK uyumlu sözleşmeler ile bağlıdır.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">6.2. Yasal Zorunluluklar</h3>
                <p className="text-slate-300">
                  Yasal düzenlemeler, mahkeme kararları veya kamu otoritelerinin talepleri
                  doğrultusunda verileriniz paylaşılabilir.
                </p>
              </div>
            </div>
          </div>

          {/* Çerezler */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">7. Çerez Politikası</h2>
            <p className="text-slate-300 mb-4 leading-relaxed">
              Web sitemizde kullanıcı deneyimini iyileştirmek için çerezler kullanılmaktadır:
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">7.1. Zorunlu Çerezler</h3>
                <p className="text-slate-300">
                  Oturum yönetimi ve güvenlik için gerekli çerezler. Bu çerezler olmadan
                  hizmetlerimizi kullanamazsınız.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">7.2. Analitik Çerezler</h3>
                <p className="text-slate-300">
                  Web sitesi kullanımını analiz etmek için kullanılan çerezler. Bu çerezler anonim
                  veri toplar.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">7.3. Tercih Çerezleri</h3>
                <p className="text-slate-300">
                  Dil, tema gibi kullanıcı tercihlerini hatırlamak için kullanılan çerezler.
                </p>
              </div>
            </div>
            <p className="text-slate-300 mt-4 text-sm">
              Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz. Ancak bazı çerezlerin devre dışı
              bırakılması hizmetlerimizin çalışmasını etkileyebilir.
            </p>
          </div>

          {/* Kullanıcı Hakları */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">8. KVKK Kapsamındaki Haklarınız</h2>
            <p className="text-slate-300 mb-4 leading-relaxed">
              KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">✓ Bilgi Alma Hakkı</h3>
                <p className="text-slate-300 text-sm">
                  Kişisel verilerinizin işlenip işlenmediğini öğrenme
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">✓ Erişim Hakkı</h3>
                <p className="text-slate-300 text-sm">
                  İşlenen kişisel verileriniz hakkında bilgi talep etme
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">✓ Düzeltme Hakkı</h3>
                <p className="text-slate-300 text-sm">
                  Yanlış veya eksik verilerin düzeltilmesini isteme
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">✓ Silme Hakkı</h3>
                <p className="text-slate-300 text-sm">
                  KVKK şartları çerçevesinde verilerin silinmesini isteme
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">✓ İtiraz Hakkı</h3>
                <p className="text-slate-300 text-sm">Kişisel verilerin işlenmesine itiraz etme</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">✓ Taşınabilirlik Hakkı</h3>
                <p className="text-slate-300 text-sm">Verilerinizi başka bir hizmete aktarma</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <p className="text-blue-200 text-sm">
                <strong>Haklarınızı Kullanma:</strong> Yukarıdaki haklarınızı kullanmak için{' '}
                <a href="mailto:info@giderse-gelir.com" className="underline">
                  info@giderse-gelir.com
                </a>{' '}
                adresine yazılı başvuru yapabilir veya hesap ayarlarınızdan bazı işlemleri
                gerçekleştirebilirsiniz. Başvurularınız en geç 30 gün içinde yanıtlanacaktır.
              </p>
            </div>
          </div>

          {/* Veri Saklama */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">9. Veri Saklama Süreleri</h2>
            <p className="text-slate-300 mb-4 leading-relaxed">
              Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca saklanır:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
              <li>
                <strong className="text-white">Hesap Verileri:</strong> Hesabınız aktif olduğu
                sürece ve hesap silinmesinden sonra yasal saklama süreleri boyunca
              </li>
              <li>
                <strong className="text-white">Finansal Veriler:</strong> Hesap silinmesinden sonra
                10 yıl (mali mevzuat gereği)
              </li>
              <li>
                <strong className="text-white">İletişim Kayıtları:</strong> 3 yıl
              </li>
              <li>
                <strong className="text-white">Log Kayıtları:</strong> 1 yıl
              </li>
              <li>
                <strong className="text-white">Çerez Verileri:</strong> Çerez türüne göre oturum
                süresi veya maksimum 2 yıl
              </li>
            </ul>
            <p className="text-slate-300 mt-4 text-sm">
              Yasal saklama süreleri dolduğunda veya işleme amacı ortadan kalktığında verileriniz
              güvenli bir şekilde silinir veya anonimleştirilir.
            </p>
          </div>

          {/* Uluslararası Veri Transferi */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">10. Uluslararası Veri Transferi</h2>
            <p className="text-slate-300 leading-relaxed">
              Kişisel verileriniz, hizmetlerimizin sunulması için gerekli olması halinde,
              KVKK&apos;nın 9. maddesi uyarınca yeterli koruma seviyesine sahip ülkelere veya
              yeterli koruma garantisi veren sözleşmeler kapsamında transfer edilebilir. Tüm
              transferler KVKK ve ilgili mevzuata uygun olarak gerçekleştirilir.
            </p>
          </div>

          {/* Değişiklikler */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">
              11. Gizlilik Politikası Değişiklikleri
            </h2>
            <p className="text-slate-300 leading-relaxed">
              Bu Gizlilik Politikası, yasal düzenlemelerdeki değişiklikler veya hizmetlerimizdeki
              güncellemeler nedeniyle güncellenebilir. Önemli değişiklikler e-posta veya uygulama
              içi bildirim ile duyurulacaktır. Güncel politika her zaman bu sayfada yayınlanacaktır.
            </p>
          </div>

          {/* İletişim */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">12. İletişim</h2>
            <p className="text-slate-300 mb-4 leading-relaxed">
              Gizlilik politikamız hakkında sorularınız, önerileriniz veya haklarınızı kullanmak
              için bizimle iletişime geçebilirsiniz:
            </p>
            <div className="bg-white/10 rounded-lg p-4 space-y-2">
              <p className="text-white font-semibold">GiderSE-Gelir</p>
              <div className="space-y-1 text-slate-300 text-sm">
                <p className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-purple-400" />
                  E-posta: info@giderse-gelir.com
                </p>
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-purple-400" />
                  Telefon: +90 (5xx) xxx xx xx
                </p>
                <p className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-purple-400" />
                  Adres: Türkiye
                </p>
              </div>
            </div>
            <p className="text-slate-300 mt-4 text-sm">
              KVKK kapsamındaki başvurularınız için yukarıdaki iletişim bilgilerini kullanabilir
              veya Kişisel Verileri Koruma Kurulu&apos;na şikayette bulunabilirsiniz.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push('/landing')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            Ana Sayfaya Dön
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/terms')}
            className="border-white/30 text-white hover:bg-white/10"
          >
            Kullanım Şartları
          </Button>
        </div>
      </div>
    </div>
  )
}

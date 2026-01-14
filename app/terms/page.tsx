'use client'

import {
  FileText,
  Scale,
  Shield,
  CreditCard,
  AlertTriangle,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function TermsOfServicePage() {
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Kullanım Şartları</h1>
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
              <FileText className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Giriş ve Kabul</h2>
                <p className="text-slate-300 leading-relaxed">
                  Bu Kullanım Şartları, GiderSE-Gelir platformunu kullanımınızı düzenler. Platformu
                  kullanarak, bu şartları okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş
                  sayılırsınız. Eğer bu şartları kabul etmiyorsanız, lütfen platformu kullanmayın.
                  Bu şartlar, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve ilgili mevzuata
                  uygun olarak hazırlanmıştır.
                </p>
              </div>
            </div>
          </div>

          {/* Hizmet Tanımı */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">1. Hizmet Tanımı ve Kapsamı</h2>
            <p className="text-slate-300 mb-4 leading-relaxed">
              GiderSE-Gelir, kullanıcıların gelir ve giderlerini yönetmelerine, finansal analiz
              yapmalarına ve AI destekli öneriler almalarına olanak sağlayan bir finansal yönetim
              platformudur.
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">1.1. Sunulan Hizmetler</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                  <li>Gelir ve gider takibi</li>
                  <li>Hesap ve kredi kartı yönetimi</li>
                  <li>Otomatik ödeme takibi</li>
                  <li>Finansal analiz ve raporlama</li>
                  <li>AI destekli finansal öneriler</li>
                  <li>Yatırım portföyü takibi</li>
                  <li>Bütçe planlama ve hedef belirleme</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">1.2. Hizmet Kapsamı</h3>
                <p className="text-slate-300">
                  Platform, web ve mobil uygulamalar üzerinden erişilebilir. Hizmetler, abonelik
                  planlarına göre farklılık gösterebilir. Detaylı plan özellikleri platform içinde
                  belirtilmiştir.
                </p>
              </div>
            </div>
          </div>

          {/* Hesap Oluşturma */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">
              2. Hesap Oluşturma ve Kullanıcı Yükümlülükleri
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2.1. Hesap Oluşturma</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                  <li>Hesap oluşturmak için 18 yaşını doldurmuş olmanız gerekmektedir</li>
                  <li>Doğru, güncel ve eksiksiz bilgiler sağlamalısınız</li>
                  <li>E-posta adresinizi doğrulamalısınız</li>
                  <li>Güçlü bir şifre seçmeli ve şifrenizi gizli tutmalısınız</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  2.2. Kullanıcı Yükümlülükleri
                </h3>
                <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                  <li>Hesap bilgilerinizin güvenliğinden siz sorumlusunuz</li>
                  <li>Hesabınız üzerinden yapılan tüm işlemlerden sorumlusunuz</li>
                  <li>Yanlış veya yanıltıcı bilgi girmemelisiniz</li>
                  <li>Platformu yasalara aykırı amaçlarla kullanamazsınız</li>
                  <li>Başkalarının hesaplarına yetkisiz erişim sağlayamazsınız</li>
                  <li>Platformun güvenliğini tehdit edecek faaliyetlerde bulunamazsınız</li>
                  <li>Fikri mülkiyet haklarına saygı göstermelisiniz</li>
                </ul>
              </div>
              <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/30">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-200 text-sm">
                    <strong>Önemli:</strong> Hesap güvenliğinizden siz sorumlusunuz. Şüpheli bir
                    aktivite tespit ederseniz derhal bizimle iletişime geçin.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Güvenlik */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <div className="flex items-start space-x-4 mb-4">
              <Shield className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-4">3. Güvenlik ve Veri Koruma</h2>
                <p className="text-slate-300 mb-4 leading-relaxed">
                  Platformunuzun güvenliği için aşağıdaki önlemleri almanızı öneririz:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                  <li>Güçlü ve benzersiz bir şifre kullanın</li>
                  <li>İki faktörlü kimlik doğrulamayı (2FA) etkinleştirin</li>
                  <li>Şifrenizi düzenli olarak değiştirin</li>
                  <li>Hesabınıza başkalarının erişmesine izin vermeyin</li>
                  <li>Şüpheli e-postalara veya linklere tıklamayın</li>
                  <li>Güvenli internet bağlantıları kullanın</li>
                </ul>
                <p className="text-slate-300 mt-4">
                  Veri güvenliği konusunda detaylı bilgi için{' '}
                  <button
                    onClick={() => router.push('/privacy')}
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    Gizlilik Politikamızı
                  </button>{' '}
                  inceleyebilirsiniz.
                </p>
              </div>
            </div>
          </div>

          {/* Ödeme ve Fiyatlandırma */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <div className="flex items-start space-x-4 mb-4">
              <CreditCard className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-4">4. Ödeme ve Fiyatlandırma</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      4.1. Abonelik Planları
                    </h3>
                    <p className="text-slate-300 mb-2">
                      Platform, ücretsiz ve ücretli abonelik planları sunmaktadır. Plan özellikleri
                      ve fiyatları platform içinde belirtilmiştir.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                      <li>Ücretsiz Plan: Temel özellikler</li>
                      <li>Premium Plan: ₺250/ay</li>
                      <li>Kurumsal Plan: ₺450/ay</li>
                      <li>Kurumsal Premium Plan: Özel fiyatlandırma</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">4.2. Ödeme Koşulları</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                      <li>Ödemeler aylık veya yıllık olarak yapılabilir</li>
                      <li>Tüm fiyatlar KDV dahildir</li>
                      <li>Ödemeler güvenli ödeme sistemleri (PayTR) üzerinden alınır</li>
                      <li>Ödeme başarısız olursa hizmet askıya alınabilir</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      4.3. Fiyat Değişiklikleri
                    </h3>
                    <p className="text-slate-300">
                      Fiyat değişiklikleri önceden bildirilir. Mevcut abonelikleriniz için fiyat
                      değişikliği, yeni faturalandırma döneminde geçerli olur.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* İade ve İptal */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">5. İade ve İptal Koşulları</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">5.1. Cayma Hakkı</h3>
                <p className="text-slate-300 mb-2">
                  6502 sayılı Tüketicinin Korunması Hakkında Kanun&apos;un 15. maddesi uyarınca,
                  dijital içeriklerin anında teslim edilmesi durumunda, tüketici açıkça onay
                  vermedikçe cayma hakkı bulunmamaktadır.
                </p>
                <p className="text-slate-300">
                  Ancak, hizmetin başlamasından önce cayma hakkınızı kullanabilirsiniz. Hizmet
                  başladıktan sonra, aşağıdaki durumlarda iade talebinde bulunabilirsiniz:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4 mt-2">
                  <li>Hizmetin sözleşmeye uygun sunulmaması</li>
                  <li>Teknik sorunlar nedeniyle hizmetin kullanılamaması</li>
                  <li>Platform tarafından hizmetin sonlandırılması</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">5.2. Abonelik İptali</h3>
                <p className="text-slate-300">
                  Aboneliğinizi istediğiniz zaman iptal edebilirsiniz. İptal işlemi, mevcut fatura
                  döneminin sonunda geçerli olur. İptal edilen abonelikler için kısmi iade yapılmaz.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">5.3. İade İşlemleri</h3>
                <p className="text-slate-300">
                  İade talepleri,{' '}
                  <a
                    href="mailto:info@giderse-gelir.com"
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    info@giderse-gelir.com
                  </a>{' '}
                  adresine yapılmalıdır. Geçerli iade talepleri 14 iş günü içinde değerlendirilir ve
                  ödeme yapılan yönteme göre iade edilir.
                </p>
              </div>
            </div>
          </div>

          {/* Fikri Mülkiyet */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">6. Fikri Mülkiyet Hakları</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">6.1. Platform İçeriği</h3>
                <p className="text-slate-300">
                  Platform üzerindeki tüm içerikler (yazılım, tasarım, logo, marka, metin, grafik
                  vb.) GiderSE-Gelir&apos;e aittir ve telif hakları ile korunmaktadır. Bu içerikleri
                  izinsiz kopyalayamaz, dağıtamaz veya kullanamazsınız.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">6.2. Kullanıcı İçeriği</h3>
                <p className="text-slate-300">
                  Platforma yüklediğiniz veriler size aittir. Ancak, hizmetlerin sunulması için bu
                  verileri işleme hakkımız bulunmaktadır. Detaylı bilgi için Gizlilik Politikamızı
                  inceleyebilirsiniz.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">6.3. Lisans Kullanımı</h3>
                <p className="text-slate-300">
                  Platformu kullanarak, size özel, kişisel ve ticari olmayan kullanım için sınırlı
                  bir lisans verilir. Bu lisans, platformun kopyalanması, değiştirilmesi veya
                  dağıtılması hakkını içermez.
                </p>
              </div>
            </div>
          </div>

          {/* Sorumluluk Reddi */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">7. Sorumluluk Reddi</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">7.1. Hizmet Garantisi</h3>
                <p className="text-slate-300">
                  Platform &quot;olduğu gibi&quot; sunulmaktadır. Hizmetlerin kesintisiz, hatasız
                  veya güvenli olacağına dair garanti vermiyoruz. Teknik sorunlar, bakım çalışmaları
                  veya beklenmeyen durumlar nedeniyle hizmet kesintileri yaşanabilir.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">7.2. Finansal Tavsiye</h3>
                <p className="text-slate-300 mb-2">
                  Platform üzerinde sunulan AI önerileri ve analizler, yalnızca bilgilendirme
                  amaçlıdır ve finansal tavsiye niteliği taşımaz. Yatırım kararlarınızı almadan önce
                  profesyonel finansal danışmanlara başvurmanızı öneririz.
                </p>
                <div className="bg-red-500/20 rounded-lg p-4 border border-red-500/30 mt-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-200 text-sm">
                      <strong>Önemli:</strong> Platform üzerindeki öneriler ve analizler, yatırım
                      tavsiyesi değildir. Yatırım kararlarınızdan kaynaklanan zararlardan sorumlu
                      değiliz.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  7.3. Üçüncü Taraf Hizmetleri
                </h3>
                <p className="text-slate-300">
                  Platform, üçüncü taraf hizmetlerle entegre olabilir. Bu hizmetlerin kullanımından
                  kaynaklanan sorunlardan sorumlu değiliz.
                </p>
              </div>
            </div>
          </div>

          {/* Hizmet Değişiklikleri */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">
              8. Hizmet Değişiklikleri ve Fesih
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  8.1. Hizmet Değişiklikleri
                </h3>
                <p className="text-slate-300">
                  Platformu, önceden bildirimde bulunarak değiştirme, güncelleme veya sonlandırma
                  hakkımız saklıdır. Önemli değişiklikler e-posta veya platform içi bildirim ile
                  duyurulur.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">8.2. Hesap Feshi</h3>
                <p className="text-slate-300 mb-2">
                  Aşağıdaki durumlarda hesabınızı feshetme hakkımız saklıdır:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                  <li>Kullanım şartlarını ihlal etmeniz</li>
                  <li>Yasalara aykırı faaliyetlerde bulunmanız</li>
                  <li>Uzun süreli ödeme yapmamanız</li>
                  <li>Platform güvenliğini tehdit etmeniz</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">8.3. Veri Saklama</h3>
                <p className="text-slate-300">
                  Hesap feshi durumunda, yasal saklama süreleri boyunca verileriniz saklanabilir.
                  Detaylı bilgi için Gizlilik Politikamızı inceleyebilirsiniz.
                </p>
              </div>
            </div>
          </div>

          {/* Uyuşmazlık Çözümü */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">9. Uyuşmazlık Çözümü</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">9.1. Müzakere</h3>
                <p className="text-slate-300">
                  Herhangi bir uyuşmazlık durumunda, öncelikle müzakere yoluyla çözüm aranır.
                  Uyuşmazlıklar,{' '}
                  <a
                    href="mailto:info@giderse-gelir.com"
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    info@giderse-gelir.com
                  </a>{' '}
                  adresine yazılı başvuru ile iletilmelidir.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  9.2. Tüketici Hakem Heyeti
                </h3>
                <p className="text-slate-300">
                  6502 sayılı Kanun uyarınca, tüketici uyuşmazlıkları için Tüketici Hakem Heyetleri
                  ve Tüketici Mahkemeleri yetkilidir.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">9.3. Yetkili Mahkeme</h3>
                <p className="text-slate-300">
                  Uyuşmazlıkların çözülememesi durumunda, Türkiye Cumhuriyeti yasaları geçerlidir ve
                  İstanbul Mahkemeleri yetkilidir.
                </p>
              </div>
            </div>
          </div>

          {/* Genel Hükümler */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">10. Genel Hükümler</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  10.1. Şartların Değiştirilmesi
                </h3>
                <p className="text-slate-300">
                  Bu Kullanım Şartları, yasal düzenlemelerdeki değişiklikler veya hizmetlerimizdeki
                  güncellemeler nedeniyle değiştirilebilir. Önemli değişiklikler e-posta veya
                  platform içi bildirim ile duyurulacaktır.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">10.2. Bölünebilirlik</h3>
                <p className="text-slate-300">
                  Bu şartların herhangi bir hükmü geçersiz sayılırsa, diğer hükümler yürürlükte
                  kalır.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">10.3. Tam Anlaşma</h3>
                <p className="text-slate-300">
                  Bu Kullanım Şartları, platform kullanımına ilişkin taraflar arasındaki tam
                  anlaşmayı oluşturur.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">10.4. Yürürlük</h3>
                <p className="text-slate-300">
                  Bu şartlar, platformu kullandığınız andan itibaren yürürlüğe girer ve hesabınız
                  aktif olduğu sürece geçerlidir.
                </p>
              </div>
            </div>
          </div>

          {/* İletişim */}
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-blue-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">11. İletişim</h2>
            <p className="text-slate-300 mb-4 leading-relaxed">
              Kullanım şartları hakkında sorularınız, önerileriniz veya şikayetleriniz için bizimle
              iletişime geçebilirsiniz:
            </p>
            <div className="bg-white/10 rounded-lg p-4 space-y-2">
              <p className="text-white font-semibold">GiderSE-Gelir</p>
              <div className="space-y-1 text-slate-300 text-sm">
                <p className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-blue-400" />
                  E-posta: info@giderse-gelir.com
                </p>
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-blue-400" />
                  Telefon: +90 (5xx) xxx xx xx
                </p>
                <p className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                  Adres: Türkiye
                </p>
                Broadway, NY 10013, United States
              </div>
            </div>
            <p className="text-slate-300 mt-4 text-sm">
              Tüketici hakları kapsamındaki başvurularınız için yukarıdaki iletişim bilgilerini
              kullanabilir veya Tüketici Hakem Heyetlerine başvurabilirsiniz.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push('/landing')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            Ana Sayfaya Dön
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/privacy')}
            className="border-white/30 text-white hover:bg-white/10"
          >
            Gizlilik Politikası
          </Button>
        </div>
      </div>
    </div>
  )
}

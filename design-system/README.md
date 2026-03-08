# Design System & UI Architecture

Bu klasör, projemizin temel UI mimarisini ve kurallarını barındırır. Tüm frontend geliştirme süreçleri bu kurallara göre işletilmelidir.

## Klasör Sorumlulukları
- **`components/mosaic/`**: Uygulamanın tek kanonik UI katmanı. Temel primitive'ler, ortak page pattern'leri ve dashboard wrapper'ları burada toplanır. Bileşenler asla dışarıdan data fetch etmez, yalnızca prop ile beslenir.
- **`components/layout/`**: Sayfa iskeleti, Navbar, Sidebar, PageContainer gibi genel yerleşim bileşenleri.
- **`components/features/`**: Belirli bir domaine veya özelliğe ait karmaşık bileşenler (Örn: `PaymentForm`, `DashboardMetrics`). Bu bileşenler `mosaic` bileşenlerini kullanarak oluşturulur ve iş mantığı içerebilirler.
- **`design-system/`**: Renk paletleri, tipografi, boşluklama, tema ayarları ve kurallar bütünü.
- **`styles/`**: Global CSS değişkenleri, Tailwind override'ları.

## Mimari Kurallar

1. **İzolasyon Yok**: Hiçbir ortak kullanılabilecek UI yapısı (basit bir kart, özel bir buton stili, badge vb.) feature içine gömülerek izole edilmemelidir.
2. **Tekrar Testi**: Yeni bir arayüz geliştirilirken, önce `components/mosaic/` klasöründe uygun bileşen olup olmadığına bakılır. Varsa kullanılır. Yoksa ve bu bileşen başka bir yerde de kullanılabilecek genel bir yapıysa (örn: `FilterBar`), önce `mosaic` altına eklenir, sonra kullanılır.
3. **Stil Tekrarına Son**: Sayfa içinde (page.tsx) tekrar tekrar `className="flex items-center justify-between p-4 bg-white rounded-lg..."` gibi kalıplaşmış stiller yazılmamalıdır. Bunlar `SectionWrapper` veya `Card` gibi bileşenlerle soyutlanmalıdır.
4. **Data & UI Ayrımı**: Presentational (Görsel) UI ile Business Logic (İş Mantığı) ayrılmalıdır. Şık bir tablo bileşeni veriyi sadece çizer. Veriyi çekme ve filtreleme mantığı feature componentinde veya sayfa seviyesinde kalır.

Tüm detaylı Component isimlendirme ve geliştirme kuralları için [rules.md](./rules.md) dosyasına bakınız.

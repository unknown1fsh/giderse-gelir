# Frontend Development Rules & Standards

Bu doküman, yeni ekranların ve ortak bileşenlerin (common components) nasıl geliştirileceği konusunda kesin bir kural setidir.

## 1. Component İsimlendirme Standardı
- **Dosya/Klasör Adı:** `kebab-case` (Örn: `data-table.tsx`, `page-header.tsx`)
- **Component Adı:** `PascalCase` (Örn: `DataTable`, `PageHeader`)
- **Arayüz/Tip Adı:** `PascalCase` ve sonuna Props eklenerek (Örn: `ButtonProps`, `PageHeaderProps`)
- **Event Handler Prop'ları:** `on` ile başlamalı (Örn: `onClick`, `onValueChange`)

## 2. Tema Yapısı ve Renk Kullanımı (Mosaic Dark Theme)
- Uygulama, global olarak tanımlanmış CSS değişkenleri (CSS variables) ve Tailwind sınıfları üzerinden şekillendirilir.
- Renkler harcoded verilmemelidir. Yani `bg-[#1E293B]` yerine `bg-slate-900` veya `bg-background` kullanılmalıdır.
- Tailwind yapılandırmamız (`tailwind.config.js`) projedeki ana renkleri (`primary`, `secondary`, `destructive`, `muted` vb.) sağlayacaktır. Tüm UI bileşenleri bu semantik renkleri kullanmalıdır.

## 3. Responsive Stratejisi
- **Mobile First:** Geliştirme her zaman mobilden başlar.
- Normal class'lar mobil içindir (`p-4 flex-col`). Ekran büyüdükçe prefix'ler ile ezilir (`md:p-6 md:flex-row`).
- Breakpoint standartları (Tailwind varsayılan):
  - `sm`: Tablet portrait (640px)
  - `md`: Tablet landscape (768px)
  - `lg`: Desktop (1024px)
  - `xl`: Large Desktop (1280px)

## 4. Ortak Form Yapısı
Formlar, bağımsız input ve label'ların yan yana rastgele dizilmesiyle DEĞİL, ortak bir `FormField` veya `FormItem` bileşeni ile sarmalanarak oluşturulur.
Örnek Kullanım:
```tsx
<FormField label="Email Address" error={errors.email?.message}>
  <Input type="email" {...register('email')} />
</FormField>
```
Bu sayede label stili, boşluklama ve hata mesajı gösterimi uygulamanın her yerinde tek tip olur.

## 5. Ortak Tablo Yapısı
Tablolar, `components/mosaic/data-table.tsx` içindeki dinamik yapı kullanılarak oluşturulmalıdır. Tabloya sadece kolon tanımları (`columns`) ve veri (`data`) prop olarak geçilir. Responsive yatay scroll, loading iskeletleri ve boş durum (empty state) `DataTable` bileşeni içinde standart bir şekilde çözülür.

## 6. Sayfa Template Yaklaşımı
Her yeni sayfa şu yapıdadır:
```tsx
export default function UsersPage() {
  return (
    <PageContainer>
      <PageHeader 
        title="Kullanıcılar" 
        description="Sistemdeki tüm kullanıcıları yönetin."
        actions={<Button>Yeni Kullanıcı</Button>}
      />
      <FilterBar>
        {/* Search, Selects vs */}
      </FilterBar>
      <SectionWrapper>
        <DataTable data={users} columns={columns} />
      </SectionWrapper>
    </PageContainer>
  )
}
```

## 7. Mevcut Sayfaların Bu Yapıya Taşınması
- Önce mosaic bileşenleri (Button, Input, Card vb.) yeni standartlara uyumlu hale getirilir.
- Tek bir model sayfa (Örn: `(dashboard)/cards/page.tsx`) seçilerek tamamen yeni standartlarla refactor edilir.
- Diğer sayfalar zaman içinde peyderpey bu kullanıma geçirilir.
- Hiçbir eski sayfanın düzenlenmesi sırasında yeni, sayfa-spesifik inline stil veya lokal component yazılmasına izin verilmez. Eksik varsa `mosaic` içine eklenip genel olarak güncellenir.

# Build ve TypeScript Hatalarını Tespit Etme Komutları

## ADIM 1: TypeScript Hatalarını Kontrol Etme

TypeScript derleme hatalarını kontrol etmek için:

```bash
npm run typecheck
```

Bu komut tüm TypeScript dosyalarını kontrol eder ve hataları listeler (build yapmaz, sadece kontrol eder).

---

## ADIM 2: ESLint Hatalarını Kontrol Etme

Kod kalitesi ve linting hatalarını kontrol etmek için:

```bash
npm run lint:check
```

Bu komut ESLint kurallarına göre hataları tespit eder (düzeltme yapmaz).

**Not:** Eğer otomatik düzeltme isterseniz:

```bash
npm run lint
```

---

## ADIM 3: Format Kontrolü

Kod formatını kontrol etmek için:

```bash
npm run format:check
```

Bu komut Prettier kurallarına göre formatlamayı kontrol eder.

**Not:** Eğer otomatik formatlamak isterseniz:

```bash
npm run format
```

---

## ADIM 4: Tüm Validasyonları Çalıştırma

TypeScript + ESLint + Format kontrolünü tek seferde yapmak için:

```bash
npm run validate
```

Bu komut yukarıdaki 3 komutu sırayla çalıştırır.

---

## ADIM 5: Build Yapma (Production)

Production build yapmak ve build hatalarını görmek için:

```bash
npm run build
```

**Önemli:** `next.config.js` dosyasında şu an TypeScript ve ESLint hataları build sırasında ignore ediliyor:

- `typescript: { ignoreBuildErrors: true }`
- `eslint: { ignoreDuringBuilds: true }`

Bu yüzden build başarılı olsa bile hatalar olabilir. Gerçek hataları görmek için önce `npm run typecheck` çalıştırın.

---

## ADIM 6: Build Hatalarını Görme (Railway için)

Railway deployment için build:

```bash
npm run build:railway
```

Bu komut önce Prisma client'ı generate eder, sonra build yapar.

---

## ÖNEMLİ NOTLAR:

1. **İlk Çalıştırma:** Eğer `node_modules` yoksa:

   ```bash
   npm install
   ```

2. **Prisma Client:** Eğer Prisma schema değiştiyse:

   ```bash
   npx prisma generate
   ```

3. **Hata Kategorileri:**
   - TypeScript hataları: `npm run typecheck`
   - ESLint hataları: `npm run lint:check`
   - Build hataları: `npm run build`
   - Format hataları: `npm run format:check`

---

## ÖNERİLEN ÇALIŞMA SIRASI:

1. Önce TypeScript hatalarını kontrol et: `npm run typecheck`
2. Sonra ESLint hatalarını kontrol et: `npm run lint:check`
3. Format kontrolü yap: `npm run format:check`
4. Son olarak build yap: `npm run build`

Veya hepsini birden: `npm run validate && npm run build`

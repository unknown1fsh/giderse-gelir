import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Kategori metadata güncellemesi başlatılıyor...')

  // Tüm TX_CATEGORY parametrelerini al
  const categories = await prisma.systemParameter.findMany({
    where: { paramGroup: 'TX_CATEGORY', isActive: true },
  })

  console.log(`📊 ${categories.length} kategori bulundu`)

  let updated = 0
  let skipped = 0

  for (const category of categories) {
    const metadata = (category.metadata || {}) as Record<string, unknown>
    
    // Eğer zaten txTypeCode varsa atla
    if (metadata.txTypeCode) {
      skipped++
      continue
    }

    // txTypeId'yi al
    const txTypeId = metadata.txTypeId as number | undefined
    if (!txTypeId) {
      console.warn(`⚠️ Kategori ${category.id} (${category.paramCode}) için txTypeId bulunamadı`)
      skipped++
      continue
    }

    // refTxType'dan code'u bul
    const refTxType = await prisma.refTxType.findUnique({
      where: { id: txTypeId },
    })

    if (!refTxType) {
      console.warn(`⚠️ Kategori ${category.id} için refTxType bulunamadı (txTypeId: ${txTypeId})`)
      skipped++
      continue
    }

    // Metadata'yı güncelle
    const updatedMetadata = {
      ...metadata,
      txTypeCode: refTxType.code,
    }

    await prisma.systemParameter.update({
      where: { id: category.id },
      data: {
        metadata: updatedMetadata,
      },
    })

    updated++
    console.log(`✅ Kategori ${category.id} (${category.paramCode}) güncellendi: txTypeCode = ${refTxType.code}`)
  }

  console.log(`\n🎉 Güncelleme tamamlandı!`)
  console.log(`   - Güncellenen: ${updated}`)
  console.log(`   - Atlanan: ${skipped}`)
}

void (async () => {
  try {
    await main()
  } catch (error) {
    console.error('❌ Hata:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
})()


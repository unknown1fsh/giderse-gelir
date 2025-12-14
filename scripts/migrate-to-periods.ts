/**
 * Period System Migration Script
 *
 * Bu script mevcut kullanıcıların verilerini dönem sistemine taşır:
 * 1. Her kullanıcı için varsayılan "Tüm Zamanlar" dönemi oluşturur
 * 2. Mevcut tüm kayıtları bu döneme atar
 * 3. İlk aktif dönemi session'lara işler
 */

/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Period System Migration başlatılıyor...\n')

  try {
    // Tüm kullanıcıları al
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    console.log(`📊 ${users.length} kullanıcı bulundu\n`)

    for (const user of users) {
      console.log(`\n👤 ${user.name} (${user.email}) için migration yapılıyor...`)

      // 1) Aktif dönem varsa onu kullan
      let period = await prisma.period.findFirst({
        where: { userId: user.id, isActive: true, isClosed: false },
        orderBy: { startDate: 'desc' },
      })

      // 2) Aktif dönem yoksa: en son açık dönemi aktif yap
      if (!period) {
        const latestOpenPeriod = await prisma.period.findFirst({
          where: { userId: user.id, isClosed: false },
          orderBy: { startDate: 'desc' },
        })

        if (latestOpenPeriod) {
          await prisma.$transaction(async tx => {
            await tx.period.updateMany({
              where: { userId: user.id },
              data: { isActive: false },
            })
            period = await tx.period.update({
              where: { id: latestOpenPeriod.id },
              data: { isActive: true },
            })
          })
          console.log(`   ✅ Mevcut dönem aktif yapıldı: ${period?.name} (ID: ${period?.id})`)
        }
      }

      // 3) Hiç dönem yoksa varsayılan dönem oluştur
      if (!period) {
        const userCreatedYear = user.createdAt.getFullYear()
        const currentYear = new Date().getFullYear()

        period = await prisma.period.create({
          data: {
            userId: user.id,
            name: 'Tüm Zamanlar',
            periodType: 'CUSTOM',
            startDate: new Date(userCreatedYear, 0, 1), // Kullanıcının kayıt yılının başı
            endDate: new Date(currentYear, 11, 31), // Bu yılın sonu
            isClosed: false,
            isActive: true,
            description: 'Otomatik oluşturulan varsayılan dönem (migration)',
          },
        })

        console.log(`   ✅ Dönem oluşturuldu: ${period.name} (ID: ${period.id})`)
      }

      // periodId NULL olan kayıtları aktif döneme ata (idempotent)
      const updates = await Promise.allSettled([
        // Accounts
        prisma.account.updateMany({
          where: { userId: user.id, periodId: null },
          data: { periodId: period.id },
        }),
        // Credit Cards
        prisma.creditCard.updateMany({
          where: { userId: user.id, periodId: null },
          data: { periodId: period.id },
        }),
        // E-Wallets
        prisma.eWallet.updateMany({
          where: { userId: user.id, periodId: null },
          data: { periodId: period.id },
        }),
        // Transactions
        prisma.transaction.updateMany({
          where: { userId: user.id, periodId: null },
          data: { periodId: period.id },
        }),
        // Auto Payments
        prisma.autoPayment.updateMany({
          where: { userId: user.id, periodId: null },
          data: { periodId: period.id },
        }),
        // Gold Items
        prisma.goldItem.updateMany({
          where: { userId: user.id, periodId: null },
          data: { periodId: period.id },
        }),
        // Investments
        prisma.investment.updateMany({
          where: { userId: user.id, periodId: null },
          data: { periodId: period.id },
        }),
      ])

      // Sonuçları kontrol et
      let successCount = 0
      let failCount = 0

      updates.forEach((result, index) => {
        const entityNames = [
          'Accounts',
          'Credit Cards',
          'E-Wallets',
          'Transactions',
          'Auto Payments',
          'Gold Items',
          'Investments',
        ]

        if (result.status === 'fulfilled') {
          const count = (result.value as { count: number }).count || 0
          if (count > 0) {
            console.log(`   📦 ${entityNames[index]}: ${count} kayıt güncellendi`)
          }
          successCount++
        } else {
          console.error(`   ❌ ${entityNames[index]}: Hata - ${result.reason}`)
          failCount++
        }
      })

      // Session'lara aktif period'u işle
      const sessionUpdate = await prisma.userSession.updateMany({
        where: {
          userId: user.id,
          isActive: true,
          activePeriodId: null,
        },
        data: {
          activePeriodId: period.id,
        },
      })

      if (sessionUpdate.count > 0) {
        console.log(`   🔐 ${sessionUpdate.count} aktif session güncellendi`)
      }

      console.log(`   ✨ Migration tamamlandı (${successCount} başarılı, ${failCount} hata)`)
    }

    console.log('\n\n🎉 Period System Migration başarıyla tamamlandı!')
    console.log('\n📈 Özet:')

    // Genel istatistikler
    const stats = await prisma.period.groupBy({
      by: ['userId'],
      _count: true,
    })

    console.log(`   - Toplam dönem: ${stats.length}`)

    const totalRecords = await Promise.all([
      prisma.account.count(),
      prisma.creditCard.count(),
      prisma.eWallet.count(),
      prisma.transaction.count(),
      prisma.autoPayment.count(),
      prisma.goldItem.count(),
      prisma.investment.count(),
    ])

    console.log(`   - Accounts: ${totalRecords[0]}`)
    console.log(`   - Credit Cards: ${totalRecords[1]}`)
    console.log(`   - E-Wallets: ${totalRecords[2]}`)
    console.log(`   - Transactions: ${totalRecords[3]}`)
    console.log(`   - Auto Payments: ${totalRecords[4]}`)
    console.log(`   - Gold Items: ${totalRecords[5]}`)
    console.log(`   - Investments: ${totalRecords[6]}`)
  } catch (error) {
    console.error('\n❌ Migration sırasında hata oluştu:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})

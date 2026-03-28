/**
 * Migration: enterprise/enterprise_premium → premium/family
 *
 * enterprise       → premium  (Pro planı)
 * enterprise_premium → family  (Premium planı)
 *
 * Çalıştır: npx tsx scripts/migrate-enterprise-plans.ts
 */

import { prisma } from '../lib/prisma'

async function main() {
  console.log('Plan migration başlıyor...\n')

  // enterprise → premium
  const toProResult = await prisma.userSubscription.updateMany({
    where: { planId: 'enterprise' },
    data: { planId: 'premium' },
  })
  console.log(`enterprise → premium: ${toProResult.count} abonelik güncellendi`)

  // enterprise_premium → family
  const toPremiumResult = await prisma.userSubscription.updateMany({
    where: { planId: 'enterprise_premium' },
    data: { planId: 'family' },
  })
  console.log(`enterprise_premium → family: ${toPremiumResult.count} abonelik güncellendi`)

  console.log('\nMigration tamamlandı.')
}

main()
  .catch(err => {
    console.error('Migration hatası:', err)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  })

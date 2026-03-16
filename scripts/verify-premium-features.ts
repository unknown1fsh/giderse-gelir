import { PrismaClient } from '@prisma/client'
import { checkCreationLimit, getHistoryLimitDate } from '../lib/premium-middleware'
import { PLAN_LIMITS } from '../lib/plan-config'

const prisma = new PrismaClient()

async function main() {
  console.log('--- PREMIUM ÖZELLİK VE LİMİT DOĞRULAMASI ---')
  
  // Test users
  const freeUser = await prisma.user.findFirst({
    where: { plan: 'free' }
  })
  
  const premiumUser = await prisma.user.findFirst({
    where: { plan: 'premium' } // Family/Premium plan
  })

  // 1. Limit Doğrulaması (Hesaplar, Kartlar vs.)
  if (freeUser) {
    console.log(`\n1. Free Kullanıcı (${freeUser.email}) Limit Testi:`)
    const accountLimitReached = await checkCreationLimit(freeUser.id, 'accounts')
    console.log(`Hesap Limiti Aşılmış mı? ${accountLimitReached}`)
    const cardLimitReached = await checkCreationLimit(freeUser.id, 'creditCards')
    console.log(`Kart Limiti Aşılmış mı? ${cardLimitReached}`)
    const goalLimitReached = await checkCreationLimit(freeUser.id, 'goals')
    console.log(`Hedef Limiti Aşılmış mı? ${goalLimitReached}`)
    const budgetLimitReached = await checkCreationLimit(freeUser.id, 'budgets')
    console.log(`Bütçe Limiti Aşılmış mı? ${budgetLimitReached}`)
    const walletLimitReached = await checkCreationLimit(freeUser.id, 'ewallets')
    console.log(`E-Cüzdan Limiti Aşılmış mı? ${walletLimitReached}`)
  } else {
    console.log('\nVeritabanında Free kullanıcı bulunamadı.')
  }

  if (premiumUser) {
    console.log(`\n2. Premium Kullanıcı (${premiumUser.email}) Limit Testi:`)
    const accountLimitReached = await checkCreationLimit(premiumUser.id, 'accounts')
    console.log(`Hesap Limiti Aşılmış mı? ${accountLimitReached} (Beklenen: false)`)
    const walletLimitReached = await checkCreationLimit(premiumUser.id, 'ewallets')
    console.log(`E-Cüzdan Limiti Aşılmış mı? ${walletLimitReached} (Beklenen: false)`)
  } else {
    console.log('\nVeritabanında Premium kullanıcı bulunamadı.')
  }

  // 2. Geçmiş Veri Kilidi Testi
  console.log(`\n3. İşlem Geçmişi (History Date) Testi:`)
  const freeHistoryDate = getHistoryLimitDate('free')
  console.log(`Free Kullanıcı için işlem geçmişi başlangıç tarihi: ${freeHistoryDate?.toISOString()} (Son ${PLAN_LIMITS.free.transactionHistoryMonths} Ay)`)
  
  const premiumHistoryDate = getHistoryLimitDate('premium')
  console.log(`Premium Kullanıcı için işlem geçmişi başlangıç tarihi: ${premiumHistoryDate === null ? 'Limitsiz (null)' : premiumHistoryDate}`)

  console.log('\n--- DOĞRULAMA TAMAMLANDI ---\n')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

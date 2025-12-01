#!/usr/bin/env node

/**
 * Secret Key Generator
 *
 * Production deployment için güçlü secret key üretir.
 * Kullanım: node scripts/generate-secret.js
 */

import crypto from 'crypto'

console.log('\n🔐 Secret Key Generator\n')
console.log('━'.repeat(60))

// 32 byte = 256 bit güçlü secret key
const secret = crypto.randomBytes(32).toString('base64')

console.log('\n✨ Yeni secret key oluşturuldu:\n')
console.log(`   ${secret}`)
console.log('\n━'.repeat(60))
console.log('\n📋 Kullanım:')
console.log('   1. Railway Dashboard → Variables → Environment Variables')
console.log('   2. NEXTAUTH_SECRET değişkenini oluştur')
console.log('   3. Yukarıdaki değeri yapıştır')
console.log('   4. Production environment için aktif et')
console.log('\n⚠️  NOT: Bu değeri kimseyle paylaşmayın!')
console.log('\n')

// .env dosyasını güncelleme talimatı
console.log('💡 .env dosyanızı güncellemek için:')
console.log(`   NEXTAUTH_SECRET="${secret}"`)
console.log('\n')

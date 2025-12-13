import { exec } from 'child_process'
import { promisify } from 'util'
import { getTestLogger } from './helpers/test-logger'

const execAsync = promisify(exec)
const logger = getTestLogger()

// Bu script tüm testleri çalıştırır ve sonuçları log.txt'ye yazar.
async function main() {
  logger.logToConsole('========================================')
  logger.logToConsole('TÜM TESTLER ÇALIŞTIRILIYOR')
  logger.logToConsole('========================================\n')

  try {
    // Vitest ile tüm testleri çalıştır
    const { stdout, stderr } = await execAsync('npx vitest run --reporter=verbose', {
      cwd: process.cwd(),
      maxBuffer: 10 * 1024 * 1024, // 10MB
    })

    logger.logToConsole(stdout)
    if (stderr) {
      logger.logToConsole(`\nHata Çıktısı:\n${stderr}`)
    }

    logger.logToConsole('\n✅ Testler tamamlandı!\n')
  } catch (error: any) {
    logger.logToConsole(`\n❌ Test hatası: ${error.message}`)
    if (error.stdout) {
      logger.logToConsole(`\nÇıktı:\n${error.stdout}`)
    }
    if (error.stderr) {
      logger.logToConsole(`\nHata:\n${error.stderr}`)
    }
    process.exit(1)
  } finally {
    logger.writeSummary()
  }
}

main()

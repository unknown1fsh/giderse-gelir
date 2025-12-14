import fs from 'fs'
import path from 'path'

// Bu dosya test sonuçlarını log.txt'ye yazma işlevlerini içerir.

interface TestResult {
  testName: string
  endpoint: string
  method: string
  status: number
  duration: number
  success: boolean
  error?: string
  stackTrace?: string
}

interface TestSuiteResult {
  suiteName: string
  results: TestResult[]
  startTime: number
  endTime?: number
}

class TestLogger {
  private logFilePath: string
  private testResults: TestResult[] = []
  private suiteResults: TestSuiteResult[] = []
  private startTime: number = Date.now()

  constructor() {
    this.logFilePath = path.join(process.cwd(), 'log.txt')
    // Eski log dosyasını temizle
    if (fs.existsSync(this.logFilePath)) {
      fs.writeFileSync(this.logFilePath, '')
    }
  }

  // Test başlangıcını logla
  logTestStart(suiteName: string) {
    const suite: TestSuiteResult = {
      suiteName,
      results: [],
      startTime: Date.now(),
    }
    this.suiteResults.push(suite)
    this.writeToFile(`\n========================================\n`)
    this.writeToFile(`Test Suite: ${suiteName}\n`)
    this.writeToFile(`Başlangıç: ${new Date().toLocaleString('tr-TR')}\n`)
    this.writeToFile(`========================================\n\n`)
  }

  // Test sonucunu logla
  logTestResult(result: TestResult) {
    this.testResults.push(result)
    const currentSuite = this.suiteResults[this.suiteResults.length - 1]
    if (currentSuite) {
      currentSuite.results.push(result)
    }

    const icon = result.success ? '✅' : '❌'
    const statusText = this.getStatusText(result.status)
    const logLine = `${icon} ${result.method} ${result.endpoint} - ${statusText} (${result.duration}ms)`

    this.writeToFile(`  ${logLine}\n`)

    if (!result.success && result.error) {
      this.writeToFile(`    Hata: ${result.error}\n`)
      if (result.stackTrace) {
        this.writeToFile(`    Stack Trace: ${result.stackTrace}\n`)
      }
    }
  }

  // Test suite bitişini logla
  logTestEnd(suiteName: string) {
    const suite = this.suiteResults.find(s => s.suiteName === suiteName)
    if (suite) {
      suite.endTime = Date.now()
      const duration = suite.endTime - suite.startTime
      this.writeToFile(`\nSüre: ${duration}ms\n`)
      this.writeToFile(`========================================\n\n`)
    }
  }

  // Özet istatistikleri yaz
  writeSummary() {
    const endTime = Date.now()
    const totalDuration = endTime - this.startTime
    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter(r => r.success).length
    const failedTests = totalTests - passedTests
    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0.0'

    this.writeToFile(`\n\n`)
    this.writeToFile(`========================================\n`)
    this.writeToFile(`ÖZET İSTATİSTİKLER\n`)
    this.writeToFile(`========================================\n\n`)
    this.writeToFile(`Test Başlangıç: ${new Date(this.startTime).toLocaleString('tr-TR')}\n`)
    this.writeToFile(`Test Bitiş: ${new Date(endTime).toLocaleString('tr-TR')}\n`)
    this.writeToFile(`Toplam Süre: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)\n\n`)
    this.writeToFile(`Toplam Test: ${totalTests}\n`)
    this.writeToFile(`Başarılı: ${passedTests}\n`)
    this.writeToFile(`Başarısız: ${failedTests}\n`)
    this.writeToFile(`Başarı Oranı: ${successRate}%\n\n`)

    // Başarısız testleri listele
    const failedResults = this.testResults.filter(r => !r.success)
    if (failedResults.length > 0) {
      this.writeToFile(`========================================\n`)
      this.writeToFile(`BAŞARISIZ TESTLER\n`)
      this.writeToFile(`========================================\n\n`)
      failedResults.forEach((result, index) => {
        this.writeToFile(`${index + 1}. ${result.method} ${result.endpoint}\n`)
        this.writeToFile(`   Status: ${result.status} ${this.getStatusText(result.status)}\n`)
        if (result.error) {
          this.writeToFile(`   Hata: ${result.error}\n`)
        }
        this.writeToFile(`\n`)
      })
    }

    // Hata detayları
    if (failedResults.length > 0) {
      this.writeToFile(`========================================\n`)
      this.writeToFile(`HATA DETAYLARI\n`)
      this.writeToFile(`========================================\n\n`)
      failedResults.forEach((result, index) => {
        this.writeToFile(
          `[${index + 1}] ${result.testName} - ${result.method} ${result.endpoint}\n`
        )
        if (result.error) {
          this.writeToFile(`Hata Mesajı: ${result.error}\n`)
        }
        if (result.stackTrace) {
          this.writeToFile(`Stack Trace:\n${result.stackTrace}\n`)
        }
        this.writeToFile(`\n`)
      })
    }

    this.writeToFile(`========================================\n`)
  }

  // HTTP status kodunu metne çevir
  private getStatusText(status: number): string {
    const statusMap: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      422: 'Unprocessable Entity',
      500: 'Internal Server Error',
    }
    return statusMap[status] || `Status ${status}`
  }

  // Dosyaya yaz
  private writeToFile(content: string) {
    try {
      fs.appendFileSync(this.logFilePath, content, 'utf-8')
    } catch (error) {
      console.error('Log dosyasına yazma hatası:', error)
    }
  }

  // Console'a da yazdır
  logToConsole(message: string) {
    console.log(message)
    this.writeToFile(`${message}\n`)
  }
}

// Singleton instance
let loggerInstance: TestLogger | null = null

export function getTestLogger(): TestLogger {
  if (!loggerInstance) {
    loggerInstance = new TestLogger()
  }
  return loggerInstance
}

export function resetTestLogger() {
  loggerInstance = null
}

export type { TestResult, TestSuiteResult }

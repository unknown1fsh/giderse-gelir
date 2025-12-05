/**
 * Environment variables validasyonu
 * Uygulama başlangıcında tüm gerekli environment variable'ları kontrol eder
 */

interface EnvVar {
  name: string
  required: boolean
  description: string
  validate?: (value: string) => boolean | string
}

const requiredEnvVars: EnvVar[] = [
  {
    name: 'DATABASE_URL',
    required: true,
    description: "PostgreSQL veritabanı bağlantı URL'i",
    validate: value => {
      if (!value.startsWith('postgresql://')) {
        return 'DATABASE_URL postgresql:// ile başlamalıdır'
      }
      return true
    },
  },
  {
    name: 'JWT_SECRET',
    required: true,
    description: 'JWT token imzalama için secret key',
    validate: value => {
      if (value.length < 32) {
        return 'JWT_SECRET en az 32 karakter olmalıdır'
      }
      if (value === 'your-super-secret-jwt-key-change-in-production') {
        return 'JWT_SECRET production değeri değiştirilmelidir'
      }
      return true
    },
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: true,
    description: "Uygulamanın public URL'i",
    validate: value => {
      try {
        new URL(value)
        return true
      } catch {
        return 'NEXT_PUBLIC_APP_URL geçerli bir URL olmalıdır'
      }
    },
  },
]

const optionalEnvVars: EnvVar[] = [
  {
    name: 'RESEND_API_KEY',
    required: false,
    description: 'Resend email servisi API key',
    validate: value => {
      if (value && !value.startsWith('re_')) {
        return 'RESEND_API_KEY re_ ile başlamalıdır'
      }
      return true
    },
  },
  {
    name: 'PAYTR_MERCHANT_ID',
    required: false,
    description: 'PayTR merchant ID',
  },
  {
    name: 'PAYTR_MERCHANT_KEY',
    required: false,
    description: 'PayTR merchant key',
  },
  {
    name: 'PAYTR_MERCHANT_SALT',
    required: false,
    description: 'PayTR merchant salt',
  },
  {
    name: 'NODE_ENV',
    required: false,
    description: 'Node.js environment (development, production)',
    validate: value => {
      if (value && !['development', 'production', 'test'].includes(value)) {
        return 'NODE_ENV development, production veya test olmalıdır'
      }
      return true
    },
  },
  {
    name: 'OPENAI_API_KEY',
    required: false,
    description: 'OpenAI API key (AI Analiz Raporu için)',
    validate: value => {
      if (value && !value.startsWith('sk-')) {
        return 'OPENAI_API_KEY sk- ile başlamalıdır'
      }
      return true
    },
  },
]

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Tüm environment variable'ları validate eder
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required env vars kontrolü
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.name]

    if (!value) {
      if (envVar.required) {
        errors.push(`${envVar.name} eksik: ${envVar.description}`)
      } else {
        warnings.push(`${envVar.name} tanımlı değil: ${envVar.description}`)
      }
      continue
    }

    // Validation fonksiyonu varsa çalıştır
    if (envVar.validate) {
      const validationResult = envVar.validate(value)
      if (validationResult !== true) {
        errors.push(`${envVar.name}: ${validationResult}`)
      }
    }
  }

  // Optional env vars kontrolü (sadece tanımlıysa)
  for (const envVar of optionalEnvVars) {
    const value = process.env[envVar.name]

    if (value && envVar.validate) {
      const validationResult = envVar.validate(value)
      if (validationResult !== true) {
        warnings.push(`${envVar.name}: ${validationResult}`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Environment validation'ı çalıştırır ve hata varsa throw eder
 * Bu fonksiyon uygulama başlangıcında çağrılmalıdır
 */
export function assertEnvironmentValid(): void {
  // Development'ta daha az katı olabilir
  const isDevelopment = process.env.NODE_ENV === 'development'

  const result = validateEnvironment()

  // Errors'ı logla
  if (result.errors.length > 0) {
    console.error('❌ Environment Variable Errors:')
    result.errors.forEach(error => console.error(`  - ${error}`))

    if (!isDevelopment) {
      // Production'da hata varsa uygulamayı durdur
      throw new Error(`Environment validation failed: ${result.errors.join(', ')}`)
    }
  }

  // Warnings'ı logla
  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment Variable Warnings:')
    result.warnings.forEach(warning => console.warn(`  - ${warning}`))
  }

  if (result.valid) {
    console.log('✅ Environment variables validated successfully')
  }
}

/**
 * Belirli bir environment variable'ın varlığını kontrol eder
 */
export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`)
  }
  return value
}

/**
 * Belirli bir environment variable'ı optional olarak alır
 */
export function getEnv(name: string, defaultValue?: string): string | undefined {
  return process.env[name] || defaultValue
}

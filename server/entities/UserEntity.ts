import { BaseEntity } from './BaseEntity'

// Bu sınıf kullanıcı entity'sini tanımlar.
// Girdi: Kullanıcı bilgileri
// Çıktı: UserEntity instance
// Hata: -
export class UserEntity extends BaseEntity {
  email: string
  username: string
  name?: string
  phone?: string
  passwordHash: string
  emailVerified: boolean
  phoneVerified: boolean
  avatar?: string
  timezone: string
  language: string
  currency: string
  dateFormat: string
  numberFormat: string
  theme: string
  notifications: Record<string, unknown>
  settings: Record<string, unknown>
  role: string
  lastLoginAt?: Date
  isActive: boolean

  constructor(data: {
    id: number
    email: string
    username: string
    name?: string
    phone?: string
    passwordHash: string
    emailVerified: boolean
    phoneVerified: boolean
    avatar?: string
    timezone: string
    language: string
    currency: string
    dateFormat: string
    numberFormat: string
    theme: string
    notifications: Record<string, unknown>
    settings: Record<string, unknown>
    role: string
    lastLoginAt?: Date
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }) {
    super(data.id, data.createdAt, data.updatedAt)
    this.email = data.email
    this.username = data.username
    this.name = data.name
    this.phone = data.phone
    this.passwordHash = data.passwordHash
    this.emailVerified = data.emailVerified
    this.phoneVerified = data.phoneVerified
    this.avatar = data.avatar
    this.timezone = data.timezone
    this.language = data.language
    this.currency = data.currency
    this.dateFormat = data.dateFormat
    this.numberFormat = data.numberFormat
    this.theme = data.theme
    this.notifications = data.notifications
    this.settings = data.settings
    this.role = data.role
    this.lastLoginAt = data.lastLoginAt
    this.isActive = data.isActive
  }
}

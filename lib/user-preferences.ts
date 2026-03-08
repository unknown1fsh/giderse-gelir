export interface NotificationPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  weeklyReports: boolean
  monthlyReports: boolean
  paymentReminders: boolean
  budgetAlerts: boolean
  goalMilestones: boolean
  creditCardDueAlerts: boolean
  quietHoursStart: string | null
  quietHoursEnd: string | null
  reminderDaysBefore: number[]
}

export interface AppSettingsPreferences {
  autoBackup: boolean
  backupFrequency: string
  dataRetention: number
  exportFormat: string
  twoFactorAuth: boolean
  biometricAuth: boolean
  autoLogout: boolean
  sessionTimeout: number
  omniboxEntities: string[]
}

export interface UserPreferencesBundle {
  timezone: string
  language: string
  currency: string
  dateFormat: string
  numberFormat: string
  theme: string
  notifications: NotificationPreferences
  settings: AppSettingsPreferences
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  weeklyReports: true,
  monthlyReports: true,
  paymentReminders: true,
  budgetAlerts: true,
  goalMilestones: true,
  creditCardDueAlerts: true,
  quietHoursStart: null,
  quietHoursEnd: null,
  reminderDaysBefore: [7, 3, 1],
}

export const DEFAULT_APP_SETTINGS: AppSettingsPreferences = {
  autoBackup: true,
  backupFrequency: 'daily',
  dataRetention: 365,
  exportFormat: 'csv',
  twoFactorAuth: false,
  biometricAuth: true,
  autoLogout: true,
  sessionTimeout: 30,
  omniboxEntities: ['transactions', 'accounts', 'cards', 'goals', 'autoPayments'],
}

export const DEFAULT_USER_PREFERENCES: UserPreferencesBundle = {
  timezone: 'Europe/Istanbul',
  language: 'tr',
  currency: 'TRY',
  dateFormat: 'DD/MM/YYYY',
  numberFormat: '1.234,56',
  theme: 'light',
  notifications: DEFAULT_NOTIFICATION_PREFERENCES,
  settings: DEFAULT_APP_SETTINGS,
}

function asRecord(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {}
  }

  return input as Record<string, unknown>
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function normalizeNotificationPreferences(input: unknown): NotificationPreferences {
  const record = asRecord(input)

  return {
    emailNotifications: readBoolean(
      record.emailNotifications,
      DEFAULT_NOTIFICATION_PREFERENCES.emailNotifications
    ),
    pushNotifications: readBoolean(
      record.pushNotifications,
      DEFAULT_NOTIFICATION_PREFERENCES.pushNotifications
    ),
    smsNotifications: readBoolean(
      record.smsNotifications,
      DEFAULT_NOTIFICATION_PREFERENCES.smsNotifications
    ),
    weeklyReports: readBoolean(record.weeklyReports, DEFAULT_NOTIFICATION_PREFERENCES.weeklyReports),
    monthlyReports: readBoolean(
      record.monthlyReports,
      DEFAULT_NOTIFICATION_PREFERENCES.monthlyReports
    ),
    paymentReminders: readBoolean(
      record.paymentReminders,
      DEFAULT_NOTIFICATION_PREFERENCES.paymentReminders
    ),
    budgetAlerts: readBoolean(record.budgetAlerts, DEFAULT_NOTIFICATION_PREFERENCES.budgetAlerts),
    goalMilestones: readBoolean(
      record.goalMilestones,
      DEFAULT_NOTIFICATION_PREFERENCES.goalMilestones
    ),
    creditCardDueAlerts: readBoolean(
      record.creditCardDueAlerts,
      DEFAULT_NOTIFICATION_PREFERENCES.creditCardDueAlerts
    ),
    quietHoursStart:
      record.quietHoursStart === null
        ? null
        : readString(
            record.quietHoursStart,
            DEFAULT_NOTIFICATION_PREFERENCES.quietHoursStart ?? ''
          ) || null,
    quietHoursEnd:
      record.quietHoursEnd === null
        ? null
        : readString(record.quietHoursEnd, DEFAULT_NOTIFICATION_PREFERENCES.quietHoursEnd ?? '') ||
          null,
    reminderDaysBefore: Array.isArray(record.reminderDaysBefore)
      ? record.reminderDaysBefore.filter(
          (value): value is number => typeof value === 'number' && Number.isFinite(value)
        )
      : DEFAULT_NOTIFICATION_PREFERENCES.reminderDaysBefore,
  }
}

export function normalizeAppSettings(input: unknown): AppSettingsPreferences {
  const record = asRecord(input)

  return {
    autoBackup: readBoolean(record.autoBackup, DEFAULT_APP_SETTINGS.autoBackup),
    backupFrequency: readString(record.backupFrequency, DEFAULT_APP_SETTINGS.backupFrequency),
    dataRetention: readNumber(record.dataRetention, DEFAULT_APP_SETTINGS.dataRetention),
    exportFormat: readString(record.exportFormat, DEFAULT_APP_SETTINGS.exportFormat),
    twoFactorAuth: readBoolean(record.twoFactorAuth, DEFAULT_APP_SETTINGS.twoFactorAuth),
    biometricAuth: readBoolean(record.biometricAuth, DEFAULT_APP_SETTINGS.biometricAuth),
    autoLogout: readBoolean(record.autoLogout, DEFAULT_APP_SETTINGS.autoLogout),
    sessionTimeout: readNumber(record.sessionTimeout, DEFAULT_APP_SETTINGS.sessionTimeout),
    omniboxEntities: Array.isArray(record.omniboxEntities)
      ? record.omniboxEntities.filter(
          (value): value is string => typeof value === 'string' && value.length > 0
        )
      : DEFAULT_APP_SETTINGS.omniboxEntities,
  }
}

export function normalizeUserPreferences(input: Partial<UserPreferencesBundle> & {
  notifications?: unknown
  settings?: unknown
}): UserPreferencesBundle {
  return {
    timezone: readString(input.timezone, DEFAULT_USER_PREFERENCES.timezone),
    language: readString(input.language, DEFAULT_USER_PREFERENCES.language),
    currency: readString(input.currency, DEFAULT_USER_PREFERENCES.currency),
    dateFormat: readString(input.dateFormat, DEFAULT_USER_PREFERENCES.dateFormat),
    numberFormat: readString(input.numberFormat, DEFAULT_USER_PREFERENCES.numberFormat),
    theme: readString(input.theme, DEFAULT_USER_PREFERENCES.theme),
    notifications: normalizeNotificationPreferences(input.notifications),
    settings: normalizeAppSettings(input.settings),
  }
}

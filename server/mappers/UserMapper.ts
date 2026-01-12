import { User, UserSubscription } from '@prisma/client'
import { UserEntity } from '../entities/UserEntity'
import { UserDTO } from '../dto/UserDTO'

type UserWithSubscriptions = User & {
  subscriptions?: UserSubscription[]
}

// Bu sınıf User entity ve DTO dönüşümlerini sağlar.
export class UserMapper {
  // Bu metot Prisma User modelini UserEntity'e dönüştürür.
  // Girdi: Prisma User nesnesi
  // Çıktı: UserEntity instance
  // Hata: -
  static toEntity(prismaUser: User): UserEntity {
    return new UserEntity({
      id: prismaUser.id,
      email: prismaUser.email,
      username: prismaUser.username,
      usernameChangeCount: prismaUser.usernameChangeCount,
      name: prismaUser.name ?? undefined,
      phone: prismaUser.phone ?? undefined,
      passwordHash: prismaUser.passwordHash,
      emailVerified: prismaUser.emailVerified,
      phoneVerified: prismaUser.phoneVerified,
      avatar: prismaUser.avatar ?? undefined,
      timezone: prismaUser.timezone,
      language: prismaUser.language,
      currency: prismaUser.currency,
      dateFormat: prismaUser.dateFormat,
      numberFormat: prismaUser.numberFormat,
      theme: prismaUser.theme,
      notifications: prismaUser.notifications as Record<string, unknown>,
      settings: prismaUser.settings as Record<string, unknown>,
      role: prismaUser.role,
      lastLoginAt: prismaUser.lastLoginAt ?? undefined,
      isActive: prismaUser.isActive,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    })
  }

  // Bu metot UserEntity'yi UserDTO'ya dönüştürür.
  // Girdi: UserEntity ve plan bilgisi
  // Çıktı: UserDTO instance
  // Hata: -
  static toDTO(entity: UserEntity, plan: string): UserDTO {
    return new UserDTO({
      id: entity.id,
      email: entity.email,
      username: entity.username,
      usernameChangeCount: entity.usernameChangeCount,
      name: entity.name,
      phone: entity.phone,
      avatar: entity.avatar,
      plan,
      role: entity.role,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      lastLoginAt: entity.lastLoginAt,
    })
  }

  // Bu metot Prisma User nesnesini doğrudan UserDTO'ya dönüştürür.
  // Girdi: Prisma User nesnesi (subscriptions ile birlikte)
  // Çıktı: UserDTO instance
  // Hata: -
  static prismaToDTO(prismaUser: UserWithSubscriptions): UserDTO {
    const plan = prismaUser.subscriptions?.[0]?.planId ?? 'free'
    return new UserDTO({
      id: prismaUser.id,
      email: prismaUser.email,
      username: prismaUser.username,
      usernameChangeCount: prismaUser.usernameChangeCount,
      name: prismaUser.name ?? undefined,
      phone: prismaUser.phone ?? undefined,
      avatar: prismaUser.avatar ?? undefined,
      plan,
      role: prismaUser.role,
      isActive: prismaUser.isActive,
      createdAt: prismaUser.createdAt,
      lastLoginAt: prismaUser.lastLoginAt ?? undefined,
    })
  }
}

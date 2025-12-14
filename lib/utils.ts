import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Kullanıcı görüntüleme adı için helper fonksiyon
// Öncelik: username, fallback: name, son fallback: email'in kullanıcı adı kısmı
export function getDisplayName(user: {
  username?: string | null
  name?: string | null
  email?: string | null
}): string {
  if (user.username) {
    return user.username
  }
  if (user.name) {
    return user.name
  }
  if (user.email) {
    return user.email.split('@')[0]
  }
  return 'Kullanıcı'
}

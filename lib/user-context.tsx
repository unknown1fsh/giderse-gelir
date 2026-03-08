'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  name?: string
  email: string
  username: string
  usernameChangeCount: number
  phone?: string
  avatar?: string
  plan: string
  role: string
  isActive: boolean
  emailVerified: boolean
  timezone: string
  language: string
  currency: string
  dateFormat: string
  numberFormat: string
  theme: string
  notifications: Record<string, unknown>
  settings: Record<string, unknown>
  createdAt: Date
  lastLoginAt?: Date
}

interface UserContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (data: {
    name: string
    email: string
    phone?: string
    password: string
    plan?: string
  }) => Promise<boolean>
  logout: () => Promise<void>
  updateUser: (data: Partial<User>) => Promise<boolean>
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Geçerli sayfa korumalı bir sayfa mı kontrol et
  const isProtectedPage = (): boolean => {
    const currentPath = window.location.pathname
    const publicPaths = ['/landing', '/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-email', '/privacy', '/terms', '/cookie-policy', '/kvkk', '/demo', '/enterprise', '/enterprise-premium', '/payment']
    return !publicPaths.some(path => currentPath.startsWith(path))
  }

  // Geçerli sayfa public bir sayfa mı kontrol et
  const isPublicPage = (): boolean => {
    const currentPath = window.location.pathname
    const publicPaths = ['/landing', '/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-email', '/privacy', '/terms', '/cookie-policy', '/kvkk', '/demo', '/enterprise', '/enterprise-premium', '/payment']
    return publicPaths.some(path => currentPath.startsWith(path))
  }

  // Token geçersizse landing'e yönlendir
  const redirectToLandingIfNeeded = () => {
    if (isProtectedPage()) {
      router.push('/landing')
    }
  }

  // Kullanıcı bilgilerini al
  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (!response.ok) {
        // 401 hatası - kullanıcı giriş yapmamış
        if (response.status === 401) {
          setUser(null)
          redirectToLandingIfNeeded()
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = (await response.json()) as { success?: boolean; user?: User }

      if (data.success && data.user) {
        setUser(data.user)
      } else {
        // Kullanıcı giriş yapmamış
        setUser(null)
        redirectToLandingIfNeeded()
      }
    } catch (error) {
      // Sadece gerçek network hataları için log (401/403 hariç)
      if (
        error instanceof Error &&
        !error.message.includes('401') &&
        !error.message.includes('403')
      ) {
        console.error('Fetch user error:', error)
      }
      setUser(null)
      redirectToLandingIfNeeded()
    } finally {
      setLoading(false)
    }
  }

  // Giriş yapma
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = (await response.json()) as { success?: boolean; user?: User }

      if (data.success && data.user) {
        setUser(data.user)
        // Kullanıcı bilgilerini hemen güncelle
        await fetchUser()

        // Period context'e login olayını bildir
        window.dispatchEvent(new CustomEvent('user-logged-in'))

        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  // Kayıt olma
  const register = async (data: {
    name: string
    email: string
    phone?: string
    password: string
    plan?: string
  }): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = (await response.json()) as { success?: boolean; user?: User }

      if (result.success && result.user) {
        setUser(result.user)
        // Kullanıcı bilgilerini hemen güncelle
        await fetchUser()

        // Period context'e register olayını bildir
        window.dispatchEvent(new CustomEvent('user-logged-in'))

        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Register error:', error)
      return false
    }
  }

  // Çıkış yapma
  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      router.push('/landing')
    }
  }

  // Kullanıcı bilgilerini güncelleme
  const updateUser = async (data: Partial<User>): Promise<boolean> => {
    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = (await response.json()) as { success?: boolean; user?: User }

      if (result.success && result.user) {
        setUser(result.user)
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Update user error:', error)
      return false
    }
  }

  // Kullanıcı bilgilerini yenileme
  const refreshUser = async (): Promise<void> => {
    await fetchUser()
  }

  // Component mount olduğunda kullanıcı bilgilerini al (sadece korumalı sayfalarda)
  useEffect(() => {
    // Public sayfalarda API çağrısı yapma
    if (isPublicPage()) {
      setLoading(false)
      return
    }

    void fetchUser()

    // Plan değişikliklerini dinle
    const handlePlanChange = () => {
      void fetchUser()
    }

    window.addEventListener('plan-changed', handlePlanChange)
    // Periyodik olarak user bilgilerini yenile (5 dakikada bir)
    const interval = setInterval(
      () => {
        if (!isPublicPage()) {
          void fetchUser()
        }
      },
      5 * 60 * 1000
    )

    return () => {
      window.removeEventListener('plan-changed', handlePlanChange)
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value: UserContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

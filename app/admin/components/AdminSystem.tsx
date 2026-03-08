'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/mosaic'
import { Badge } from '@/components/mosaic'
import { Database, Server, Activity, Users } from 'lucide-react'

interface SystemStats {
  totalUsers: number
  totalTransactions: number
  totalAccounts: number
  totalInvestments: number
  databaseSize?: string
}

export default function AdminSystem() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchSystemStats()
  }, [])

  const fetchSystemStats = async () => {
    try {
      setLoading(true)
      // Bu endpoint'i oluşturabiliriz veya dashboard'dan alabiliriz
      const response = await fetch('/api/admin/dashboard', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Sistem istatistikleri alınamadı')
      }

      const result = (await response.json()) as {
        success: boolean
        data: {
          users: { total: number }
          transactions: { total: number }
          accounts: { total: number }
          investments: { total: number }
        }
      }
      if (result.success) {
        setStats({
          totalUsers: result.data.users.total,
          totalTransactions: result.data.transactions.total,
          totalAccounts: result.data.accounts.total,
          totalInvestments: result.data.investments.total,
        })
      }
    } catch (err) {
      console.error('System stats fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Kullanıcılar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              İşlemler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalTransactions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Hesaplar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalAccounts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Yatırımlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalInvestments || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sistem Bilgileri</CardTitle>
          <CardDescription>Sistem durumu ve genel bilgiler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sistem Durumu</span>
              <Badge variant="default">Aktif</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Veritabanı</span>
              <Badge variant="default">Bağlı</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">API Durumu</span>
              <Badge variant="default">Çalışıyor</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

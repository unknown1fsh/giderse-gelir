'use client'

import { useState, useEffect } from 'react'
import DataTable from './DataTable'
import UserDetailModal from './UserDetailModal'
import { Button } from '@/components/ui/button'
import type { UserDetail } from './UserDetailModal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, Trash2 } from 'lucide-react'

interface User {
  id: number
  email: string
  name: string
  phone?: string
  role: string
  plan: string
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState<boolean | null>(null)

  useEffect(() => {
    void fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, selectedRole, showActiveOnly])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
      })

      if (searchTerm) {
        params.append('search', searchTerm)
      }
      if (selectedRole && selectedRole !== 'all' && selectedRole !== '') {
        params.append('role', selectedRole)
      }
      if (showActiveOnly !== null) {
        params.append('isActive', showActiveOnly.toString())
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Kullanıcı listesi alınamadı')
      }

      const result = (await response.json()) as {
        success: boolean
        data: { users: User[]; pagination: { totalPages: number } }
      }
      if (result.success) {
        setUsers(result.data.users)
        setTotalPages(result.data.pagination.totalPages)
      }
    } catch (err) {
      console.error('Users fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (
    userId: number,
    updates: { role?: string; isActive?: boolean; planId?: string }
  ) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, ...updates }),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string }
        throw new Error(errorData.error || 'Kullanıcı güncellenemedi')
      }

      // Kullanıcı listesini yenile
      await fetchUsers()

      // Plan değişikliği varsa, kullanıcıya bildir
      if (updates.planId) {
        // Plan değişikliği event'i gönder
        window.dispatchEvent(new CustomEvent('plan-changed'))
      }

      alert('Kullanıcı başarıyla güncellendi')
    } catch (err) {
      console.error('Update user error:', err)
      alert(err instanceof Error ? err.message : 'Kullanıcı güncellenirken hata oluştu')
    }
  }

  const handleViewUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Kullanıcı detayı alınamadı')
      }

      interface UserCounts {
        accounts: number
        transactions: number
        periods: number
        subscriptions: number
      }

      const result = (await response.json()) as {
        success: boolean
        data: { user: User & { emailVerified: boolean; _count?: UserCounts }; counts?: UserCounts }
      }
      if (result.success) {
        // API'den gelen user verisini modal'a uygun formata dönüştür
        const userData: UserDetail = {
          ...result.data.user,
          _count: result.data.counts,
        }
        setSelectedUser(userData)
        setDetailModalOpen(true)
      }
    } catch (err) {
      console.error('User detail fetch error:', err)
      alert('Kullanıcı detayı yüklenirken hata oluştu')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Kullanıcı silinemedi')
      }

      await fetchUsers()
      alert('Kullanıcı başarıyla silindi')
    } catch (err) {
      console.error('Delete user error:', err)
      alert('Kullanıcı silinirken hata oluştu')
    }
  }

  const handleExport = () => {
    // CSV export
    const headers = ['ID', 'Ad Soyad', 'E-posta', 'Telefon', 'Rol', 'Plan', 'Durum', 'Kayıt Tarihi']
    const rows = users.map(user => [
      user.id,
      user.name,
      user.email,
      user.phone || '',
      user.role,
      user.plan,
      user.isActive ? 'Aktif' : 'Pasif',
      new Date(user.createdAt).toLocaleDateString('tr-TR'),
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `kullanicilar_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const columns = [
    {
      key: 'user',
      header: 'Kullanıcı',
      render: (user: User) => (
        <div className="flex items-center min-w-0">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4 min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">{user.name}</div>
            <div className="text-sm text-slate-500 truncate">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (user: User) => (
        <Select
          value={user.plan}
          onValueChange={value => {
            void handleUpdateUser(user.id, { planId: value })
          }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
            <SelectItem value="enterprise_premium">Enterprise Premium</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: 'role',
      header: 'Rol',
      render: (user: User) => (
        <Select
          value={user.role}
          onValueChange={value => {
            void handleUpdateUser(user.id, { role: value })
          }}
        >
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">USER</SelectItem>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
            <SelectItem value="ENTERPRISE">ENTERPRISE</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: 'status',
      header: 'Durum',
      render: (user: User) => (
        <Button
          variant={user.isActive ? 'default' : 'destructive'}
          size="sm"
          onClick={() => {
            void handleUpdateUser(user.id, { isActive: !user.isActive })
          }}
        >
          {user.isActive ? 'Aktif' : 'Pasif'}
        </Button>
      ),
    },
    {
      key: 'createdAt',
      header: 'Kayıt Tarihi',
      render: (user: User) => (
        <span className="text-sm text-slate-500">
          {new Date(user.createdAt).toLocaleDateString('tr-TR')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              void handleViewUser(user.id)
            }}
            title="Detayları Görüntüle"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              void handleDeleteUser(user.id)
            }}
            title="Sil"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Filtreler */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Ara (email, isim, telefon)..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Select
            value={selectedRole || undefined}
            onValueChange={value => {
              setSelectedRole(value === 'all' ? '' : value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tüm Roller" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Roller</SelectItem>
              <SelectItem value="USER">USER</SelectItem>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
              <SelectItem value="ENTERPRISE">ENTERPRISE</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={showActiveOnly === null ? 'all' : showActiveOnly.toString()}
            onValueChange={value => {
              setShowActiveOnly(value === 'all' ? null : value === 'true')
              setCurrentPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tüm Durumlar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="true">Aktif</SelectItem>
              <SelectItem value="false">Pasif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Kullanıcı Tablosu */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        searchable={false}
        pagination={{
          page: currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        exportable={true}
        onExport={handleExport}
        emptyMessage="Kullanıcı bulunamadı"
      />

      {/* Kullanıcı Detay Modal */}
      <UserDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        user={selectedUser}
        onUserUpdate={() => {
          void fetchUsers()
        }}
      />
    </div>
  )
}

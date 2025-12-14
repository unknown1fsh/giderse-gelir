'use client'

import { ReactNode, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Search, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  pagination?: {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
  }
  exportable?: boolean
  onExport?: () => void
  emptyMessage?: string
  className?: string
}

export default function DataTable<T extends { id: number | string }>({
  data,
  columns,
  loading = false,
  searchable = false,
  searchPlaceholder = 'Ara...',
  onSearch,
  pagination,
  exportable = false,
  onExport,
  emptyMessage = 'Veri bulunamadı',
  className,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState('')

  const handleSearch = (value: string) => {
    setSearchValue(value)
    onSearch?.(value)
  }

  const renderCell = (column: Column<T>, item: T) =>
    column.render
      ? column.render(item)
      : String((item as Record<string, unknown>)[column.key] ?? '')

  return (
    <div className={cn('space-y-4', className)}>
      {(searchable || exportable) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={e => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          {exportable && onExport && (
            <Button variant="outline" size="sm" onClick={onExport} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
          )}
        </div>
      )}

      {/* Mobil kart görünümü */}
      <div className="sm:hidden">
        {loading ? (
          <div className="border rounded-lg bg-white p-4">
            <div className="flex items-center gap-2 text-slate-600">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500" />
              <span>Yükleniyor...</span>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="border rounded-lg bg-white p-4 text-center text-slate-500">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-3">
            {data.map(item => {
              const primary = columns[0]
              const rest = columns.slice(1)
              return (
                <div key={item.id} className="border rounded-lg bg-white p-4 space-y-3">
                  {primary && <div className="min-w-0">{renderCell(primary, item)}</div>}
                  {rest.length > 0 && (
                    <div className="space-y-3">
                      {rest.map(column => (
                        <div key={column.key} className="min-w-0">
                          <div className="text-xs text-slate-500">{column.header}</div>
                          <div className="text-sm text-slate-900 break-words">
                            {renderCell(column, item)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Masaüstü tablo görünümü */}
      <div className="hidden sm:block border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(column => (
                <TableHead key={column.key}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-slate-600">Yükleniyor...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-slate-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map(item => (
                <TableRow key={item.id} className="hover:bg-slate-50">
                  {columns.map(column => (
                    <TableCell key={column.key}>{renderCell(column, item)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-600">
            Sayfa {pagination.page} / {pagination.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Önceki</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              <span className="hidden sm:inline">Sonraki</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

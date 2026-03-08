'use client'

import { ReactNode, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  SearchBox,
  FilterBar,
  Spinner,
  EmptyState,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/mosaic'
import { Download, FileQuestion } from 'lucide-react'
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

export default function AdminDataTable<T extends { id: number | string }>({
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
    <div className={cn('space-y-4 w-full', className)}>
      {(searchable || exportable) && (
        <FilterBar className="p-0 border-0 shadow-none bg-transparent">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full">
            {searchable && (
              <div className="flex-1 max-w-sm">
                <SearchBox
                  placeholder={searchPlaceholder}
                  onSearch={handleSearch}
                  defaultValue={searchValue}
                />
              </div>
            )}
            {exportable && onExport && (
              <Button variant="outline" size="default" onClick={onExport} className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Dışa Aktar
              </Button>
            )}
          </div>
        </FilterBar>
      )}

      {/* Mobil kart görünümü */}
      <div className="sm:hidden">
        {loading ? (
          <div className="border border-border rounded-xl bg-card p-8 flex items-center justify-center">
            <Spinner variant="primary" className="mr-3" /> Yükleniyor...
          </div>
        ) : data.length === 0 ? (
          <EmptyState title={emptyMessage} icon={<FileQuestion />} />
        ) : (
          <div className="space-y-4">
            {data.map(item => {
              const primary = columns[0]
              const rest = columns.slice(1)
              return (
                <div key={item.id} className="border border-border rounded-xl bg-card p-5 space-y-4">
                  {primary && <div className="font-semibold">{renderCell(primary, item)}</div>}
                  {rest.length > 0 && (
                    <div className="space-y-3">
                      {rest.map(column => (
                        <div key={column.key} className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground">{column.header}</span>
                          <div className="text-sm text-foreground break-words">
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
      <div className="hidden sm:block">
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
                <TableCell colSpan={columns.length} className="text-center py-12">
                  <div className="flex items-center justify-center text-muted-foreground">
                    <Spinner variant="primary" className="mr-3" /> Yükleniyor...
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-muted-foreground">
                  <EmptyState title={emptyMessage} icon={<FileQuestion />} className="border-0 bg-transparent" />
                </TableCell>
              </TableRow>
            ) : (
              data.map(item => (
                <TableRow key={item.id}>
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
        <Pagination className="justify-between">
          <div className="text-sm text-muted-foreground hidden sm:block">
            Sayfa {pagination.page} / {pagination.totalPages}
          </div>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
                aria-disabled={pagination.page === 1}
                className={pagination.page === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                aria-disabled={pagination.page === pagination.totalPages}
                className={pagination.page === pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

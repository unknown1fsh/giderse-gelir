'use client'

import { useState, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Column<T> {
    key?: string
    header: string
    accessorKey?: keyof T
    render?: (item: T) => React.ReactNode
    cell?: (item: T) => React.ReactNode
    sortable?: boolean
    className?: string
}

interface DataTableProps<T> {
    columns: Column<T>[]
    data: T[]
    searchable?: boolean
    searchPlaceholder?: string
    searchKeys?: string[]
    pageSize?: number
    emptyIcon?: React.ReactNode
    emptyMessage?: string
    emptyDescription?: string
    actions?: React.ReactNode
    onRowClick?: (item: T) => void
    className?: string
    getRowKey?: (item: T, index: number) => string | number
    keyExtractor?: (item: T, index: number) => string | number
    isLoading?: boolean
}

export default function DataTable<T extends Record<string, unknown>>({
    columns,
    data,
    searchable = false,
    searchPlaceholder = 'Ara...',
    searchKeys = [],
    pageSize = 10,
    emptyIcon,
    emptyMessage = 'Veri bulunamadı',
    emptyDescription,
    actions,
    onRowClick,
    className = '',
    getRowKey,
    keyExtractor,
    isLoading = false,
}: DataTableProps<T>) {
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(0)
    const [sortKey, setSortKey] = useState<string | null>(null)
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

    const filteredData = useMemo(() => {
        let result = [...data]

        // Search
        if (search && searchKeys.length > 0) {
            const q = search.toLowerCase()
            result = result.filter(item =>
                searchKeys.some(key => {
                    const val = item[key]
                    return val !== null && val !== undefined && String(val).toLowerCase().includes(q)
                }),
            )
        }

        // Sort
        if (sortKey) {
            result.sort((a, b) => {
                const aVal = a[sortKey] ?? ''
                const bVal = b[sortKey] ?? ''
                const cmp = String(aVal).localeCompare(String(bVal), 'tr', { numeric: true })
                return sortDir === 'asc' ? cmp : -cmp
            })
        }

        return result
    }, [data, search, searchKeys, sortKey, sortDir])

    const totalPages = Math.ceil(filteredData.length / pageSize)
    const pagedData = filteredData.slice(page * pageSize, (page + 1) * pageSize)
    const resolvedKeyExtractor = keyExtractor ?? getRowKey
    const normalizedColumns = columns.map((col, index) => ({
        ...col,
        resolvedKey: col.key ?? (typeof col.accessorKey === 'string' ? col.accessorKey : `column-${index}`),
        sortableKey: col.key ?? (typeof col.accessorKey === 'string' ? col.accessorKey : null),
    }))

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortKey(key)
            setSortDir('asc')
        }
    }

    return (
        <div className={cn('overflow-hidden rounded-xl border border-border/80 bg-card/95 shadow-sm', className)}>
            {/* Toolbar */}
            {(searchable || actions) && (
                <div className="flex flex-col items-stretch justify-between gap-3 border-b border-border/60 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center">
                    {searchable && (
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => {
                                    setSearch(e.target.value)
                                    setPage(0)
                                }}
                                placeholder={searchPlaceholder}
                                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                            />
                        </div>
                    )}
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border/60 bg-muted/10">
                            {normalizedColumns.map(col => (
                                <th
                                    key={col.resolvedKey}
                                    className={cn(
                                        'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground',
                                        col.sortable && col.sortableKey ? 'cursor-pointer select-none hover:text-foreground' : '',
                                        col.className
                                    )}
                                    onClick={() => col.sortable && col.sortableKey && handleSort(col.sortableKey)}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.header}
                                        {col.sortable && col.sortableKey && (
                                            <ArrowUpDown
                                                className={cn('h-3 w-3', sortKey === col.sortableKey ? 'text-primary' : 'text-muted-foreground/60')}
                                            />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={normalizedColumns.length} className="px-4 py-12 text-center text-muted-foreground">
                                    Yükleniyor...
                                </td>
                            </tr>
                        ) : pagedData.length > 0 ? (
                            pagedData.map((item, idx) => (
                                <tr
                                    key={resolvedKeyExtractor ? resolvedKeyExtractor(item, idx) : idx}
                                    className={cn('transition-colors hover:bg-muted/40', onRowClick ? 'cursor-pointer' : '')}
                                    onClick={() => onRowClick?.(item)}
                                >
                                    {normalizedColumns.map(col => (
                                        <td key={col.resolvedKey} className={cn('px-4 py-3 text-sm text-foreground', col.className)}>
                                            {col.render
                                                ? col.render(item)
                                                : col.cell
                                                    ? col.cell(item)
                                                    : col.accessorKey
                                                        ? (item[col.accessorKey] as React.ReactNode)
                                                        : col.key
                                                            ? (item[col.key] as React.ReactNode)
                                                            : null}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={normalizedColumns.length} className="px-4 py-12 text-center">
                                    {emptyIcon && <div className="flex justify-center mb-3">{emptyIcon}</div>}
                                    <p className="font-medium text-foreground">{emptyMessage}</p>
                                    {emptyDescription && (
                                        <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border/60 bg-muted/10 px-4 py-3">
                    <p className="text-sm text-muted-foreground">
                        {filteredData.length} kayıttan {page * pageSize + 1}-
                        {Math.min((page + 1) * pageSize, filteredData.length)} arası
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(0)}
                            disabled={page === 0}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="px-3 py-1 text-sm text-foreground">
                            {page + 1} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setPage(totalPages - 1)}
                            disabled={page >= totalPages - 1}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

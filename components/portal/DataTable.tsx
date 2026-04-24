'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import EmptyState from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: 'package' | 'file' | 'cart' | 'users';
  onRowClick?: (item: T) => void;
  rowActions?: (item: T) => { label: string; onClick: () => void; destructive?: boolean }[];
  className?: string;
  isRTL?: boolean;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = 'Search...',
  pageSize = 10,
  emptyTitle = 'No data available',
  emptyDescription,
  emptyIcon = 'package',
  onRowClick,
  rowActions,
  className,
  isRTL = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  // Filter
  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some((v) =>
        String(v).toLowerCase().includes(q)
      )
    );
  }, [data, search]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null || bVal == null) return 0;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className={cn('bg-white rounded-xl border border-gray-100 overflow-hidden', className)}>
      {/* Search */}
      {searchable && (
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 stroke-[1.5]', isRTL ? 'right-3' : 'left-3')} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder={searchPlaceholder}
              className={cn(
                'w-full py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]',
                isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3'
              )}
            />
          </div>
        </div>
      )}

      {/* Table */}
      {paged.length === 0 ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider',
                      isRTL ? 'text-right' : 'text-left',
                      col.sortable && 'cursor-pointer select-none hover:text-gray-700',
                      col.width
                    )}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <div className={cn('flex items-center gap-1.5', isRTL && 'flex-row-reverse')}>
                      {col.header}
                      {col.sortable && sortKey === col.key && (
                        sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 stroke-[1.5]" /> : <ChevronDown className="w-3.5 h-3.5 stroke-[1.5]" />
                      )}
                    </div>
                  </th>
                ))}
                {rowActions && (
                  <th className="px-6 py-3.5 w-12" />
                )}
              </tr>
            </thead>
            <tbody>
              {paged.map((item, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15, delay: i * 0.02 }}
                  className={cn(
                    'border-b border-gray-50 hover:bg-gray-50/50 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-6 py-4 text-sm text-gray-700',
                        isRTL ? 'text-right' : 'text-left'
                      )}
                    >
                      {col.render ? col.render(item) : String(item[col.key] ?? '')}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="px-6 py-4 relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === i ? null : i); }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400 stroke-[1.5]" />
                      </button>
                      <AnimatePresence>
                        {activeMenu === i && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.12 }}
                            className={cn(
                              'absolute top-full z-50 bg-white rounded-lg border border-gray-200 shadow-lg py-1 min-w-[140px]',
                              isRTL ? 'left-6' : 'right-6'
                            )}
                            onMouseLeave={() => setActiveMenu(null)}
                          >
                            {rowActions(item).map((action, ai) => (
                              <button
                                key={ai}
                                onClick={(e) => { e.stopPropagation(); action.onClick(); setActiveMenu(null); }}
                                className={cn(
                                  'w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors cursor-pointer',
                                  action.destructive && 'text-red-600 hover:bg-red-50',
                                  isRTL && 'text-right'
                                )}
                              >
                                {action.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={cn('px-6 py-4 border-t border-gray-100 flex items-center justify-between', isRTL && 'flex-row-reverse')}>
          <p className="text-sm text-gray-500">
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} / {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {isRTL ? <ChevronRight className="w-4 h-4 stroke-[1.5]" /> : <ChevronLeft className="w-4 h-4 stroke-[1.5]" />}
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNum = totalPages <= 5 ? i : Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                    page === pageNum ? 'bg-[#2D5A27] text-white' : 'hover:bg-gray-100 text-gray-600'
                  )}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {isRTL ? <ChevronLeft className="w-4 h-4 stroke-[1.5]" /> : <ChevronRight className="w-4 h-4 stroke-[1.5]" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

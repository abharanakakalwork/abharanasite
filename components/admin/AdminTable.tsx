'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface AdminTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function AdminTable<T extends { id: string | number }>({
  data,
  columns,
  onRowClick,
  isLoading,
  emptyMessage = "No records found in the sanctuary.",
  className
}: AdminTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#bc6746]" />
        <p className="text-xs font-black uppercase tracking-widest text-[#bc6746]/40">Gathering data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-[40px] border-2 border-dashed border-[#bc6746]/10 bg-white/20">
        <p className="text-sm italic text-[#4a3b32]/30">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-[40px] border border-[#f1e4da] bg-white/40 backdrop-blur-md shadow-xl transition-all", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#f1e4da] bg-[#bc6746]/5">
              {columns.map((column, i) => (
                <th 
                  key={i} 
                  className={cn(
                    "px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#bc6746]",
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1e4da]/50">
            {data.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "group transition-all hover:bg-white/80",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((column, i) => (
                  <td 
                    key={i} 
                    className={cn(
                      "px-6 py-4 text-sm text-[#4a3b32]/80 font-medium",
                      column.className
                    )}
                  >
                    {typeof column.accessor === 'function' 
                      ? column.accessor(item) 
                      : (item[column.accessor] as React.ReactNode)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

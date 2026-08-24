'use client';

import type { ReactNode } from 'react';

interface DataTableProps<T> {
  columns: Array<{ key: string; label: string; render?: (value: T[keyof T], row: T) => ReactNode }>;
  data: T[];
  rowActions?: (row: T) => ReactNode;
  emptyState?: ReactNode;
}

export default function DataTable<T>({ columns, data, rowActions, emptyState }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-white/95 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="bg-muted/70 text-slate-500 uppercase tracking-[0.2em] text-[0.72rem]">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-5 font-semibold text-slate-600">
                {column.label}
              </th>
            ))}
            {rowActions ? (
              <th className="px-4 py-5 font-semibold text-slate-600">Actions</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (rowActions ? 1 : 0)}
                className="px-4 py-12 text-center text-sm text-muted-foreground"
              >
                {emptyState ?? 'No records found.'}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-t border-white/10 last:border-b last:border-white/10"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 align-top text-slate-700">
                    {column.render
                      ? column.render(row[column.key as keyof T], row)
                      : String(row[column.key as keyof T] ?? '')}
                  </td>
                ))}
                {rowActions ? <td className="px-4 py-4 align-top">{rowActions(row)}</td> : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

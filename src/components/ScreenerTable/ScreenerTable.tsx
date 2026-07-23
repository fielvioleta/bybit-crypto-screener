'use client';

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Fragment, useMemo, useState } from 'react';
import type { StrategyDirection } from '@/lib/screener/constants';
import type { ScreenerMatch } from '@/lib/types';
import {
  formatPrice,
  formatRsi,
  formatTimestamp,
  formatVolume,
  isStrongRsi,
  strongRsiClassName,
} from '@/lib/utils';
import { ScreenerRowDetails } from './ScreenerRowDetails';

interface ScreenerTableProps {
  data: ScreenerMatch[];
  search: string;
  direction: StrategyDirection;
}

function RsiCell({ value, direction }: { value: number; direction: StrategyDirection }) {
  const isStrong = isStrongRsi(value, direction);
  return (
    <span className={isStrong ? strongRsiClassName(direction) : 'text-foreground'}>
      {formatRsi(value)}
    </span>
  );
}

export function ScreenerTable({ data, search, direction }: ScreenerTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'volume24h', desc: true },
  ]);
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<ScreenerMatch>[]>(
    () => [
      {
        accessorKey: 'symbol',
        header: 'Symbol',
        cell: ({ getValue }) => (
          <span className="font-semibold tracking-wide text-foreground">{String(getValue())}</span>
        ),
      },
      {
        accessorKey: 'currentPrice',
        header: 'Current Price',
        cell: ({ getValue }) => formatPrice(Number(getValue())),
      },
      {
        accessorKey: 'volume24h',
        header: '24H Volume',
        cell: ({ getValue }) => formatVolume(Number(getValue())),
      },
      {
        accessorKey: 'dailyRsi',
        header: 'Daily RSI',
        cell: ({ getValue }) => <RsiCell value={Number(getValue())} direction={direction} />,
      },
      {
        accessorKey: 'h4Rsi',
        header: '4H RSI',
        cell: ({ getValue }) => <RsiCell value={Number(getValue())} direction={direction} />,
      },
      {
        accessorKey: 'h1Rsi',
        header: '1H RSI',
        cell: ({ getValue }) => <RsiCell value={Number(getValue())} direction={direction} />,
      },
      {
        accessorKey: 'scannedAt',
        header: 'Last Updated',
        cell: ({ getValue }) => formatTimestamp(Number(getValue())),
      },
    ],
    [direction],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: search,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = String(filterValue).trim().toUpperCase();
      if (!query) {
        return true;
      }
      return row.original.symbol.includes(query);
    },
  });

  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-muted px-6 py-16 text-center">
        <p className="text-sm text-muted">No symbols currently satisfy your strategy.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="max-h-[70vh] overflow-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-surface-strong backdrop-blur">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className="px-4 py-3 font-medium whitespace-nowrap text-muted"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 transition hover:text-foreground"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === 'asc' ? (
                            <ChevronUpIcon className="h-3.5 w-3.5" />
                          ) : sorted === 'desc' ? (
                            <ChevronDownIcon className="h-3.5 w-3.5" />
                          ) : null}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => {
              const isExpanded = expandedSymbol === row.original.symbol;
              return (
                <Fragment key={row.id}>
                  <tr
                    className={`cursor-pointer border-b border-border transition hover:bg-hover ${
                      isExpanded ? 'bg-active' : ''
                    }`}
                    onClick={() =>
                      setExpandedSymbol((current) =>
                        current === row.original.symbol ? null : row.original.symbol,
                      )
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 whitespace-nowrap text-muted">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {isExpanded ? (
                    <tr className="border-b border-border">
                      <td colSpan={columns.length} className="p-0">
                        <ScreenerRowDetails row={row.original} direction={direction} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

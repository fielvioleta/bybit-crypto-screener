'use client';

import { ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { RefreshIntervalSelect } from '@/components/RefreshIntervalSelect';
import type { RefreshIntervalMinutes } from '@/lib/screener/constants';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isScanning: boolean;
  matchCount: number;
  refreshMinutes: RefreshIntervalMinutes;
  onRefreshMinutesChange: (value: RefreshIntervalMinutes) => void;
}

export function FilterBar({
  search,
  onSearchChange,
  onRefresh,
  isScanning,
  matchCount,
  refreshMinutes,
  onRefreshMinutesChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-sm">
        <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by symbol..."
          className="w-full rounded-lg border border-border bg-surface py-2.5 pr-3 pl-10 text-sm text-foreground placeholder:text-subtle outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <RefreshIntervalSelect
          value={refreshMinutes}
          onChange={onRefreshMinutesChange}
          disabled={isScanning}
        />
        <p className="text-sm text-muted">
          <span className="font-medium text-foreground">{matchCount}</span> matching
        </p>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isScanning}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition hover:border-border-strong hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
    </div>
  );
}

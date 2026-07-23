'use client';

import {
  ArrowPathIcon,
  ClockIcon,
  SignalIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import type { ReactNode } from 'react';
import { formatCountdown, formatTimestamp } from '@/lib/utils';
import type { ScanProgress } from '@/lib/types';

interface StatusBarProps {
  secondsUntilRefresh: number;
  currentTime: Date;
  progress: ScanProgress;
  totalSymbols: number;
  matchingSymbols: number;
  lastScanAt: number | null;
  isScanning: boolean;
}

export function StatusBar({
  secondsUntilRefresh,
  currentTime,
  progress,
  totalSymbols,
  matchingSymbols,
  lastScanAt,
  isScanning,
}: StatusBarProps) {
  const statusLabel = isScanning
    ? progress.message
    : progress.status === 'error'
      ? progress.message
      : 'Idle — waiting for next refresh';

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatusCard
        icon={<ArrowPathIcon className="h-5 w-5" />}
        label="Refresh countdown"
        value={isScanning ? 'Scanning...' : formatCountdown(secondsUntilRefresh)}
      />
      <StatusCard
        icon={<ClockIcon className="h-5 w-5" />}
        label="Current time"
        value={currentTime.toLocaleTimeString('en-US', { hour12: false })}
      />
      <StatusCard
        icon={<SignalIcon className="h-5 w-5" />}
        label="Scan status"
        value={statusLabel}
        emphasize={isScanning}
      />
      <StatusCard
        icon={<Squares2X2Icon className="h-5 w-5" />}
        label="Coverage"
        value={`${matchingSymbols} / ${totalSymbols || '—'} symbols`}
        hint={lastScanAt ? `Last scan ${formatTimestamp(lastScanAt)}` : 'No scan yet'}
      />
    </section>
  );
}

function StatusCard({
  icon,
  label,
  value,
  hint,
  emphasize = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  emphasize?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <div className="mb-2 flex items-center gap-2 text-subtle">
        {icon}
        <span className="text-xs tracking-wide uppercase">{label}</span>
      </div>
      <p
        className={`truncate text-sm font-medium ${
          emphasize ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
        }`}
        title={value}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 truncate text-xs text-subtle">{hint}</p> : null}
    </div>
  );
}

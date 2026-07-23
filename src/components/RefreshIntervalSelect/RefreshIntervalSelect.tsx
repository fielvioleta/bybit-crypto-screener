'use client';

import {
  REFRESH_INTERVAL_OPTIONS,
  type RefreshIntervalMinutes,
} from '@/lib/screener/constants';

interface RefreshIntervalSelectProps {
  value: RefreshIntervalMinutes;
  onChange: (value: RefreshIntervalMinutes) => void;
  disabled?: boolean;
}

export function RefreshIntervalSelect({
  value,
  onChange,
  disabled = false,
}: RefreshIntervalSelectProps) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-muted">
      <span className="whitespace-nowrap">Refresh every</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value) as RefreshIntervalMinutes)}
        className="rounded-lg border border-border bg-surface px-2.5 py-2 text-sm font-medium text-foreground outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {REFRESH_INTERVAL_OPTIONS.map((option) => (
          <option key={option.minutes} value={option.minutes}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

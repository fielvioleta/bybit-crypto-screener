'use client';

import type { ScanProfile } from '@/lib/screener/constants';

interface ScanProfileToggleProps {
  profile: ScanProfile;
  onChange: (profile: ScanProfile) => void;
  disabled?: boolean;
}

const OPTIONS: { id: ScanProfile; label: string; blurb: string }[] = [
  {
    id: 'early',
    label: 'Early / C-hunt',
    blurb: 'Mid-RSI assist → confirm on TV',
  },
  {
    id: 'momentum',
    label: 'Continuation',
    blurb: 'High-RSI confirmation only',
  },
];

export function ScanProfileToggle({
  profile,
  onChange,
  disabled = false,
}: ScanProfileToggleProps) {
  return (
    <div className="inline-flex rounded-xl border border-border bg-surface p-1">
      {OPTIONS.map((option) => {
        const active = profile === option.id;
        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={`rounded-lg px-3 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 ${
              active
                ? option.id === 'early'
                  ? 'bg-sky-500/15 text-sky-800 dark:text-sky-300'
                  : 'bg-zinc-500/15 text-foreground'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <span className="block text-sm font-semibold">{option.label}</span>
            <span className="block text-[11px] opacity-70">{option.blurb}</span>
          </button>
        );
      })}
    </div>
  );
}

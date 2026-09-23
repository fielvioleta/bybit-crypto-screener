'use client';

import type { StrategyDirection } from '@/lib/screener/constants';

interface StrategyToggleProps {
  direction: StrategyDirection;
  onChange: (direction: StrategyDirection) => void;
  disabled?: boolean;
}

const OPTIONS: { id: StrategyDirection; label: string; blurb: string }[] = [
  { id: 'long', label: 'Long', blurb: 'RSI momentum' },
  { id: 'short', label: 'Short', blurb: 'RSI oversold' },
];

export function StrategyToggle({ direction, onChange, disabled = false }: StrategyToggleProps) {
  return (
    <div className="inline-flex rounded-xl border border-border bg-surface p-1">
      {OPTIONS.map((option) => {
        const active = direction === option.id;
        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={`rounded-lg px-4 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
              active
                ? option.id === 'long'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
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
